import React, { useState, useEffect } from 'react';
import { Company, UserProfile, EmailSettings, EmailLog } from './types';
import CompanyCard from './components/CompanyCard';
import SettingsPanel from './components/SettingsPanel';
import EmailSimulator from './components/EmailSimulator';
import { 
  Building2, 
  Mail, 
  Settings as SettingsIcon, 
  Briefcase, 
  Terminal, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Send,
  Zap,
  Info,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pre-seeded/fallback companies in late 2025/2026 to ensure the app works beautifully
// if Gemini API key hasn't been configured in secrets yet, or as immediate premium samples
const FALLBACK_COMPANIES: Company[] = [
  {
    id: 'sample-1',
    name: 'Sarvam AI',
    fundingAmount: '$41.0M',
    fundingRound: 'Series A',
    date: 'January 2026',
    industry: 'Generative AI / NLP',
    description: 'Sarvam AI is building full-stack Generative AI platforms custom-built for India\'s diverse linguistic fabric, supporting robust model training, voice interfaces, and high-performance translation architectures for regional enterprises.',
    website: 'https://sarvam.ai',
    headquarters: 'Bengaluru, Karnataka, India',
    investors: 'Lightspeed Venture Partners, Peak XV Partners, Khosla Ventures',
    contactEmail: 'careers@sarvam.ai',
    keyMembers: [
      { name: 'Abhimanu Kumar', role: 'Co-founder', linkedin: 'https://www.linkedin.com/in/abhimanu-kumar-05244111' },
      { name: 'Vivek Raghavan', role: 'Co-founder', linkedin: 'https://www.linkedin.com/in/vivek-raghavan-283182b' }
    ],
    pastJobs: [
      "AI Researcher (Indic NLP & Fine-tuning) - Closed Q1 2026",
      "Senior Product Manager (Voice SDKs) - Closed Late 2025"
    ],
    futureJobs: [
      "Lead Full-Stack Engineer (Real-Time Audio Visualizers & React) - Expected Q3 2026",
      "MLOps Infrastructure Architect (Kubernetes Model Orchestration) - Expected Late 2026"
    ],
    jobSearchGuideline: {
      generalStrategy: "Given their active expansion and focus on large model development for Indic languages, Sarvam AI is scaling engineering capabilities. Frame your resume and projects around high-performance full-stack engineering, API performance, and lightweight voice-to-text systems.",
      specificRoles: [
        {
          role: "Frontend Developer",
          advice: "Highlight interactive chat modules, voice streaming integration (latency-controlled audio visualizers), responsive localized UI rendering speed, and custom dataset management consoles."
        },
        {
          role: "Software Engineer",
          advice: "Demonstrate deep proficiency with low-latency APIs, queue mechanics (BullMQ, Redis), WebSockets streams orchestration, and scalable microservice caching."
        }
      ],
      contactTips: "Subject: Highly Scalable Indic Voice Systems - Software Engineer candidate\n\nDear Shreya (Hiring Team at Sarvam AI),\n\nCongratulations on the latest Series A funding round! Your vision of scaling localized generative products across the Indian demographic is incredibly inspiring.\n\nI am a Software Engineer specializing in building low-latency, real-time web applications under heavy loads (handling up to 10M concurrent WebSockets events). I\'d love to bring my expertise in high-throughput streams and React dashboard design to your product engineering teams. Are you open for a brief 10-minute introduction call this week?",
      interviewTips: "Prepare extensively for Node/Python stream pipelines, handling base64 chunks, WebSockets reconnection policies, and designing intuitive audio streaming UI components."
    }
  },
  {
    id: 'sample-2',
    name: 'Zepto',
    fundingAmount: '$340.0M',
    fundingRound: 'Series D',
    date: 'March 2026',
    industry: 'Quick Commerce / Logistics Tech',
    description: 'Zepto is India\'s fastest-growing quick-commerce unicorn, optimizing dense urban logistics and automated dark-store dispatch networks via proprietary real-time routing engines.',
    website: 'https://www.zeptonow.com',
    headquarters: 'Mumbai, Maharashtra, India',
    investors: 'General Catalyst, StepStone Group, Lightspeed, Nexus Venture Partners, Glade Brook Capital',
    contactEmail: 'careers@zeptonow.com',
    keyMembers: [
      { name: 'Aadit Palicha', role: 'Co-founder & CEO', linkedin: 'https://www.linkedin.com/in/aadit-palicha-95240a1b4' },
      { name: 'Kaivalya Vohra', role: 'Co-founder & CTO', linkedin: 'https://www.linkedin.com/in/kaivalya-vohra-b649231b4' }
    ],
    pastJobs: [
      "Senior Frontend Specialist (PWA Storefront) - Closed Late 2025",
      "Golang Backend Developer (Dark Store Supply Routing) - Closed Q1 2026"
    ],
    futureJobs: [
      "Senior Full-Stack Developer (H3 Geospatial Mapping & Mapbox) - Expected Q3 2026",
      "Engineering Lead (Inventory Automation & Real-Time Tracking) - Expected Q4 2026"
    ],
    jobSearchGuideline: {
      generalStrategy: "As a major titan in the high-density commerce space scaling fast in 2026, Zepto requires developers who write airtight, performant real-time tracking pages, mapping routes, and automated inventory pipelines. Zero-flicker loading states are key.",
      specificRoles: [
        {
          role: "Frontend Developer",
          advice: "Focus on real-time location mapping dashboards, extreme mobile viewport rendering optimizations, and PWA (Progressive Web App) offline caching architectures."
        },
        {
          role: "Software Engineer",
          advice: "Emphasize high-volume transactional databases, geography-based coordinates querying, complex scheduling algorithms, and reliable state-machine backends."
        }
      ],
      contactTips: "Subject: Building Seamless Tracking Interfaces - Frontend Developer candidate\n\nDear Kaushik (Engineering Director at Zepto),\n\nI was thrilled to see Zepto\'s remarkable growth and the recent $340M Series D funding announcement. Keeping 10-minute deliveries seamlessly accurate under peak traffic is a beautiful engineering challenge.\n\nI am a Frontend Developer specializing in ultra-dense dashboard design and real-time mapping integrations. I recently optimized an active tracking workflow that reduced mobile load times by 40%. I\'d love to help Zepto build zero-lag customer experiences. Would you be open to a 10-minute call this Thursday?",
      interviewTips: "Expect high-concurrency systems questions, geographical indexing (H3/S2 libraries), browser performance metrics (LCP, FID), and state synchronization over flaky networks."
    }
  },
  {
    id: 'sample-3',
    name: 'Krutrim AI',
    fundingAmount: '$50.0M',
    fundingRound: 'Series A',
    date: 'February 2026',
    industry: 'AI Innovation & Silicon',
    description: 'Krutrim is building India\'s inaugural sovereign AI cloud ecosystem and custom silicon processors, accelerating enterprise intelligence stacks tailormade for regional demographics and linguistic contexts.',
    website: 'https://olakrutrim.com',
    headquarters: 'Bengaluru, Karnataka, India',
    investors: 'Matrix Partners India, Ola, Founder Angel Group',
    contactEmail: 'careers@olakrutrim.com',
    keyMembers: [
      { name: 'Bhavish Aggarwal', role: 'Founder & CEO', linkedin: 'https://www.linkedin.com/in/bhavishaggarwal' },
      { name: 'Akhil Saxena', role: 'VP Engineering', linkedin: 'https://www.linkedin.com/in/akhil-saxena-744040a' }
    ],
    pastJobs: [
      "Sovereign Cloud Console Engineer (React) - Closed Q1 2026",
      "Full-Stack Security Developer (OAuth / IAM Panels) - Closed Late 2025"
    ],
    futureJobs: [
      "Lead Web Architect (SaaS Multi-Tenant Compute Observability) - Expected Q3 2026",
      "Principal Cloud Orchestrator (Direct Baremetal Provisioning API) - Expected Q4 2026"
    ],
    jobSearchGuideline: {
      generalStrategy: "Krutrim is scaling a self-contained AI cloud infrastructure and consumer app ecosystem right now. Highlight experience in heavy cloud dashboards, scalable multi-tenant SaaS control panels, and server-side observability tools.",
      specificRoles: [
        {
          role: "Frontend Developer",
          advice: "Detail your background with intricate multi-tenant SaaS consoles, custom canvas dashboards, high-fidelity monitoring charts, and responsive token management screens."
        },
        {
          role: "Software Engineer",
          advice: "Focus on virtual machines provisioning controls, cloud billing schedulers, secure IAM/OAuth token handling, and robust integration tests suites."
        }
      ],
      contactTips: "Subject: Scaling Krutrim Sovereign Cloud Console - Engineer Application\n\nDear Akhil (Engineering Lead at Krutrim AI),\n\nCongratulations on Krutrim\'s $50M funding and pioneering India\'s sovereign AI cloud. Building local silicon and cloud infrastructure is a pivotal milestone for the ecosystem.\n\nI am a Full-stack Engineer with strong expertise in building complex, high-contrast resource monitoring consoles. I have designed custom cloud performance boards with real-time stats feeds. I would love to talk about how I can bring this design capability to Krutrim\'s console team. Do you have 10 minutes for a call next week?",
      interviewTips: "Brush up on complex data visuals (D3/Recharts), canvas graphs, heavy API synchronization, and OAuth/SSO flow integrations."
    }
  },
  {
    id: 'sample-4',
    name: 'Pocket FM',
    fundingAmount: '$103.0M',
    fundingRound: 'Series D',
    date: 'March 2026',
    industry: 'Audio Tech & Streaming SaaS',
    description: 'Pocket FM is a leading audio entertainment platform pioneering the audio series category. They utilize advanced machine learning personalization engines to serve diverse regional content formats globally.',
    website: 'https://www.pocketfm.com',
    headquarters: 'Bengaluru, Karnataka, India',
    investors: 'Lightspeed Venture Partners, Tencent, StepStone Group',
    contactEmail: 'careers@pocketfm.com',
    keyMembers: [
      { name: 'Rohan Nayak', role: 'Co-founder & CEO', linkedin: 'https://www.linkedin.com/in/rohannayak' },
      { name: 'Prateek Dixit', role: 'Co-founder & CTO', linkedin: 'https://www.linkedin.com/in/prateekdixit' }
    ],
    pastJobs: [
      "Senior Android Engineer (Audio Rendering Core Engine) - Closed Early 2026",
      "Frontend Developer (International Web Platform) - Closed Late 2025"
    ],
    futureJobs: [
      "Senior Backend Engineer (High-Concurrency Streaming APIs) - Expected Q3 2026",
      "Developer Relations / Solutions Architect (Global Integration Hub) - Expected Late 2026"
    ],
    jobSearchGuideline: {
      generalStrategy: "Pocket FM is expanding exponentially into global markets following their deep Series D funding. Position yourself as someone who understands global scale, media streaming optimization, and modular UI engineering.",
      specificRoles: [
        {
          role: "Frontend Developer",
          advice: "Exemplify high-performance media elements handling, responsive design across mobile/web viewports, custom audio player controls, and optimized bundle sizes."
        },
        {
          role: "Software Engineer",
          advice: "Focus on microservices dealing with high-concurrency stream data, content delivery network (CDN) edge optimizations, caching algorithms, and robust media asset processing queues."
        }
      ],
      contactTips: "Subject: Optimizing Low-Latency Streaming Systems - Engineer Application\n\nDear Prateek (Co-founder & CTO at Pocket FM),\n\nCongratulations on the incredible $103M Series D round! Your work pioneering the audio series format worldwide and managing massive peak content consumption is inspiring.\n\nI am a Software Engineer experienced in web-media delivery architectures, specializing in sub-second stream orchestration and Redis cache optimizations. I would love to explore how my skills can empower Pocket FM’s content pipelines. Are you open for a fast 10-minute introduction call?",
      interviewTips: "Prepare for high-throughput API design questions, chunked data encoding, audio stream playback handlers in modern browsers, system observability logs, and rate limiters."
    }
  },
  {
    id: 'sample-5',
    name: 'Perfios',
    fundingAmount: '$80.0M',
    fundingRound: 'Venture Capital Round',
    date: 'March 2026',
    industry: 'FinTech B2B SaaS',
    description: 'Perfios is a leading B2B financial software developer, delivering real-time credit decisioning, categorization, and robust analytical modeling systems to major banks and global institutions.',
    website: 'https://www.perfios.com',
    headquarters: 'Bengaluru, Karnataka, India',
    investors: 'Teachers\' Venture Growth (TVG), Bessemer Venture Partners',
    contactEmail: 'careers@perfios.com',
    keyMembers: [
      { name: 'Sabyasachi Senapati', role: 'Chief Executive Officer', linkedin: 'https://www.linkedin.com/in/sabyasachi-senapati-96ab427' },
      { name: 'Ramgopal Subramanian', role: 'VP Engineering', linkedin: 'https://www.linkedin.com/in/ramgopal-subramanian' }
    ],
    pastJobs: [
      "Kubernetes Cloud Security Architect - Closed Late 2025",
      "Senior React Developer (Risk Decisioning UI Panels) - Closed Q1 2026"
    ],
    futureJobs: [
      "Senior Full-Stack Developer (Security Controls & Banking API) - Expected Q3 2026",
      "Tech Lead (Core MLOps Scoring Engine) - Expected Q4 2026"
    ],
    jobSearchGuideline: {
      generalStrategy: "As a seasoned FinTech B2B veteran gearing up for their next expansion era, Perfios prioritizes clean architectures, absolute security compliance, and reliable data visualizers. Prove you are a details-oriented engineer who respects security guidelines.",
      specificRoles: [
        {
          role: "Frontend Developer",
          advice: "Emphasize robust dashboard designs using d3 or recharts, secure handling of temporary tokens, and highly structured data table components with customized sorting/filters."
        },
        {
          role: "Software Engineer",
          advice: "Demonstrate extensive familiarity with encryption techniques (AES/RSA), secure banking API structures, database consistency rules under high concurrent transaction loads, and clean tests."
        }
      ],
      contactTips: "Subject: Building Enterprise-Grade Secure FinTech UI - Engineer Application\n\nDear Ramgopal (Engineering VP at Perfios),\n\nCongratulations on the $80M pre-IPO investment round! Perfios\' ability to safely parse financial parameters for thousands of institutions is a magnificent standard of engineering excellence.\n\nI am a Full-Stack developer specializing in building airtight financial dashboards, security IAM structures, and charts visualizations. I have optimized complex financial forms leading to 35% shorter user processing cycles. Can we connect for a brief 10-minute talk about upcoming product objectives?",
      interviewTips: "Focus heavily on security architectures, JWT and OAuth token scopes, SQL schema migrations, and optimization of render cycles for dashboards displaying huge tabular datasets."
    }
  },
  {
    id: 'sample-6',
    name: 'Ather Energy',
    fundingAmount: '$287.0M',
    fundingRound: 'Corporate Round',
    date: 'April 2026',
    industry: 'EV & Smart Mobility IoT',
    description: 'Ather Energy designs and manufactures premium smart electric scooters. They build custom Linux-based infotainment interfaces, secure charging grids, and massive IoT fleet health monitoring consoles.',
    website: 'https://www.atherenergy.com',
    headquarters: 'Bengaluru, Karnataka, India',
    investors: 'National Investment and Infrastructure Fund (NIIF), Hero MotoCorp',
    contactEmail: 'careers@atherenergy.com',
    keyMembers: [
      { name: 'Tarun Mehta', role: 'Co-founder & CEO', linkedin: 'https://www.linkedin.com/in/tarunmehta-ather' },
      { name: 'Swapnil Jain', role: 'Co-founder & CTO', linkedin: 'https://www.linkedin.com/in/swapniljain-ather' }
    ],
    pastJobs: [
      "Embedded Infotainment System Developer - Closed Q1 2026",
      "React Web Developer (Battery Health Analytics) - Closed Late 2025"
    ],
    futureJobs: [
      "Senior Full-Stack IoT Engineer (Real-time Grid & Fleet SaaS Dashboards) - Expected Q3 2026",
      "Frontend Lead Developer (Interactive Smart Dashboard Maps) - Expected Q4 2026"
    ],
    jobSearchGuideline: {
      generalStrategy: "Ather Energy bridges hardware and web software. To stand out, you need to showcase experience with real-time data ingestion, telemetry streaming channels (MQTT, WebSockets), and high-frequency IoT dashboard visualization.",
      specificRoles: [
        {
          role: "Frontend Developer",
          advice: "Feature interactive WebGL coordinates mapping, low-CPU rendering, custom state animations, and optimized offline application synchronization state models."
        },
        {
          role: "Software Engineer",
          advice: "Emphasize handling time-series databases (TimescaleDB/InfluxDB), streaming pipelines, message brokers (RabbitMQ/Kafka), and durable WebSocket socket gateways."
        }
      ],
      contactTips: "Subject: Scaling Real-Time Telemetry & Fleet Dashboards - Candidate Intro\n\nDear Swapnil (Co-founder & CTO at Ather Energy),\n\nI would like to celebrate Ather's successful $287M funding milestone! Ather continues to set the benchmark for smart electric vehicle development inside India.\n\nI am a Full-Stack Engineer with deep experience managing high-fidelity telemetry dashboards and WebSocket stream handlers. I specialize in building responsive coordinate trackers and map dashboards. I would love to bring my expertise to Ather's software team. Would you be open to a 10-minute chat this week?",
      interviewTips: "Expect questions on time-series analytics, handling telemetry packets over shaky mobile connections, canvas mapping coordinate updates, and WebSocket ping-pong protocols."
    }
  },
  {
    id: 'sample-7',
    name: 'Shadowfax',
    fundingAmount: '$100.0M',
    fundingRound: 'Series E',
    date: 'February 2026',
    industry: 'Logistics Tech & Route Optimization',
    description: 'Shadowfax is India\'s premier on-demand third-party logistics network, leveraging deep geospatial algorithms and automated dark-store systems to dispatch thousands of riders instantaneously.',
    website: 'https://www.shadowfax.in',
    headquarters: 'Bengaluru, Karnataka, India',
    investors: 'TPG NewQuest, Mirae Asset, IFC, Flipkart',
    contactEmail: 'careers@shadowfax.in',
    keyMembers: [
      { name: 'Abhishek Bansal', role: 'Co-founder & CEO', linkedin: 'https://www.linkedin.com/in/abhibansal' },
      { name: 'Vaibhav Khandelwal', role: 'Co-founder & CTO', linkedin: 'https://www.linkedin.com/in/vaibhav-khandelwal-b93b8612' }
    ],
    pastJobs: [
      "React Native Mobile Specialist (Rider Fleet App) - Closed Late 2025",
      "Go/Node Backend Engineer (Routing Optimizations Engine) - Closed Q1 2026"
    ],
    futureJobs: [
      "Lead Full-Stack Architect (Dense Logistics Fleet Control Panels) - Expected Q3 2026",
      "Senior Frontend Engineer (Dashboard Analytics & Maps) - Expected Late 2026"
    ],
    jobSearchGuideline: {
      generalStrategy: "Shadowfax’s logistics engine runs on complex dispatch mapping. Prioritize projects containing map visualization, geofencing, real-time vehicle simulation pipelines, or hyper-optimized tracking interfaces.",
      specificRoles: [
        {
          role: "Frontend Developer",
          advice: "Highlight Google Maps/Mapbox integrations, fluid multi-stop route drawing, instant responsive order queues, and high-contrast night-mode viewports."
        },
        {
          role: "Software Engineer",
          advice: "Focus on geospatial querying (PostGIS, H3 index buckets), multi-agent path finding optimization, real-time routing calculation speeds, and reliable webhook workers."
        }
      ],
      contactTips: "Subject: Enhancing Geospatial Routing Dashboards - Engineer Application\n\nDear Vaibhav (Co-founder & CTO at Shadowfax),\n\nCongratulations on securing the $100M Series E funding round! Scaling India's fast third-party logistics network to millions of monthly drops is a majestic technical triumph.\n\nI am a Software Engineer specializing in geospatial map visualization, PostGIS databases, and building fleet routing consoles. I have spent years refining order distribution engines with zero-latency. I’d love to help tackle Shadowfax’s dark-store routing problems. Do you have 10 minutes available for a short introductory call?",
      interviewTips: "Familiarize yourself with PostGIS queries, basic Dijkstra algorithm, handling WebSocket connections on mobile, geographic clustering, and Mapbox routing API patterns."
    }
  },
  {
    id: 'sample-8',
    name: 'InCred',
    fundingAmount: '$60.0M',
    fundingRound: 'Series D',
    date: 'January 2026',
    industry: 'FinTech Digital Lending',
    description: 'InCred is a modern technology-driven financial service unicorn offering simplified online credit lines, education loans, and merchant funding using machine learning credit models.',
    website: 'https://www.incred.com',
    headquarters: 'Mumbai, Maharashtra, India',
    investors: 'KKR, Teachers\' Venture Growth (TVG), Oaks Asset Management',
    contactEmail: 'careers@incred.com',
    keyMembers: [
      { name: 'Bhupinder Singh', role: 'Founder & CEO', linkedin: 'https://www.linkedin.com/in/bhupinder-singh-612660' },
      { name: 'Vivek Khare', role: 'Engineering Director', linkedin: 'https://www.linkedin.com/in/vivekkhare' }
    ],
    pastJobs: [
      "Senior React Developer (Instant Loan Sourcing Flow) - Closed Late 2025",
      "Java/Spring Backend Engineer (Risk Underwriting Pipeline) - Closed Q1 2026"
    ],
    futureJobs: [
      "Lead Full-Stack Developer (Co-lending SaaS Gateways) - Expected Q3 2026",
      "Senior UI/UX React Developer (Sovereign Merchant Portals) - Expected Q4 2026"
    ],
    jobSearchGuideline: {
      generalStrategy: "InCred focuses on immediate consumer loan disbursement pipelines. Show that you know how to build high-conversion flows (multi-page application wizards), instant KYC API validations, and fraud detection panels.",
      specificRoles: [
        {
          role: "Frontend Developer",
          advice: "Prove you can build foolproof UI wizards with automated validation states, responsive loading loops, and pixel-perfect design system implementations."
        },
        {
          role: "Software Engineer",
          advice: "Key priorities are KYC API integrations (Aadhaar, PAN validation endpoints), transactional audit logging, fault-tolerant background queues, and ironclad security schemes."
        }
      ],
      contactTips: "Subject: Building Seamless Multi-Step Loan Applications - Frontend Candidate\n\nDear Vivek (Engineering Director at InCred),\n\nCongratulations on InCred's new Series D funding expansion! Your focus on building frictionless, tech-driven lending systems is making a massive mark in the Indian FinTech space.\n\nI am a Frontend Developer specialized in developing highly optimized multi-page user wizards and verifying secure state synchronization. I recently built a digital onboarding module that improved conversion rates by 28%. I'd love to join InCred's consumer product team to elevate the onboarding journey. Are you open to a brief 10-minute chat?",
      interviewTips: "Prepare for frontend state management challenges, form validation rules, handling security parameters in browser APIs, REST integration failover mechanisms, and database ACID properties."
    }
  }
];

// Constants for local storage keys
const STATE_KEYS = {
  PROFILE: 'funding_agent_profile_v1',
  EMAIL_SETTINGS: 'funding_agent_email_settings_v1',
  COMPANIES: 'funding_agent_companies_v1',
  LOGS: 'funding_agent_logs_v1',
  HTML: 'funding_agent_html_v1'
};

export default function App() {
  // Navigation
  const [activeView, setActiveView] = useState<'discover' | 'email' | 'settings'>('discover');

  // Core App States
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STATE_KEYS.PROFILE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.locationPreference?.toLowerCase().includes('india')) {
        parsed.locationPreference = 'Bengaluru, India / Remote India';
        localStorage.setItem(STATE_KEYS.PROFILE, JSON.stringify(parsed));
      }
      return parsed;
    }
    return {
      email: 'parshavjn@gmail.com', // Pre-seeded with user's email
      targetRoles: ['Frontend Developer', 'Software Engineer'],
      experienceLevel: 'Mid',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'Vite'],
      locationPreference: 'Bengaluru, India / Remote India',
      industryPreference: ['AI', 'SaaS', 'Quick Commerce', 'FinTech']
    };
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => {
    const saved = localStorage.getItem(STATE_KEYS.EMAIL_SETTINGS);
    if (saved) return JSON.parse(saved);
    return {
      provider: 'sandbox'
    };
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem(STATE_KEYS.COMPANIES);
    if (saved) {
      const parsed = JSON.parse(saved);
      const hasForeign = parsed.some((c: any) => !c.headquarters?.toLowerCase().includes('india'));
      const missingKeyMembers = parsed.some((c: any) => !c.keyMembers || !Array.isArray(c.keyMembers));
      const missingJobs = parsed.some((c: any) => !c.pastJobs || !c.futureJobs);
      const isOldFallbackList = parsed.every((c: any) => c.id && c.id.startsWith('sample-')) && parsed.length < FALLBACK_COMPANIES.length;
      
      if (hasForeign || missingKeyMembers || missingJobs || isOldFallbackList) {
        localStorage.setItem(STATE_KEYS.COMPANIES, JSON.stringify(FALLBACK_COMPANIES));
        return FALLBACK_COMPANIES;
      }
      return parsed;
    }
    return FALLBACK_COMPANIES;
  });

  const [logs, setLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem(STATE_KEYS.LOGS);
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [activeHtmlEmail, setActiveHtmlEmail] = useState<string | null>(() => {
    return localStorage.getItem(STATE_KEYS.HTML) || null;
  });

  // UI status indicators
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGeminiUnavailable, setIsGeminiUnavailable] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STATE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STATE_KEYS.EMAIL_SETTINGS, JSON.stringify(emailSettings));
  }, [emailSettings]);

  useEffect(() => {
    localStorage.setItem(STATE_KEYS.COMPANIES, JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem(STATE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if (activeHtmlEmail) {
      localStorage.setItem(STATE_KEYS.HTML, activeHtmlEmail);
    } else {
      localStorage.removeItem(STATE_KEYS.HTML);
    }
  }, [activeHtmlEmail]);

  // Show dynamic toast helper
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Discover Funded Companies Action
  const handleDiscoverCompanies = async () => {
    setIsSearching(true);
    setIsGeminiUnavailable(false);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        let errMsg = '';
        try {
          const errJson = await response.json();
          errMsg = errJson.error || errJson.message;
        } catch {
          // not json
        }
        if (!errMsg) {
          const errText = await response.text();
          errMsg = errText || 'Server-side API search error';
        }
        throw new Error(errMsg);
      }

      const freshCompaniesList = await response.json();
      
      if (Array.isArray(freshCompaniesList) && freshCompaniesList.length > 0) {
        // Assign temporary unique IDs
        const parsed = freshCompaniesList.map((c, i) => ({
          ...c,
          id: `company-${Date.now()}-${i}`
        }));
        setCompanies(parsed);
        showToast('success', `AI successfully crawled ${parsed.length} recently funded companies matching your criteria!`);
      } else {
        throw new Error('Unrecognized JSON format received from Gemini');
      }

    } catch (err: any) {
      console.error('Failed search discovery:', err);
      setIsGeminiUnavailable(true);
      showToast('error', `Could not search recently funded companies: ${err.message}. Showing simulated local catalog.`);
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger Weekly Email Dispatch Action
  const handleSendWeeklyEmail = async () => {
    if (companies.length === 0) {
      showToast('error', 'Please locate or discover funded companies first before sending custom pipelines.');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companies: companies,
          profile: profile,
          settings: emailSettings
        })
      });

      if (!response.ok) {
        let errMsg = '';
        try {
          const errJson = await response.json();
          errMsg = errJson.error || errJson.message;
        } catch {
          // not json
        }
        if (!errMsg) {
          const errText = await response.text();
          errMsg = errText || 'Failed to dispatch email';
        }
        throw new Error(errMsg);
      }

      const result = await response.json();

      if (result.success) {
        // Prepend new trace log
        const newLog: EmailLog = {
          id: `log-${Date.now()}`,
          sentAt: new Date().toISOString(),
          recipient: result.recipient,
          status: 'success',
          companiesCount: companies.length,
          subject: result.subject
        };

        setLogs(prev => [newLog, ...prev]);
        setActiveHtmlEmail(result.html);
        showToast('success', result.message || 'Weekly job digest sent!');
      }

    } catch (err: any) {
      console.error('Email pipeline error:', err);
      
      const failedLog: EmailLog = {
        id: `log-${Date.now()}`,
        sentAt: new Date().toISOString(),
        recipient: profile.email,
        status: 'failed',
        errorMessage: err.message,
        companiesCount: companies.length,
        subject: `Weekly Funded Startup Digest`
      };
      
      setLogs(prev => [failedLog, ...prev]);
      showToast('error', `Failed to deliver email digest: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetToPreseeded = () => {
    setCompanies(FALLBACK_COMPANIES);
    showToast('success', 'Reset to high-fidelity simulated 2026 tech companies catalog.');
  };

  return (
    <div id="application-root" className="min-h-screen bg-slate-50/50 flex flex-col antialiased">
      
      {/* Visual Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            id="toast-notification-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-lg border max-w-lg w-11/12 flex items-start gap-3 ${
              toast.type === 'success' 
                ? 'bg-emerald-900 border-emerald-800 text-emerald-100' 
                : 'bg-rose-900 border-rose-800 text-rose-100'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs font-medium font-sans">
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Top Banner Navigation Bar */}
      <nav id="navbar-header" className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl relative overflow-hidden">
              <Zap className="w-6 h-6 text-yellow-300 animate-pulse relative z-10" />
              <div className="absolute inset-0 bg-indigo-500 opacity-20 filter blur-sm"></div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-indigo-400 block">
                Intelligent Recruiting Portal
              </span>
              <h1 className="text-lg font-sans font-extrabold tracking-tight">
                Funded Tech Job Agent
              </h1>
            </div>
          </div>

          {/* Action Tabs Router */}
          <div className="flex bg-slate-800/80 rounded-xl p-1 border border-slate-700/80">
            <button
              id="nav-btn-discover"
              onClick={() => setActiveView('discover')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeView === 'discover' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-350 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Company Feed
            </button>
            <button
              id="nav-btn-email"
              onClick={() => setActiveView('email')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeView === 'email' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-350 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              Weekly Sandbox
            </button>
            <button
              id="nav-btn-settings"
              onClick={() => setActiveView('settings')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeView === 'settings' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-350 hover:text-white'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              Pipeline Config
            </button>
          </div>

          {/* Connected User Summary */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/30 text-[11px] font-mono text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Recipient: <span className="text-white font-bold">{profile.email}</span>
          </div>

        </div>
      </nav>

      {/* Main Body content wrapping bento layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Real-time configuration summary pill banner */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800 shadow-sm relative overflow-hidden">
          {/* Subtle gradient highlights */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-indigo-500/10 to-transparent pointer-events-none"></div>

          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-2.5 py-0.5 rounded border border-indigo-900/40">
                Weekly Active Criteria
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded">
                ⚡ Vercel serverless compatible
              </span>
            </div>
            <p className="font-sans text-xs text-slate-300">
              Target Roles: <strong className="text-white">{profile.targetRoles.join(', ')}</strong> | Skills: <strong className="text-white">{profile.skills.join(', ')}</strong> | Preferred Industries: <strong className="text-white">{profile.industryPreference.join(', ')}</strong>
            </p>
          </div>

          <div className="flex gap-2 shrink-0 z-10 w-full md:w-auto">
            <button
              id="btn-quick-refresh-search"
              onClick={handleDiscoverCompanies}
              disabled={isSearching}
              className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
              {isSearching ? 'Analyzing Fundings...' : 'Discover Recent Fundings'}
            </button>
            <button
              id="btn-quick-config"
              onClick={() => setActiveView('settings')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-700 rounded-lg text-xs cursor-pointer flex items-center justify-center"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informational Warning if Gemini is unavailable */}
        {isGeminiUnavailable && (
          <div id="gemini-key-warning" className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 text-amber-950">
            <Info className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-2">
              <p className="font-semibold text-sm">Running with Simulated Fallback Startup Intelligence</p>
              <p className="leading-relaxed">
                The Gemini AI crawler returned an environment error (is your <strong>GEMINI_API_KEY</strong> configured in <strong>Settings &gt; Secrets</strong>?).
              </p>
              <p className="font-semibold leading-relaxed">
                No worries! We have automatically loaded a premium pre-seeded listing of high-fidelity June 2026 venture-capital funded tech companies so you can evaluate the entire workspace features seamlessly (custom job application guidelines, copy email templates, configure smtp/resend connections, and test visual inbox delivery simulations).
              </p>
              <div className="pt-1">
                <button
                  id="btn-force-seeded"
                  onClick={handleResetToPreseeded}
                  className="px-3 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 rounded font-semibold transition-colors cursor-pointer"
                >
                  Reload Sample Startup Dataset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Routing Render Layout */}
        <div className="z-10 relative">
          {activeView === 'discover' && (
            <div id="view-section-discover" className="space-y-6">
              
              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Startups Crawled</span>
                    <span className="text-xl font-sans font-bold text-slate-900 mt-1 block">{companies.length} Leveled</span>
                  </div>
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Recruit Email Target</span>
                    <span className="text-sm font-mono font-bold text-slate-800 mt-1 block truncate w-40">{profile.email}</span>
                  </div>
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Weekly Cron Trigger</span>
                    <span className="text-xs font-mono font-bold text-emerald-600 mt-1 block">Scheduled on Vercel</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Terminal className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Sender Channel</span>
                    <span className="text-xs font-mono font-bold text-indigo-700 mt-1 block uppercase">{emailSettings.provider}</span>
                  </div>
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Feed Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-sans font-extrabold text-2xl text-slate-900 tracking-tight">
                    Discovered Venture-Funded Opportunities
                  </h2>
                  <p className="font-sans text-xs text-slate-500 mt-1">
                    Recently funded technology, biosciences, and SaaS firms with customized job pipeline playbooks.
                  </p>
                </div>

                {companies.length > 0 && (
                  <button
                    id="btn-route-to-email"
                    onClick={() => setActiveView('email')}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-750 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    Send Digest Newsletter
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Feed Content */}
              {companies.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-4">
                  <Building2 className="w-16 h-16 text-slate-200 mx-auto stroke-1" />
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="font-sans font-bold text-slate-800 text-lg">No Funded Companies Found</h3>
                    <p className="font-sans text-sm text-slate-550 leading-relaxed">
                      We didn't locate any companies matching your filter profile in local memory. Click "Discover Recent Fundings" to trigger the intelligent Gemini venture crawler!
                    </p>
                  </div>
                  <button
                    id="btn-initial-discover-companies"
                    onClick={handleDiscoverCompanies}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl cursor-pointer"
                  >
                    Discover Recent Fundings
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {companies.map((company) => (
                    <CompanyCard key={company.id} company={company} profile={profile} />
                  ))}
                </div>
              )}

            </div>
          )}

          {activeView === 'email' && (
            <div id="view-section-email">
              <EmailSimulator 
                logs={logs} 
                onTriggerSend={handleSendWeeklyEmail} 
                isSending={isSending} 
                activeHtmlEmail={activeHtmlEmail}
              />
            </div>
          )}

          {activeView === 'settings' && (
            <div id="view-section-settings">
              <SettingsPanel 
                profile={profile} 
                onSaveProfile={setProfile} 
                emailSettings={emailSettings} 
                onSaveEmailSettings={setEmailSettings} 
              />
            </div>
          )}
        </div>

      </main>

      {/* Global Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <p className="font-mono">
            🌍 Funded Tech Job Agent Portal | Current context UTC clock: 2026-06-09
          </p>
          <div className="flex justify-center gap-6 text-slate-500 font-sans">
            <button onClick={() => setActiveView('discover')} className="hover:text-white transition-colors cursor-pointer">Startups Feed</button>
            <span>•</span>
            <button onClick={() => setActiveView('email')} className="hover:text-white transition-colors cursor-pointer">Inbox Sandbox</button>
            <span>•</span>
            <button onClick={() => setActiveView('settings')} className="hover:text-white transition-colors cursor-pointer">Developer Settings</button>
          </div>
          <p className="text-[10px] text-slate-600 max-w-xl mx-auto leading-relaxed">
            Designed for seamless Vercel serverless deployment. Simply connect your repository to Vercel, link your env variables, and write a light-weighted cron directive to enable premium hands-free job opportunity updates.
          </p>
        </div>
      </footer>

    </div>
  );
}
