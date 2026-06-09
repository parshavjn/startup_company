import React, { useState } from 'react';
import { EmailLog } from '../types';
import { 
  Mail, 
  Clock, 
  Send, 
  Eye, 
  Terminal, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  ChevronRight,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmailSimulatorProps {
  logs: EmailLog[];
  onTriggerSend: () => void;
  isSending: boolean;
  activeHtmlEmail: string | null;
}

export default function EmailSimulator({ 
  logs, 
  onTriggerSend, 
  isSending,
  activeHtmlEmail 
}: EmailSimulatorProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [showHtmlCode, setShowHtmlCode] = useState(false);

  // Find the selected log or fallback to the active HTML email from the most recent send
  const displayHtml = activeHtmlEmail;

  return (
    <div id="email-simulator-panel" className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
      
      {/* Block Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
        <div>
          <h3 className="font-sans font-bold text-slate-800 text-sm tracking-wide uppercase font-mono flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-emerald-500" />
            Weekly Digest Control Panel
          </h3>
          <p className="font-sans text-xs text-slate-500 mt-1">
            Trigger a manual run, inspect delivery parameters, and preview the newsletters.
          </p>
        </div>

        <button
          id="btn-run-manual-agent"
          onClick={onTriggerSend}
          disabled={isSending}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm rounded-xl transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 shrink-0 self-start sm:self-center"
        >
          <Send className="w-4 h-4" />
          {isSending ? 'Generating & Routing...' : 'Trigger Automated Email Dispatch'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: History & Delivery Logs */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 font-mono tracking-wider uppercase">
            <Clock className="w-4 h-4" />
            Activity Timeline ({logs.length})
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50 p-4">
                <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-sans text-xs font-semibold text-slate-500">No logs generated yet</p>
                <p className="font-sans text-[11px] text-slate-400 p-2 leading-relaxed">
                  Click 'Trigger Automated Email' or load new companies first to create your initial sandbox simulation.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`p-3.5 rounded-xl border transition-all duration-150 text-left cursor-pointer ${
                    selectedLogId === log.id 
                      ? 'border-indigo-500 bg-indigo-50/20 shadow-2xs' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(log.sentAt).toLocaleTimeString()}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 ${
                      log.status === 'success' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {log.status === 'success' ? (
                        <>
                          <CheckCircle2 className="w-3" /> Sent
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3" /> Failed
                        </>
                      )}
                    </span>
                  </div>

                  <p className="font-sans font-bold text-slate-800 text-xs mt-1.5 truncate">
                    {log.subject}
                  </p>
                  <p className="font-sans text-slate-500 text-[11px] mt-0.5 truncate">
                    To: {log.recipient} • {log.companiesCount} companies
                  </p>

                  {log.errorMessage && (
                    <p className="font-mono text-rose-600 text-[10px] mt-1.5 bg-rose-50 px-2 py-1 rounded truncate">
                      Err: {log.errorMessage}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Visual Email Previewer Mockup */}
        <div id="email-preview-container" className="lg:col-span-8 flex flex-col h-[520px] bg-slate-50 rounded-2xl border border-slate-150 overflow-hidden">
          
          {/* Preview Bar Options */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold font-mono">
              <Eye className="w-4 h-4 text-indigo-500" />
              Live Inbox Visualizer
            </div>

            {displayHtml && (
              <button
                id="btn-toggle-code-view"
                onClick={() => setShowHtmlCode(!showHtmlCode)}
                className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer"
              >
                <Code className="w-3.5 h-3.5" />
                {showHtmlCode ? 'Show Render' : 'Inspect HTML Code'}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden p-4 relative">
            {displayHtml ? (
              <div className="w-full h-full bg-white rounded-xl shadow-xs border border-slate-150 overflow-hidden flex flex-col">
                
                {/* Browser Address Bar Mock */}
                <div className="bg-slate-50 border-b border-indigo-50/50 p-3 space-y-1 text-xs text-slate-500 font-sans">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-mono"><strong>From:</strong> Funded Startup Agent &lt;weekly@funded-news.com&gt;</span>
                    <span className="text-[10px] text-slate-400">{new Date().toDateString()}</span>
                  </div>
                  <div>
                    <span className="font-mono"><strong>Subject:</strong> 🚀 Funded Startup Job Pipeline: Matching your Profile</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {showHtmlCode ? (
                    <textarea
                      readOnly
                      className="w-full h-full p-4 font-mono text-xs bg-slate-950 text-slate-350 focus:outline-hidden resize-none"
                      value={displayHtml}
                    />
                  ) : (
                    <iframe
                      id="html-email-canvas-frame"
                      srcDoc={displayHtml}
                      title="Newsletter Mock"
                      referrerPolicy="no-referrer"
                      sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin"
                      className="w-full h-full border-none bg-[#f3f4f6]"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                <FileCheck className="w-12 h-12 text-slate-300 stroke-1 mb-3 animate-pulse" />
                <h4 className="font-sans font-bold text-slate-650 text-sm">Visual Digest Simulation Ready</h4>
                <p className="font-sans text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                  Trigger an automated email dispatch to test the pipeline. The visual representation will render right here instantly!
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
