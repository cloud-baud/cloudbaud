import React, { useState } from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Send, 
  CornerDownRight, 
  X, 
  Bot
} from 'lucide-react';
import { useViewAs } from '../ViewAsContext';

/**
 * Intelligent simulation / AI assistant tax knowledge responses for CloudBot
 */
const generateBotTaxAdvice = (targetTitle, targetType, query) => {
  const q = (query || '').toLowerCase();
  const title = targetTitle || 'Line Item';

  if (q.includes('deduct') || q.includes('loss') || title.includes('Comfort Foods')) {
    return `🤖 **CloudBot CPA Analysis for ${title}:**\nUnder IRC § 469 (Passive Activity Loss Rules), trade or business losses where the taxpayer materially participated (IRC § 469(h)) can offset active W-2 income. Ensure material participation is documented (>500 hours or primary management). Schedule C Line 31 net loss flows to Schedule 1 Line 3.`;
  }
  if (q.includes('w2') || q.includes('wage') || title.includes('W2')) {
    return `🤖 **CloudBot CPA Analysis for ${title}:**\nBox 1 wages ($69,549.66) reconcile with Form 1040 Line 1a. Ensure federal income tax withheld (Box 2) is matched to Form 1040 Line 25a to credit estimated withholdings correctly.`;
  }
  if (q.includes('cloudbaud') || q.includes('biz') || title.includes('CloudBaud')) {
    return `🤖 **CloudBot CPA Analysis for ${title}:**\nFor single-member LLC / S-Corp pass-through ($365,772.34), verify Section 199A Qualified Business Income (QBI) deduction eligibility (up to 20% of QBI subject to W-2 wage / UBIA limitations).`;
  }
  return `🤖 **CloudBot Tax Assistant:**\nFor ${title}, review supporting documentation against IRS guidelines. Reviewer should verify matching 1099/W-2 statements, check classification, and record final Accept/Reject determination.`;
};

