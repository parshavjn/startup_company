import React, { useState } from 'react';
import { UserProfile, EmailSettings } from '../types';
import { 
  User, 
  Mail, 
  Settings, 
  Key, 
  ShieldCheck, 
  Terminal, 
  Info, 
  Sparkles, 
  Briefcase,
  HelpCircle,
  Database,
  Layers,
  Code
} from 'lucide-react';

interface SettingsPanelProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  emailSettings: EmailSettings;
  onSaveEmailSettings: (settings: EmailSettings) => void;
}

export default function SettingsPanel({ 
  profile, 
  onSaveProfile, 
  emailSettings, 
  onSaveEmailSettings 
}: SettingsPanelProps) {
  // Local states
  const [email, setEmail] = useState(profile.email);
  const [roleInput, setRoleInput] = useState(profile.targetRoles.join(', '));
  const [skillsInput, setSkillsInput] = useState(profile.skills.join(', '));
  const [locationPreference, setLocationPreference] = useState(profile.locationPreference);
  const [industriesInput, setIndustriesInput] = useState(profile.industryPreference.join(', '));
  const [expLevel, setExpLevel] = useState<UserProfile['experienceLevel']>(profile.experienceLevel);

  // Email Config Local state
  const [provider, setProvider] = useState<EmailSettings['provider']>(emailSettings.provider);
  const [resendApiKey, setResendApiKey] = useState(emailSettings.resendApiKey || '');
  const [smtpHost, setSmtpHost] = useState(emailSettings.smtpHost || '');
  const [smtpPort, setSmtpPort] = useState(emailSettings.smtpPort || 465);
  const [smtpUser, setSmtpUser] = useState(emailSettings.smtpUser || '');
  const [smtpPass, setSmtpPass] = useState(emailSettings.smtpPass || '');
  const [fromEmail, setFromEmail] = useState(emailSettings.fromEmail || '');

  const [activeTab, setActiveTab] = useState<'profile' | 'email' | 'vercel'>('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const handleSaveAll = () => {
    // Parser for comma-separated inputs
    const targetRoles = roleInput.split(',').map(r => r.trim()).filter(Boolean);
    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const industryPreference = industriesInput.split(',').map(i => i.trim()).filter(Boolean);

    onSaveProfile({
      email,
      targetRoles,
      skills,
      locationPreference,
      industryPreference,
      experienceLevel: expLevel
    });

    onSaveEmailSettings({
      provider,
      resendApiKey: provider === 'resend' ? resendApiKey : undefined,
      smtpHost: provider === 'smtp' ? smtpHost : undefined,
      smtpPort: provider === 'smtp' ? Number(smtpPort) : undefined,
      smtpUser: provider === 'smtp' ? smtpUser : undefined,
      smtpPass: provider === 'smtp' ? smtpPass : undefined,
      fromEmail: fromEmail || undefined
    });

    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  };

  return (
    <div id="settings-panel" className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
      
      {/* Visual Navigation Tabs */}
      <div className="flex border-b border-slate-100 pb-3 gap-2 overflow-x-auto">
        <button
          id="tab-btn-profile"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
            activeTab === 'profile' 
              ? 'bg-indigo-50 text-indigo-700' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          Job Profile
        </button>
        <button
          id="tab-btn-email"
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
            activeTab === 'email' 
              ? 'bg-indigo-50 text-indigo-700' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email Pipeline
        </button>
        <button
          id="tab-btn-vercel"
          onClick={() => setActiveTab('vercel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
            activeTab === 'vercel' 
              ? 'bg-rose-50 text-rose-700 border border-thin border-rose-100' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Vercel Cron Deployment
        </button>
      </div>

      {activeTab === 'profile' && (
        <div id="tab-content-profile" className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            <h3 className="font-sans font-bold text-slate-800 text-sm tracking-wide uppercase font-mono">Job & Application Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="settings-profile-email" className="block text-xs font-bold text-slate-700 font-mono">
                Your Email Address (weekly target) *
              </label>
              <input
                id="settings-profile-email"
                type="email"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-1">
              <label htmlFor="settings-profile-exp" className="block text-xs font-bold text-slate-700 font-mono">
                Experience Target
              </label>
              <select
                id="settings-profile-exp"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                value={expLevel}
                onChange={(e) => setExpLevel(e.target.value as UserProfile['experienceLevel'])}
              >
                <option value="Any">Any / No preference</option>
                <option value="Junior">Junior Developers (Entry / Associate)</option>
                <option value="Mid">Mid-level (2-5 years experience)</option>
                <option value="Senior">Senior positions (6+ years experience)</option>
                <option value="Lead">Lead Engineers & Architect levels</option>
              </select>
            </div>

            {/* Target Roles */}
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="settings-profile-roles" className="block text-xs font-bold text-slate-700 font-mono">
                Target Roles (comma separated)
              </label>
              <input
                id="settings-profile-roles"
                type="text"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-sans"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                placeholder="e.g. Frontend Developer, Software Engineer, Full-stack Architect"
              />
            </div>

            {/* Core Skills */}
            <div className="space-y-1">
              <label htmlFor="settings-profile-skills" className="block text-xs font-bold text-slate-700 font-mono">
                Your Core Tech Skills (comma separated)
              </label>
              <input
                id="settings-profile-skills"
                type="text"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="React, TypeScript, Tailwind, REST API, Node"
              />
            </div>

            {/* Location preferences */}
            <div className="space-y-1">
              <label htmlFor="settings-profile-loc" className="block text-xs font-bold text-slate-700 font-mono">
                Location Preference
              </label>
              <input
                id="settings-profile-loc"
                type="text"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                value={locationPreference}
                onChange={(e) => setLocationPreference(e.target.value)}
                placeholder="e.g. Bengaluru, Mumbai, Delhi, Gurgaon, Noida, India"
              />
            </div>

            {/* Industry Sectors */}
            <div className="space-y-1 md:col-span-2">
              <label htmlFor="settings-profile-industries" className="block text-xs font-bold text-slate-700 font-mono">
                Preferred Tech Industries (comma separated)
              </label>
              <input
                id="settings-profile-industries"
                type="text"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                value={industriesInput}
                onChange={(e) => setIndustriesInput(e.target.value)}
                placeholder="e.g. AI Research, SaaS, FinTech, DevTools, CyberSecurity, HealthTech"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div id="tab-content-email" className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
            <Mail className="w-4 h-4 text-emerald-500" />
            <h3 className="font-sans font-bold text-slate-800 text-sm tracking-wide uppercase font-mono">Send Engine Configuration</h3>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-900">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold">Need to test without setting up credentials?</p>
              <p className="leading-relaxed">
                Select <strong>Sandbox Mode (Local Simulation)</strong>. It will output a gorgeous visual email render in your local logs below, complete with a virtual preview so you can verify the beautiful formatting. If you want real emails delivered to your inbox, choose <strong>Resend API</strong> or <strong>SMTP (Gmail/others)</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="settings-email-provider" className="block text-xs font-bold text-slate-700 font-mono">Select Delivery Channel</label>
              <select
                id="settings-email-provider"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                value={provider}
                onChange={(e) => setProvider(e.target.value as EmailSettings['provider'])}
              >
                <option value="sandbox">Sandbox Mode (Visual Simulation only - Recommended for testing)</option>
                <option value="resend">Resend API (Sleek transactional mail API)</option>
                <option value="smtp">SMTP Server (Gmail custom SMTP or mailtrap)</option>
              </select>
            </div>

            {/* Provider Conditional Inputs */}
            {provider === 'resend' && (
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 font-mono">
                  <Key className="w-4 h-4" />
                  Resend Integration Parameters
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label htmlFor="settings-email-resend-key" className="block text-[11px] font-bold text-slate-650">Resend API Key</label>
                    <input
                      id="settings-email-resend-key"
                      type="password"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      placeholder="re_xxxxxxxxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="settings-email-resend-from" className="block text-[11px] font-bold text-slate-650">From Email Address</label>
                    <input
                      id="settings-email-resend-from"
                      type="email"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="onboarding@resend.dev (or yours)"
                    />
                  </div>
                </div>
              </div>
            )}

            {provider === 'smtp' && (
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 font-mono">
                  <Database className="w-4 h-4" />
                  SMTP Server Credentials
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1 md:col-span-2">
                    <label htmlFor="settings-smtp-host" className="block text-[11px] font-bold text-slate-650">SMTP Host</label>
                    <input
                      id="settings-smtp-host"
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="settings-smtp-port" className="block text-[11px] font-bold text-slate-650">SMTP Port</label>
                    <input
                      id="settings-smtp-port"
                      type="number"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(Number(e.target.value))}
                      placeholder="465"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="settings-smtp-user" className="block text-[11px] font-bold text-slate-650">SMTP Username</label>
                    <input
                      id="settings-smtp-user"
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="yourgmail@gmail.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="settings-smtp-pass" className="block text-[11px] font-bold text-slate-650">SMTP Authentication Password</label>
                    <input
                      id="settings-smtp-pass"
                      type="password"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="App-specific password"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="settings-smtp-from" className="block text-[11px] font-bold text-slate-650">Display Sender Brand</label>
                    <input
                      id="settings-smtp-from"
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="Funding Agent <info@yourdomain.com>"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'vercel' && (
        <div id="tab-content-vercel" className="space-y-4 animate-fadeIn p-2">
          <div className="flex items-center gap-2 border-b border-rose-55 pb-2">
            <Layers className="w-4 h-4 text-rose-500" />
            <h3 className="font-sans font-bold text-slate-800 text-sm tracking-wide uppercase font-mono">Deploying to Vercel</h3>
          </div>

          <p className="font-sans text-sm text-slate-600 leading-relaxed">
            One of your requirements was to keep the code **extremely easy to deploy on Vercel** and get updates **on a weekly basis**. Under the hood, this agent has been structured to run serverlessly on Vercel flawlessly!
          </p>

          <div className="space-y-3">
            <div className="bg-slate-900 rounded-xl p-4 space-y-2 text-slate-300 relative shadow-sm">
              <span className="absolute top-3 right-3 text-[10px] font-mono text-emerald-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-75 font-bold">
                vercel.json
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold font-mono">
                <Code className="w-4 h-4 text-indigo-400" />
                1. CONFIGURE VERCEL CRON FUNCTION
              </div>
              <p className="text-xs text-slate-400">
                To automate your weekly email digests completely, simply add a `vercel.json` file in your root with this schema:
              </p>
              <pre className="text-xs overflow-x-auto text-indigo-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
{`{
  "crons": [
    {
      "path": "/api/cron?email=${email || "your-email@example.com"}&roles=${roleInput.replace(/\s/g, '') || "Frontend,React"}&skills=${skillsInput.replace(/\s/g, '') || "TS"}&provider=${provider}&apiKey=${resendApiKey || "(OptionalKey)"}",
      "schedule": "0 9 * * 1" 
    }
  ]
}`}
              </pre>
              <p className="text-[10px] text-slate-400 font-sans italic">
                Schedule notation above runs exactly at 9:00 AM every Monday (Weekly schedule).
              </p>
            </div>

            <div className="border border-slate-100 bg-slate-50 rounded-xl p-4 text-xs space-y-2 text-slate-700">
              <div className="font-bold flex items-center gap-1.5 text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                2. SETUP ENVIRONMENT VARIABLES
              </div>
              <p className="leading-relaxed">
                When importing this repository into your Vercel Dashboard, go to **Project Settings {'>'} Environment Variables** and define standard environment configurations:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-slate-650">
                <li><strong className="text-slate-800">GEMINI_API_KEY</strong>: (Your Google Gemini authorization API key)</li>
                <li><strong className="text-slate-800">RESEND_API_KEY</strong>: (Your API key if using Resend natively)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          Settings are saved instantly in your local system session.
        </p>
        <button
          id="btn-save-settings"
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          {saveStatus === 'saved' ? 'Settings Saved Successfully!' : 'Save & Compile Pipeline'}
        </button>
      </div>

    </div>
  );
}
