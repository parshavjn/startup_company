import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Helper to get Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured. Please add it to your secrets or environment variables.');
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Robust helper function to execute content generation with model and feature fallbacks.
async function generateContentRobust(
  ai: GoogleGenAI,
  prompt: string,
  baseConfig: any
): Promise<any> {
  // Ordered preference of flash and pro models to handle capacity or demand issues.
  const models = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-pro'];
  
  // Phase 1: Try with Search Grounding enabled if configured in the baseConfig
  if (baseConfig.tools && baseConfig.tools.some((t: any) => t.googleSearch)) {
    for (const model of models) {
      try {
        console.log(`[robust-gen] Attempting grounded search generation with model: ${model}...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: baseConfig
        });
        return response;
      } catch (err: any) {
        const errMsg = err.message || JSON.stringify(err);
        console.warn(`[robust-gen] Grounded generation failed for ${model}:`, errMsg);
        
        // If it's a 429 quota exhaustion (which implies search grounding is disabled on this API key's billing plan),
        // skip trying grounding on other models, and transition directly to the static knowledge fallback phase.
        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
          console.warn("[robust-gen] Quota limit hit on grounded search. Skipping all grounded attempts and falling back to static generation.");
          break;
        }
      }
    }
  }

  // Phase 2: Fallback to static generation (without search grounding)
  const { tools, ...staticConfig } = baseConfig;
  let lastError: any = null;
  
  for (const model of models) {
    try {
      console.log(`[robust-gen] Attempting static knowledge generation with model: ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: staticConfig
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = err.message || JSON.stringify(err);
      console.warn(`[robust-gen] Static generation failed for ${model}:`, errMsg);
    }
  }

  throw lastError || new Error("All model candidates and configurations failed to generate content.");
}

// Helper to extract clean message and status code from model/upstream API errors
function handleApiError(res: Response, error: any, defaultContext: string) {
  let statusCode = 500;
  let friendlyMessage = error.message || `An unexpected error occurred during ${defaultContext}.`;
  
  if (error.message && typeof error.message === 'string') {
    try {
      const parsed = JSON.parse(error.message);
      const innerError = parsed.error || parsed;
      if (innerError && innerError.message) {
        friendlyMessage = innerError.message;
      }
      if (innerError && innerError.code) {
        statusCode = Number(innerError.code);
      }
    } catch {
      // Not JSON
    }
  }

  // Ensure statusCode is a valid HTTP status code
  if (statusCode < 100 || statusCode > 599) {
    statusCode = 500;
  }

  res.status(statusCode).json({
    success: false,
    error: friendlyMessage,
    code: statusCode
  });
}

// Helper to query Tavily AI for clean, LLM-optimized live search results
async function searchTavily(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY environment variable is not configured.');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: query,
      search_depth: 'basic',
      max_results: 6
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily search API failed: ${errorText}`);
  }

  const data = await response.json();
  const results = data.results || [];
  
  if (results.length === 0) {
    return 'No recent search results found for: ' + query;
  }

  return results.map((r: any, idx: number) => {
    return `[Search Result #${idx + 1}]
Title: ${r.title}
Source URL: ${r.url}
Content Snippet: ${r.content}
`;
  }).join('\n---\n\n');
}

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    vercelReady: true
  });
});

// 2. Discover and generate job guidelines for funded companies using Gemini Search Grounding
app.post('/api/search', async (req: Request, res: Response) => {
  try {
    const { targetRoles, skills, locationPreference, industryPreference } = req.body;

    const rolesList = Array.isArray(targetRoles) ? targetRoles.join(', ') : 'Software Engineer';
    const skillsList = Array.isArray(skills) ? skills.join(', ') : 'TypeScript, React';
    const location = locationPreference || 'Remote / Any';
    const industries = Array.isArray(industryPreference) && industryPreference.length > 0 
      ? industryPreference.join(', ') 
      : 'any tech sector';

    const ai = getGeminiClient();
    
    let tavilyResults = '';
    let useTavily = false;

    if (process.env.TAVILY_API_KEY) {
      try {
        const searchQuery = `venture capital funding rounds startups India announced 2025 2026 AI SaaS ${industries}`;
        console.log(`[tavily] Performing Tavily search for: "${searchQuery}"`);
        tavilyResults = await searchTavily(searchQuery);
        useTavily = true;
      } catch (tavilyError: any) {
        console.error('[tavily] Tavily search failed, falling back to Google Search Grounding:', tavilyError.message || tavilyError);
      }
    }

    const prompt = useTavily
      ? `Using the following live search results from Tavily, extract 4-5 real tech startups/companies based in India (with headquarters in Indian cities like Bengaluru, Mumbai, Delhi NCR, Gurgaon, Noida, Hyderabad, Pune, Chennai, etc.) that announced venture capital funding rounds (Seed, Series A, Series B, Series C, etc.) recently in late 2025 or early-middle 2026. Key filtering preference: Industry style is "${industries}". You MUST ONLY return real Indian companies found in the search results context.
      
CRITICAL FILTERING CRITERIA:
- Every company returned MUST strictly be an AI SaaS (Software-as-a-Service leveraging Artificial Intelligence) startup.
- DO NOT return companies focused on hardware, real estate, manufacturing, traditional consulting, or basic retail/e-commerce without a core AI software subscription model.

Live Web Search Results Context:
${tavilyResults}

For each company found, resolve and extract the active VC investors/funding participants who led or participated in this round, as well as a recruitment or general contact email ID.
      
Also, identify 2-3 key startup team members, co-founders, or engineering leaders (e.g., CEO, CTO, VP Engineering) with realistic or real LinkedIn profile URLs.

Additionally, identify 2-3 past job openings that were recently filled or active (e.g. "Senior Backend Engineer (Go) - Closed Q1 2026") and 2-3 future/expected job roles that they are likely hiring for next (e.g. "Lead React UI Developer - Expected Q3 2026").
      
For each company found, generate beautiful, high-value, highly specific job search guidelines tailored for a candidate with the following profile:
- Target Roles: ${rolesList}
- Key Skills: ${skillsList}
- Location preference: ${location}

Provide the output in standard JSON format conforming strictly to the requested schema. Ensure all fields are filled with realistic, search-validated, and highly customized advice, including:
1. Realistic, specific tactics to land a ${rolesList} role at each of these companies given their specific industry and product.
2. Bulleted custom advice for specific roles.
3. Actionable cold outreach templates and conversation starters for their key executives or hiring teams.
4. Practical, targeted technical and domain interview preparation guides (e.g., topics, technologies to learn before the interview).`
      : `Search for 4-5 real tech startups/companies based in India (with headquarters in Indian cities like Bengaluru, Mumbai, Delhi NCR, Gurgaon, Noida, Hyderabad, Pune, Chennai, etc.) that announced venture capital funding rounds (Seed, Series A, Series B, Series C, etc.) recently in late 2025 or early-middle 2026. Key filtering preference: Industry style is "${industries}". You MUST ONLY return real Indian companies.
      
CRITICAL FILTERING CRITERIA:
- Every company returned MUST strictly be an AI SaaS (Software-as-a-Service leveraging Artificial Intelligence) startup.
- DO NOT return companies focused on hardware, real estate, manufacturing, traditional consulting, or basic retail/e-commerce without a core AI software subscription model.

For each company found, resolve and extract the active VC investors/funding participants who led or participated in this round, as well as a recruitment or general contact email ID.
      
Also, identify 2-3 key startup team members, co-founders, or engineering leaders (e.g., CEO, CTO, VP Engineering) with realistic or real LinkedIn profile URLs.

Additionally, identify 2-3 past job openings that were recently filled or active (e.g. "Senior Backend Engineer (Go) - Closed Q1 2026") and 2-3 future/expected job roles that they are likely hiring for next (e.g. "Lead React UI Developer - Expected Q3 2026").
      
For each company found, generate beautiful, high-value, highly specific job search guidelines tailored for a candidate with the following profile:
- Target Roles: ${rolesList}
- Key Skills: ${skillsList}
- Location preference: ${location}

Provide the output in standard JSON format conforming strictly to the requested schema. Ensure all fields are filled with realistic, search-validated, and highly customized advice, including:
1. Realistic, specific tactics to land a ${rolesList} role at each of these companies given their specific industry and product.
2. Bulleted custom advice for specific roles.
3. Actionable cold outreach templates and conversation starters for their key executives or hiring teams.
4. Practical, targeted technical and domain interview preparation guides (e.g., topics, technologies to learn before the interview).`;

    let response;
    const configWithSearch = {
      // Enable search grounding to get real, recent facts
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        description: 'A list of recently funded tech companies with customized job application guidelines',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'The official name of the company' },
            fundingAmount: { type: Type.STRING, description: 'The funding amount raised (e.g. $15M, $5.2M)' },
            fundingRound: { type: Type.STRING, description: 'The funding stage (e.g. Seed, Series A, Series B, Grant)' },
            date: { type: Type.STRING, description: 'The date or month of funding announcement in 2025/2026' },
            industry: { type: Type.STRING, description: 'The primary industry or area of work' },
            description: { type: Type.STRING, description: 'A 2-3 sentence overview of their product, business, and what they do' },
            website: { type: Type.STRING, description: 'The estimated or real corporate website URL' },
            headquarters: { type: Type.STRING, description: 'City and state/country of headquarters' },
            investors: { type: Type.STRING, description: 'Key lead investors or VC firms involved in this funding round (e.g., Peak XV Partners, Accel, Elevation Capital)' },
            contactEmail: { type: Type.STRING, description: 'Corporate careers or engineering recruitment email contact ID (e.g., careers@company.com or contact@company.co)' },
            keyMembers: {
              type: Type.ARRAY,
              description: 'List of 2-3 key executive founders, co-founders, or key engineering leaders (e.g., CEO, CTO) with their real or estimated LinkedIn profile link',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Full name of the executive' },
                  role: { type: Type.STRING, description: 'Designation / job title (e.g., Co-founder & CEO)' },
                  linkedin: { type: Type.STRING, description: 'Absolute LinkedIn URL of the person' }
                },
                required: ['name', 'role', 'linkedin']
              }
            },
            pastJobs: {
              type: Type.ARRAY,
              description: '2-3 key past or recently filled engineering / tech roles',
              items: { type: Type.STRING }
            },
            futureJobs: {
              type: Type.ARRAY,
              description: '2-3 expected, future, or upcoming tech roles based on their recent funding expansion',
              items: { type: Type.STRING }
            },
            jobSearchGuideline: {
              type: Type.OBJECT,
              properties: {
                generalStrategy: { 
                  type: Type.STRING, 
                  description: 'Tactic on how to position oneself as a candidate. How does their recent funding announcement signal immediate hiring or engineering expansion needs?' 
                },
                specificRoles: {
                  type: Type.ARRAY,
                  description: 'Role-specific application advice',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      role: { type: Type.STRING, description: 'The exact target role name' },
                      advice: { type: Type.STRING, description: 'Actionable targeted advice explaining exactly how to structure the resume/GitHub to catch this company\'s attention' }
                    },
                    required: ['role', 'advice']
                  }
                },
                contactTips: { 
                  type: Type.STRING, 
                  description: 'A brief template or specific LinkedIn message concept to send to their decision-makers (CTO, VP of Engineering, Recruiter)' 
                },
                interviewTips: { 
                  type: Type.STRING, 
                  description: 'Specific technical topics, architectural challenges, or domain knowledge they will likely test on during the interviews' 
                }
              },
              required: ['generalStrategy', 'specificRoles', 'contactTips', 'interviewTips']
            }
          },
          required: [
            'name', 'fundingAmount', 'fundingRound', 'date', 'industry', 
            'description', 'website', 'headquarters', 'investors', 'contactEmail', 'keyMembers', 'pastJobs', 'futureJobs', 'jobSearchGuideline'
          ]
        }
      }
    };

    let config: any = configWithSearch;
    if (useTavily) {
      const { tools, ...configWithoutSearch } = configWithSearch;
      config = configWithoutSearch;
    }

    response = await generateContentRobust(ai, prompt, config);

    const jsonText = response.text || '[]';
    res.json(JSON.parse(jsonText.trim()));
  } catch (error: any) {
    console.error('Error generating funded companies:', error);
    handleApiError(res, error, 'company search and generation');
  }
});

// Helper to construct visually outstanding responsive startup email newsletter HTML
function createEmailHtml(companies: any[], profile: any): string {
  const rolesText = profile.targetRoles.join(', ');
  const skillsText = profile.skills.join(', ');
  
  const companyCards = companies.map((c) => `
    <div style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 24px; margin-bottom: 24px;">
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0; padding-right: 12px;">${c.name}</h2>
        <span style="background-color: #ecfdf5; color: #065f46; font-size: 13px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; display: inline-block; margin-top: 4px;">
          ${c.fundingRound} • ${c.fundingAmount}
        </span>
      </div>
      
      <p style="color: #6b7280; font-size: 13px; margin-top: 0; margin-bottom: 12px; font-family: monospace;">
        📍 ${c.headquarters} | 🌐 <a href="${c.website}" target="_blank" style="color: #3b82f6; text-decoration: none;">${c.website}</a> | 🏷️ ${c.industry}
      </p>
      
      <div style="background-color: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 16px; border: 1px solid #e2e8f0; font-size: 13px; color: #334155; font-family: sans-serif;">
        <div style="margin-bottom: 4px;"><strong>📅 Date of Funding:</strong> ${c.date}</div>
        <div style="margin-bottom: 4px;"><strong>🤝 Key Investors:</strong> ${c.investors}</div>
        <div><strong>✉️ Outreach Contact:</strong> <a href="mailto:${c.contactEmail}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${c.contactEmail}</a></div>
      </div>
      
      ${c.keyMembers && c.keyMembers.length > 0 ? `
      <div style="margin-bottom: 16px; font-size: 12px; font-family: sans-serif;">
         <strong style="color: #475569; display: block; margin-bottom: 6px; font-family: monospace; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">👥 Key Team & LinkedIn Profiles:</strong>
         <div>
          ${c.keyMembers.map((m: any) => {
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${m.name} ${c.name} LinkedIn`)}`;
            return `
              <a href="${googleSearchUrl}" target="_blank" style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 10px; text-decoration: none; color: #1e293b; font-weight: 500; font-size: 12px; margin-right: 6px; margin-bottom: 6px;" title="Google Search for ${m.name}'s LinkedIn Profile">
                <span style="color: #0a66c2; font-weight: bold; margin-right: 3px;">in</span>
                <strong>${m.name}</strong> <span style="color: #64748b; font-size: 11px;">(${m.role})</span> <span style="font-size: 10px; margin-left: 2px;">🔍</span>
              </a>
            `;
          }).join('')}
         </div>
      </div>
      ` : ''}

      <!-- Real-time Active Jobs Exploration -->
      <div style="margin-bottom: 14px; font-family: sans-serif;">
        <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #4f46e5; display: block; margin-bottom: 6px; font-family: monospace; letter-spacing: 0.05em;">🔎 Verified Real-Time Active Job Searches (No Fabricated Data):</span>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          <a href="https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(c.name)}" target="_blank" style="display: inline-block; background-color: #0077b5; border-radius: 6px; padding: 5px 11px; text-decoration: none; color: #ffffff; font-weight: 600; font-size: 11px; margin-right: 4px;">
            Search LinkedIn Jobs
          </a>
          <a href="https://www.google.com/search?q=${encodeURIComponent(`${c.name} careers engineering vacancies`)}" target="_blank" style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 11px; text-decoration: none; color: #334155; font-weight: 600; font-size: 11px; margin-right: 4px;">
            🌐 Google Jobs Search
          </a>
          <a href="${c.website}" target="_blank" style="display: inline-block; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 11px; text-decoration: none; color: #475569; font-weight: 600; font-size: 11px;">
            🏢 Careers Site
          </a>
        </div>
      </div>

      <!-- Past & Future Job Roles -->
      ${(c.pastJobs && c.pastJobs.length > 0) || (c.futureJobs && c.futureJobs.length > 0) ? `
      <div style="margin-bottom: 16px; font-family: sans-serif; font-size: 13px; background-color: #fafafa; border-radius: 8px; border: 1px solid #f0f0f0; padding: 12px;">
         <div style="font-size: 11px; color: #854d0e; background-color: #fef9c3; border-radius: 6px; padding: 8px; margin-bottom: 10px; line-height: 1.4;">
           <strong>💡 Hiring Signal Trend Log:</strong> The listings below represent high-level organizational benchmarks and target technology expansion departments deduced from public facts. Use the active portals above to view 100% real-time verified vacancies.
         </div>
         <div style="margin-bottom: 8px;">
            ${c.pastJobs && c.pastJobs.length > 0 ? `
              <div style="margin-bottom: 8px;">
                <strong style="color: #64748b; font-size: 9px; display: block; margin-bottom: 4px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.05em;">📦 Recent Growth Benchmarks (Past):</strong>
                <div style="color: #475569; font-size: 11.5px; line-height: 1.6; padding-left: 6px;">
                  ${c.pastJobs.map((j: string) => {
                    const clean = j.split(' - ')[0].replace(/\s*\(.*?\)\s*/g, ' ').trim();
                    const qUrl = `https://www.google.com/search?q=${encodeURIComponent(`${c.name} ${clean} careers OR vacancy OR job description`)}`;
                    return `• <a href="${qUrl}" target="_blank" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">${j} ↗</a>`;
                  }).join('<br>')}
                </div>
              </div>
            ` : ''}
            ${c.futureJobs && c.futureJobs.length > 0 ? `
              <div>
                <strong style="color: #059669; font-size: 9px; display: block; margin-bottom: 4px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.05em;">🚀 Expected Tech Expansion Roles (Future):</strong>
                <div style="color: #047857; font-size: 11.5px; line-height: 1.6; padding-left: 6px;">
                  ${c.futureJobs.map((j: string) => {
                    const clean = j.split(' - ')[0].replace(/\s*\(.*?\)\s*/g, ' ').trim();
                    const qUrl = `https://www.google.com/search?q=${encodeURIComponent(`${c.name} ${clean} careers OR apply OR direct`)}`;
                    return `• <a href="${qUrl}" target="_blank" style="color: #059669; text-decoration: underline; font-weight: 600;">${j} ↗</a>`;
                  }).join('<br>')}
                </div>
              </div>
            ` : ''}
         </div>
      </div>
      ` : ''}
      
      <p style="color: #374151; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
        ${c.description}
      </p>
      
      <div style="border-top: 1px dashed #e5e7eb; padding-top: 16px; margin-top: 16px;">
        <h3 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace;">
          ⚡ Tailored Job Strategy
        </h3>
        
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
          <strong>Growth Signaling Strategy:</strong> ${c.jobSearchGuideline.generalStrategy}
        </p>

        <div style="margin-bottom: 12px;">
          <strong style="color: #4b5563; font-size: 14px; display: block; margin-bottom: 4px;">Role Specific Positioning:</strong>
          ${c.jobSearchGuideline.specificRoles.map((r: any) => `
            <div style="background-color: #f9fafb; border-left: 3px solid #3b82f6; padding: 8px 12px; margin-bottom: 6px; font-size: 13.5px; color: #374151;">
              <strong>${r.role}:</strong> ${r.advice}
            </div>
          `).join('')}
        </div>

        <div style="background-color: #eff6ff; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <strong style="color: #1e40af; font-size: 13.5px; display: block; margin-bottom: 6px; font-family: monospace;">📨 Cold Outreach Message Hook:</strong>
          <p style="color: #1e3a8a; font-size: 13px; line-height: 1.5; margin: 0; font-style: italic;">
            ${c.jobSearchGuideline.contactTips.replace(/\n/g, '<br>')}
          </p>
        </div>

        <div>
          <strong style="color: #4b5563; font-size: 14px; display: block; margin-bottom: 4px; font-family: monospace;">🧠 Interview Prep Prep Topics:</strong>
          <p style="color: #4b5563; font-size: 13.5px; line-height: 1.6; margin: 0;">
            ${c.jobSearchGuideline.interviewTips}
          </p>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weekly Funded Startup Digest</title>
    </head>
    <body style="background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 30px 15px; margin: 0; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 0 auto;">
        
        <!-- Header Banner -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111827; border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center;">
          <tr>
            <td>
              <span style="font-size: 12px; font-weight: 700; color: #60a5fa; letter-spacing: 0.1em; text-transform: uppercase; font-family: monospace; display: block; margin-bottom: 8px;">
                INTELLIGENT RECRUITING AGENT
              </span>
              <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.025em;">
                🚀 Funded Startups Hiring Digest
              </h1>
              <p style="font-size: 14px; color: #9ca3af; margin: 12px 0 0 0; line-height: 1.5;">
                Recently funded tech companies matching your role and skill metrics.
              </p>
            </td>
          </tr>
        </table>

        <!-- Summary & Profile Context -->
        <div style="background-color: #ffffff; border-radius: 0 0 12px 12px; padding: 24px; border: 1px solid #e5e7eb; border-top: none; margin-bottom: 24px;">
          <h3 style="font-size: 14px; font-weight: 700; color: #374151; margin-top: 0; margin-bottom: 8px; font-family: monospace;">
            🎯 RECIPIENT PROFILE
          </h3>
          <table width="100%" style="font-size: 13.5px; color: #4b5563; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 6px 0; font-weight: 600; width: 120px;">Target Roles:</td>
              <td style="padding: 6px 0; color: #111827;">${rolesText}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 6px 0; font-weight: 600;">Key Skills:</td>
              <td style="padding: 6px 0; color: #111827;">${skillsText}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Locations:</td>
              <td style="padding: 6px 0; color: #111827;">${profile.locationPreference}</td>
            </tr>
          </table>
        </div>

        <!-- Discovered Startups Header -->
        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 15px; font-weight: 800; color: #4b5563; margin: 0; letter-spacing: 0.05em; text-transform: uppercase; font-family: monospace;">
            💼 Discovered Companies (${companies.length})
          </h2>
        </div>

        <!-- Main Cards -->
        ${companyCards}

        <!-- Bottom Footer -->
        <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; font-family: monospace;">
          <p style="margin: 0 0 6px 0;">This email was sent by your Recently Funded Tech Agent.</p>
          <p style="margin: 0;">Deploy on Vercel to schedule complete automated cron triggers on weekly intervals.</p>
        </div>

      </div>
    </body>
    </html>
  `;
}

// 3. Send email to configured destination
app.post('/api/send-email', async (req: Request, res: Response) => {
  try {
    const { companies, profile, settings } = req.body;

    if (!companies || companies.length === 0) {
      return res.status(400).json({ error: 'No company details available to email' });
    }

    if (!profile || !profile.email) {
      return res.status(400).json({ error: 'A recipient email address is required in the profile' });
    }

    const emailHtml = createEmailHtml(companies, profile);
    const subject = `🚀 Funded Startup Job Pipeline: ${companies.length} New Leads Matching ${profile.targetRoles[0] || 'Your Profile'}`;

    // Dynamic configuration allows instant testing in preview, or fallback to server env
    const emailProvider = settings?.provider || 'sandbox';

    if (emailProvider === 'sandbox') {
      // Simulate/sandbox success
      return res.json({
        success: true,
        provider: 'sandbox',
        recipient: profile.email,
        subject,
        message: 'Email drafted and simulated successfully. In sandbox mode, no actual mail was routed, but the complete HTML newsletter output has been rendered in your email log timeline.',
        html: emailHtml
      });
    }

    let sentInfo = null;

    if (emailProvider === 'resend' || process.env.RESEND_API_KEY) {
      const apiKey = settings?.resendApiKey || process.env.RESEND_API_KEY;
      const fromAddr = settings?.fromEmail || process.env.FROM_EMAIL || 'onboarding@resend.dev';
      
      if (!apiKey) {
        return res.status(400).json({ error: 'Resend API Key is missing. Provide it in settings or RESEND_API_KEY env secret.' });
      }

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddr,
          to: profile.email,
          subject: subject,
          html: emailHtml
        })
      });

      if (!resendRes.ok) {
        const errorBody = await resendRes.text();
        throw new Error(`Resend API failed: ${errorBody}`);
      }

      sentInfo = await resendRes.json();
    } else if (emailProvider === 'smtp') {
      const host = settings?.smtpHost || process.env.SMTP_HOST;
      const port = Number(settings?.smtpPort || process.env.SMTP_PORT || 465);
      const user = settings?.smtpUser || process.env.SMTP_USER;
      const pass = settings?.smtpPass || process.env.SMTP_PASS;
      const fromAddr = settings?.fromEmail || process.env.FROM_EMAIL || user;

      if (!host || !user || !pass) {
        return res.status(400).json({ error: 'SMTP configurations (host, user, password) are missing. Check your settings panel.' });
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465 || port === 993,
        auth: { user, pass }
      });

      sentInfo = await transporter.sendMail({
        from: fromAddr,
        to: profile.email,
        subject: subject,
        html: emailHtml
      });
    }

    res.json({
      success: true,
      provider: emailProvider,
      recipient: profile.email,
      subject,
      sentInfo,
      message: `Direct recruitment newsletter email sent successfully via ${emailProvider}! Check your inbox at ${profile.email}.`,
      html: emailHtml
    });

  } catch (error: any) {
    console.error('Error sending email:', error);
    handleApiError(res, error, 'email dispatch');
  }
});

// 4. GET /api/cron - Stateless triggering endpoint for Vercel Cron jobs
// Supports configuring in vercel.json with query parameters: /api/cron?email=test@example.com&roles=Frontend,React&skills=TS,React&provider=sandbox
app.get('/api/cron', async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      roles, 
      skills, 
      location, 
      industries,
      provider,
      apiKey
    } = req.query;

    const cronEmail = email || process.env.CRON_EMAIL;
    if (!cronEmail) {
      return res.status(400).json({ 
        error: 'Recipient email is required for the automated weekly digest cron job. Set "CRON_EMAIL" env var or pass "email" query param.' 
      });
    }

    // Set up default parameters if not provided in URL or env
    const targetRoles = roles 
      ? (roles as string).split(',') 
      : process.env.CRON_ROLES 
        ? (process.env.CRON_ROLES as string).split(',') 
        : ['Software Engineer', 'Frontend Developer'];

    const targetSkills = skills 
      ? (skills as string).split(',') 
      : process.env.CRON_SKILLS 
        ? (process.env.CRON_SKILLS as string).split(',') 
        : ['TypeScript', 'React', 'Node.js'];

    const locationPref = (location as string) || process.env.CRON_LOCATION || 'Remote';
    
    const industryPref = industries 
      ? (industries as string).split(',') 
      : process.env.CRON_INDUSTRIES 
        ? (process.env.CRON_INDUSTRIES as string).split(',') 
        : ['AI', 'SaaS'];

    const emailProvider = (provider as string) || process.env.EMAIL_PROVIDER || 'sandbox';

    // 1. Core Gemini Discovery
    const ai = getGeminiClient();

    let tavilyResults = '';
    let useTavily = false;
    
    if (process.env.TAVILY_API_KEY) {
      try {
        const searchQuery = `venture capital funding rounds startups India announced 2025 2026 AI SaaS ${industryPref.join(', ')}`;
        console.log(`[cron-tavily] Performing Tavily search for: "${searchQuery}"`);
        tavilyResults = await searchTavily(searchQuery);
        useTavily = true;
      } catch (tavilyError: any) {
        console.error('[cron-tavily] Tavily search failed, falling back to Google Search Grounding:', tavilyError.message || tavilyError);
      }
    }

    const prompt = useTavily
      ? `Using the following live search results from Tavily, extract 4 real tech startups/companies based in India (with headquarters in Indian cities like Bengaluru, Mumbai, Delhi NCR, Gurgaon, Noida, Hyderabad, Pune, Chennai, etc.) that announced venture capital funding announcements (Seed, Series A, Series B, Series C, etc.) recently in late 2025 or early-middle 2026. You MUST ONLY return real Indian companies found in the search results context.
      
CRITICAL FILTERING CRITERIA:
- Every company returned MUST strictly be an AI SaaS (Software-as-a-Service leveraging Artificial Intelligence) startup.
- DO NOT return companies focused on hardware, real estate, manufacturing, traditional consulting, or basic retail/e-commerce without a core AI software subscription model.

Live Web Search Results Context:
${tavilyResults}

For each company found, resolve and extract the active VC investors/funding participants who led or participated in this round, as well as a recruitment or general contact email ID.
      
Also, identify 2-3 key startup team members, co-founders, or engineering leaders (e.g., CEO, CTO, VP Engineering) with realistic or real LinkedIn profile URLs.

Additionally, identify 2-3 past job openings that were recently filled or active (e.g. "Senior Backend Engineer (Go) - Closed Q1 2026") and 2-3 future/expected job roles that they are likely hiring for next (e.g. "Lead React UI Developer - Expected Q3 2026").
      
Format the output tailored for:
- Target Roles: ${targetRoles.join(', ')}
- Key Skills: ${targetSkills.join(', ')}
- Location preference: ${locationPref}
      
Provide standard JSON matching our format scheme.`
      : `Search for 4 tech startups/companies based in India (with headquarters in Indian cities like Bengaluru, Mumbai, Delhi NCR, Gurgaon, Noida, Hyderabad, Pune, Chennai, etc.) that announced venture capital funding announcements (Seed, Series A, Series B, Series C, etc.) recently in late 2025 or early-middle 2026. You MUST ONLY return real Indian companies. Prioritize tech sectors: "${industryPref.join(', ')}".
      
CRITICAL FILTERING CRITERIA:
- Every company returned MUST strictly be an AI SaaS (Software-as-a-Service leveraging Artificial Intelligence) startup.
- DO NOT return companies focused on hardware, real estate, manufacturing, traditional consulting, or basic retail/e-commerce without a core AI software subscription model.

For each company found, resolve and extract the active VC investors/funding participants who led or participated in this round, as well as a recruitment or general contact email ID.
      
Also, identify 2-3 key startup team members, co-founders, or engineering leaders (e.g., CEO, CTO, VP Engineering) with realistic or real LinkedIn profile URLs.

Additionally, identify 2-3 past job openings that were recently filled or active (e.g. "Senior Backend Engineer (Go) - Closed Q1 25/26") and 2-3 future/expected job roles that they are likely hiring for next (e.g. "Lead React UI Developer - Expected Q3 25/26").
      
Format the output tailored for:
- Target Roles: ${targetRoles.join(', ')}
- Key Skills: ${targetSkills.join(', ')}
- Location preference: ${locationPref}
      
Provide standard JSON matching our format scheme.`;

    let modelResponse;
    const configWithSearchCron = {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            fundingAmount: { type: Type.STRING },
            fundingRound: { type: Type.STRING },
            date: { type: Type.STRING },
            industry: { type: Type.STRING },
            description: { type: Type.STRING },
            website: { type: Type.STRING },
            headquarters: { type: Type.STRING },
            investors: { type: Type.STRING },
            contactEmail: { type: Type.STRING },
            keyMembers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  linkedin: { type: Type.STRING }
                },
                required: ['name', 'role', 'linkedin']
              }
            },
            pastJobs: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            futureJobs: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            jobSearchGuideline: {
              type: Type.OBJECT,
              properties: {
                generalStrategy: { type: Type.STRING },
                specificRoles: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      role: { type: Type.STRING },
                      advice: { type: Type.STRING }
                    },
                    required: ['role', 'advice']
                  }
                },
                contactTips: { type: Type.STRING },
                interviewTips: { type: Type.STRING }
              },
              required: ['generalStrategy', 'specificRoles', 'contactTips', 'interviewTips']
            }
          },
          required: ['name', 'fundingAmount', 'fundingRound', 'date', 'industry', 'description', 'website', 'headquarters', 'investors', 'contactEmail', 'keyMembers', 'pastJobs', 'futureJobs', 'jobSearchGuideline']
        }
      }
    };

    let configCron: any = configWithSearchCron;
    if (useTavily) {
      const { tools, ...configWithoutSearchCron } = configWithSearchCron;
      configCron = configWithoutSearchCron;
    }

    modelResponse = await generateContentRobust(ai, prompt, configCron);

    const companies = JSON.parse(modelResponse.text || '[]');

    // 2. Email Formatting and Dispatch
    const profile = {
      email: cronEmail as string,
      targetRoles,
      skills: targetSkills,
      locationPreference: locationPref,
    };

    const emailHtml = createEmailHtml(companies, profile);
    const subject = `🚀 [Automated Service] Weekly Funded Tech Startup Digest`;

    let sentInfo = 'Sandbox simulated';

    if (emailProvider === 'resend') {
      const token = apiKey || process.env.RESEND_API_KEY;
      if (!token) throw new Error('Missing RESEND_API_KEY for automatic Cron job mailing');

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: cronEmail as string,
          subject,
          html: emailHtml
        })
      });

      if (!resendRes.ok) {
        throw new Error(`Resend email delivery failed: ${await resendRes.text()}`);
      }
      sentInfo = await resendRes.json();
    }

    res.json({
      success: true,
      trigger: 'weekly_cron',
      recipient: cronEmail as string,
      companiesFound: companies.length,
      sentInfo,
      message: 'Stateless cron job triggered successfully!'
    });

  } catch (error: any) {
    console.error('Fatal automated cron trigger failure:', error);
    handleApiError(res, error, 'weekly cron execution');
  }
});

export default app;