export default function AnnotationReviewPanel({
  targetType, // 'worksheet_row' | 'document' | 'form_line'
  targetId,
  targetTitle,
  year = 2020,
  thread,
  onSaveThread,
  onClose
}) {
  const { activePersona, isViewingAs } = useViewAs();
  const [commentText, setCommentText] = useState('');
  const [botQuery, setBotQuery] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [showBotPrompt, setShowBotPrompt] = useState(false);

  const comments = thread?.comments || [];
  const status = thread?.status || 'pending';

  const handleAddComment = (decision = null) => {
    if (!commentText.trim() && !decision) return;

    const newComment = {
      id: `c_${Date.now()}`,
      authorName: isViewingAs ? activePersona.name : 'Me (Owner)',
      authorRole: isViewingAs ? activePersona.role : 'Owner',
      authorInitials: isViewingAs ? activePersona.initials : 'ME',
      text: commentText.trim() || (decision === 'accepted' ? 'Marked as Approved & Accepted.' : decision === 'rejected' ? 'Marked as Rejected / Needs Correction.' : 'Updated status.'),
      decision: decision,
      createdAt: new Date().toISOString()
    };

    const newStatus = decision ? decision : status;

    const updatedThread = {
      id: thread?.id || `th_${targetType}_${targetId}_${year}`,
      targetType,
      targetId,
      targetTitle,
      year,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      comments: [...comments, newComment]
    };

    onSaveThread(updatedThread);
    setCommentText('');
  };

  const handleAskBot = () => {
    if (!botQuery.trim()) return;
    setIsBotLoading(true);
    setTimeout(() => {
      const response = generateBotTaxAdvice(targetTitle, targetType, botQuery);
      setBotResponse(response);
      setIsBotLoading(false);
    }, 600);
  };

  const handleInsertBotResponse = () => {
    if (!botResponse) return;
    setCommentText((prev) => (prev ? `${prev}\n\n${botResponse}` : botResponse));
    setBotResponse('');
    setShowBotPrompt(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-white text-xs border-l border-white/10 shadow-2xl animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-3 bg-[#131b2e] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <MessageSquare className="size-4 text-blue-400 shrink-0" />
          <div className="truncate">
            <h3 className="font-bold text-sm truncate text-white">{targetTitle || 'Review & Notes'}</h3>
            <div className="flex items-center gap-2 text-[10px] text-white/50">
              <span className="capitalize">{targetType?.replace('_', ' ')}</span>
              <span>•</span>
              <span>Tax Year {year}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
            status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {status === 'accepted' ? <CheckCircle2 className="size-3" /> :
             status === 'rejected' ? <XCircle className="size-3" /> :
             <Clock className="size-3" />}
            {status}
          </span>

          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition">
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bot Assistant Quick Bar */}
      <div className="bg-blue-950/40 border-b border-blue-500/20 px-3 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-blue-300 font-medium text-[11px]">
          <Sparkles className="size-3.5 text-blue-400" />
          <span>Ask CloudBot CPA Assistant</span>
        </div>
        <button 
          onClick={() => setShowBotPrompt(!showBotPrompt)}
          className="text-[11px] text-blue-400 hover:text-blue-200 underline font-medium"
        >
          {showBotPrompt ? 'Hide AI' : '🤖 Ask Bot'}
        </button>
      </div>

      {/* Bot Interactive Prompt Drawer */}
      {showBotPrompt && (
        <div className="p-3 bg-[#0d1527] border-b border-blue-500/20 space-y-2 shrink-0">
          <div className="flex gap-2">
            <input
              value={botQuery}
              onChange={(e) => setBotQuery(e.target.value)}
              placeholder={`Ask Bot regarding ${targetTitle}... (e.g. deduction rules, documentation)`}
              className="flex-1 bg-slate-900 border border-blue-500/30 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAskBot()}
            />
            <button
              onClick={handleAskBot}
              disabled={isBotLoading || !botQuery.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium px-3 py-1.5 rounded transition flex items-center gap-1"
            >
              {isBotLoading ? <Clock className="size-3 animate-spin" /> : <Bot className="size-3.5" />}
              <span>Ask</span>
            </button>
          </div>

          {botResponse && (
            <div className="p-2.5 bg-blue-950/60 border border-blue-500/30 rounded text-blue-100 text-[11px] space-y-2">
              <div className="whitespace-pre-wrap leading-relaxed">{botResponse}</div>
              <div className="flex justify-end gap-2 pt-1 border-t border-blue-500/20">
                <button 
                  onClick={handleInsertBotResponse}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[10px] font-semibold text-white transition"
                >
                  Insert into Comment
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comment / Annotation Thread History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40 space-y-2">
            <MessageSquare className="size-8 opacity-40 text-blue-400" />
            <p className="font-medium text-xs">No comments or reviewer notes yet.</p>
            <p className="text-[11px] text-white/30 max-w-[200px]">
              CPA David Ramsey or the Owner can annotate, ask questions, and make Accept/Reject decisions.
            </p>
          </div>
        ) : (
          comments.map((c, idx) => (
            <div 
              key={c.id || idx} 
              className={`p-3 rounded-lg border text-xs space-y-1.5 transition ${
                c.decision === 'accepted' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-100' :
                c.decision === 'rejected' ? 'bg-red-950/30 border-red-500/30 text-red-100' :
                c.authorRole?.includes('CPA') ? 'bg-blue-950/30 border-blue-500/30 text-white' :
                'bg-slate-900/60 border-white/10 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    c.authorRole?.includes('CPA') ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'
                  }`}>
                    {c.authorInitials || 'U'}
                  </span>
                  <span className="font-bold text-white text-[11px]">{c.authorName}</span>
                  <span className="text-[10px] text-white/40">({c.authorRole})</span>
                </div>
                <span className="text-[10px] text-white/40">
                  {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>

              <div className="text-white/90 whitespace-pre-wrap pl-6 leading-relaxed">
                {c.text}
              </div>

              {c.decision && (
                <div className="pl-6 pt-1 flex items-center gap-1 text-[10px] font-semibold">
                  {c.decision === 'accepted' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="size-3" /> Decision: Accepted / Approved</span>}
                  {c.decision === 'rejected' && <span className="text-red-400 flex items-center gap-1"><XCircle className="size-3" /> Decision: Rejected / Requires Revision</span>}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reviewer Action Bar (Accept / Reject / Comment) */}
      <div className="p-3 bg-[#131b2e] border-t border-white/10 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-white/60">
          <span className="flex items-center gap-1">
            <CornerDownRight className="size-3 text-blue-400" />
            Responding as <b>{isViewingAs ? activePersona.name : 'Me (Owner)'}</b>
          </span>
          <span className="text-[10px] text-white/40">Reviewer Decision Flow</span>
        </div>

        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add your note, response, or feedback for this item..."
          className="w-full bg-[#0a0f1d] border border-white/15 rounded p-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px]"
        />

        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Quick Decision Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAddComment('accepted')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-semibold text-[11px] transition"
              title="Accept and approve this item"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Accept</span>
            </button>

            <button
              onClick={() => handleAddComment('rejected')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 font-semibold text-[11px] transition"
              title="Reject or flag this item"
            >
              <XCircle className="size-3.5" />
              <span>Reject</span>
            </button>
          </div>

          {/* Standard Comment Submit */}
          <button
            onClick={() => handleAddComment(null)}
            disabled={!commentText.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-[11px] transition shadow-sm"
          >
            <Send className="size-3" />
            <span>Comment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
