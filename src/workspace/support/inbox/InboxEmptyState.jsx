import React from 'react';
import { Mail, MessageSquare, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function InboxEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/30 p-8 rounded-xl border-2 border-dashed border-slate-700/50 m-4">
      <div className="w-24 h-24 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
        <Mail className="h-10 w-10 absolute opacity-80" style={{ transform: 'translate(-10px, -10px)' }} />
        <MessageSquare className="h-10 w-10 absolute opacity-80 text-emerald-400" style={{ transform: 'translate(10px, 10px)' }} />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-100 mb-2">Your Unified Inbox</h2>
      <p className="text-slate-400 text-center max-w-md mb-8">
        Connect your communication channels to manage emails, WhatsApp, and SMS all under one roof with AI-powered support triage.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
        <div className="bg-slate-900/40 p-4 rounded-xl shadow-sm border border-slate-800 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center mb-3">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-sm">Emails</h3>
          <p className="text-xs text-slate-400 mt-1">Outlook, Gmail, IMAP</p>
        </div>
        <div className="bg-slate-900/40 p-4 rounded-xl shadow-sm border border-slate-800 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-3">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-sm">WhatsApp</h3>
          <p className="text-xs text-slate-400 mt-1">Business API or Twilio</p>
        </div>
        <div className="bg-slate-900/40 p-4 rounded-xl shadow-sm border border-slate-800 flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center mb-3">
            <Smartphone className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-sm">SMS</h3>
          <p className="text-xs text-slate-400 mt-1">Direct SMS alerts</p>
        </div>
      </div>

      <button 
        onClick={() => navigate('/collaboration/settings')}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center space-x-2 cursor-pointer"
      >
        <span>Connect Your First Inbox</span>
        <ArrowRight className="h-4 w-4" />
      </button>

      <div className="mt-8 flex items-center space-x-2 text-sm text-slate-500">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Securely encrypted. We never store your passwords.</span>
      </div>
    </div>
  );
}
