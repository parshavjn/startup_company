import React, { useState } from 'react';
import { Company, UserProfile } from '../types';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Globe, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  BookmarkCheck, 
  Copy, 
  FileText, 
  Target, 
  Award,
  Sparkles,
  SearchCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompanyCardProps {
  key?: string | number;
  company: Company;
  profile: UserProfile;
}

export default function CompanyCard({ company, profile }: CompanyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <motion.div 
      id={`company-card-${company.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Card Header Brief */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-sans font-bold text-xl text-slate-900">{company.name}</h3>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-sans font-semibold text-xs rounded-full border border-emerald-100 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {company.fundingRound}
                </span>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-sans font-semibold text-xs rounded-full border border-indigo-100 flex items-center gap-1 animate-pulse">
                  <DollarSign className="w-3 h-3 -mr-1" />
                  {company.fundingAmount}
                </span>
              </div>
              <p className="font-sans text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {company.headquarters}
                <span className="text-slate-300 mx-1.5">•</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                  {company.industry}
                </span>
                <span className="text-slate-300 mx-1.5">•</span>
                <Globe className="w-3 h-3" />
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-indigo-600 hover:underline flex items-center gap-0.5 text-xs text-slate-400"
                >
                  Website
                </a>
              </p>
            </div>
          </div>

          <button
            id={`btn-toggle-info-${company.id}`}
            onClick={() => setIsExpanded(!isExpanded)}
            className="self-start sm:self-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm rounded-lg flex items-center gap-1.5 transition-colors duration-150 border border-slate-100 cursor-pointer"
          >
            {isExpanded ? (
              <>
                Hide Details
                <ChevronUp className="w-4 h-4 text-slate-500" />
              </>
            ) : (
              <>
                View Job Strategy
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </>
            )}
          </button>
        </div>

        {/* Funding & Contact Summary Box */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/70 border border-slate-100/80 rounded-xl p-3.5 text-xs text-slate-600 font-sans">
          <div className="flex items-start gap-2">
            <span className="text-slate-500 mt-0.5">📅</span>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Date of Funding</span>
              <span className="font-medium text-slate-800">{company.date}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 border-slate-200/60 md:border-l md:pl-3">
            <span className="text-slate-500 mt-0.5">🤝</span>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Key Investors</span>
              <span className="font-medium text-slate-800 line-clamp-1 hover:line-clamp-none transition-all duration-150" title={company.investors}>
                {company.investors}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2 border-slate-200/60 md:border-l md:pl-3">
            <span className="text-slate-500 mt-0.5">✉️</span>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Recruitment Contact</span>
              <a 
                href={`mailto:${company.contactEmail}`}
                className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline break-all"
              >
                {company.contactEmail}
              </a>
            </div>
          </div>
        </div>

        <p className="mt-4 font-sans text-sm leading-relaxed text-slate-600">
          {company.description}
        </p>

        {/* Key Team & Founders Section */}
        {company.keyMembers && company.keyMembers.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-100/70">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider mb-2 font-mono">👥 Key Team & LinkedIn Profiles</span>
            <div className="flex flex-wrap gap-2">
              {company.keyMembers.map((member, index) => {
                // Leverage Google Search to bypass LinkedIn's strict search restriction filters & login walls
                const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${member.name} ${company.name} LinkedIn`)}`;
                return (
                  <a
                    key={index}
                    href={googleSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 hover:border-indigo-200 rounded-lg text-xs font-sans text-slate-700 hover:text-indigo-700 transition-all duration-150 shadow-2xs group"
                    title={`Google Search for ${member.name}'s LinkedIn Profile`}
                  >
                    <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span className="font-semibold text-slate-800 group-hover:text-indigo-900">{member.name}</span>
                    <span className="text-slate-500 text-[10px] font-medium">({member.role})</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-indigo-500">🔍</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Past & Future Jobs Timeline Section */}
        {((company.pastJobs && company.pastJobs.length > 0) || (company.futureJobs && company.futureJobs.length > 0)) && (
          <div className="mt-4 pt-3.5 border-t border-slate-100/70">
            {/* Live Search Buttons for Verification */}
            <div className="mb-4">
              <span className="text-[10px] text-indigo-600 block font-bold uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                🔎 Verified Real-Time Job Explorers (Avoid Fabricated Data)
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(company.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all duration-150 shadow-sm cursor-pointer"
                  title="Search Active Positions on LinkedIn"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  Search LinkedIn Jobs
                </a>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${company.name} careers engineering vacancies`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all duration-150 cursor-pointer"
                  title="Search Current Vacancies on Google"
                >
                  <span>🌐</span>
                  Google Jobs Search
                </a>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg transition-all duration-150 cursor-pointer"
                  title="Visit corporate website careers"
                >
                  <span>🏢</span>
                  Careers Website
                </a>
              </div>
            </div>

            {/* Authenticity Signal Notice */}
            <div className="bg-amber-50/50 border border-amber-100/60 rounded-xl p-3 mb-3.5 text-[11px] text-amber-800 leading-relaxed font-sans flex items-start gap-2">
              <span className="text-sm mt-0.5">💡</span>
              <div>
                <span className="font-bold">Hiring Signal Analysis:</span> The roles listed below represent hiring trends and department goals deduced from public funding and executive announcements. To verify real-time, 100% active postings, please use the live portals above.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {company.pastJobs && company.pastJobs.length > 0 && (
                <div className="bg-slate-50/50 border border-slate-100/80 rounded-xl p-3.5">
                  <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                    📦 Recent Growth Benchmarks (Past)
                  </span>
                  <ul className="space-y-2">
                    {company.pastJobs.map((job, index) => {
                      const cleanJobTitle = job.split(' - ')[0].replace(/\s*\(.*?\)\s*/g, ' ').trim();
                      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${company.name} ${cleanJobTitle} careers OR vacancy OR job description`)}`;
                      return (
                        <li key={index}>
                          <a
                            href={searchUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-start gap-2 text-xs text-slate-600 hover:text-indigo-600 font-sans group/job transition-colors py-0.5 cursor-pointer"
                            title={`Google Search for ${cleanJobTitle} Job Description`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/job:bg-indigo-400 mt-1.5 flex-shrink-0 transition-colors"></span>
                            <span className="font-medium underline decoration-slate-200 group-hover/job:decoration-indigo-400 decoration-1 underline-offset-2 transition-all">
                              {job} <span className="opacity-0 group-hover/job:opacity-100 text-[10px] ml-0.5 transition-opacity inline-block">↗</span>
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              
              {company.futureJobs && company.futureJobs.length > 0 && (
                <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-xl p-3.5">
                  <span className="text-[10px] text-emerald-700 block font-bold uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                    🚀 Expected Tech Expansion Roles (Future)
                  </span>
                  <ul className="space-y-2">
                    {company.futureJobs.map((job, index) => {
                      const cleanJobTitle = job.split(' - ')[0].replace(/\s*\(.*?\)\s*/g, ' ').trim();
                      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${company.name} ${cleanJobTitle} careers OR apply OR direct`)}`;
                      return (
                        <li key={index}>
                          <a
                            href={searchUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-start gap-2 text-xs text-emerald-800 hover:text-emerald-950 font-sans group/job transition-colors py-0.5 cursor-pointer"
                            title={`Search apply options for ${cleanJobTitle}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover/job:bg-emerald-600 mt-1.5 flex-shrink-0 transition-colors"></span>
                            <span className="font-semibold underline decoration-emerald-200 group-hover/job:decoration-emerald-700 decoration-1 underline-offset-2 transition-all">
                              {job} <span className="opacity-0 group-hover/job:opacity-100 text-[10px] ml-0.5 transition-opacity inline-block">↗</span>
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Application Strategy Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-slate-100 bg-slate-50/50"
          >
            <div className="p-6 space-y-6">
              
              {/* Section 1: Growth Signaling Analysis */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-sans font-bold text-sm text-indigo-900 tracking-wide uppercase font-mono">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Growth Signaling Outlook
                </h4>
                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-2xs">
                  <p className="font-sans text-sm text-slate-700 leading-relaxed">
                    {company.jobSearchGuideline.generalStrategy}
                  </p>
                </div>
              </div>

              {/* Section 2: Role Specific Advice */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-sans font-bold text-sm text-slate-800 tracking-wide uppercase font-mono">
                  <Target className="w-4 h-4 text-rose-500" />
                  Resume & Portfolio Pivot
                </h4>
                <div className="space-y-3">
                  {company.jobSearchGuideline.specificRoles.map((roleGuide, index) => (
                    <div 
                      key={index} 
                      className="bg-white border-l-4 border-l-indigo-500 border border-slate-100 rounded-r-xl rounded-l-md p-4 shadow-2xs flex items-start gap-3"
                    >
                      <div className="mt-0.5 p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-sans font-bold text-slate-900 text-sm">Advice for: {roleGuide.role}</h5>
                        <p className="font-sans text-xs text-slate-600 mt-1 leading-relaxed">
                          {roleGuide.advice}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Conversation Starters / Cold Email Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-2 font-sans font-bold text-sm text-slate-800 tracking-wide uppercase font-mono">
                    <Send className="w-4 h-4 text-emerald-500" />
                    Cold Outreach Hook Generator
                  </h4>
                  <button
                    id={`btn-copy-template-${company.id}`}
                    onClick={() => handleCopy(company.jobSearchGuideline.contactTips)}
                    className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedText ? 'Copied to Clipboard!' : 'Copy Template'}
                  </button>
                </div>
                <div className="relative bg-indigo-950 text-indigo-100 rounded-xl p-4 font-mono text-xs shadow-inner leading-relaxed whitespace-pre-wrap">
                  {company.jobSearchGuideline.contactTips}
                </div>
              </div>

              {/* Section 4: Domain & Technical Interview Challenges */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-sans font-bold text-sm text-slate-800 tracking-wide uppercase font-mono">
                  <SearchCode className="w-4 h-4 text-amber-500" />
                  Tech Assessment Prep
                </h4>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 shadow-2xs">
                  <p className="font-sans text-sm text-amber-900 leading-relaxed">
                    {company.jobSearchGuideline.interviewTips}
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
