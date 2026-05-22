import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StandardInbox } from 'synolic.core';

const INBOX_LIST_PATH = '/data/emails/cloudbaud.com/inbox-list.json';

function stripHtml(input) {
  return String(input || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function categorizeEmail(message) {
  const from = String(message?.from || '').toLowerCase();
  const subject = String(message?.subject || '').toLowerCase();
  const text = `${from} ${subject}`;

  if (/(invoice|payment|tax|w2|billing|receipt|bank|payroll|finance)/.test(text)) return 'Finance';
  if (/(resume|recruit|hiring|interview|position|candidate|job)/.test(text)) return 'Recruiting';
  if (/(security|alert|auth|password|phish|icloud storage is full|verification)/.test(text)) return 'Security';
  if (/(proposal|meeting|demo|pricing|quote|rate confirmation|client)/.test(text)) return 'Sales';
  if (/(support|ticket|help|issue|case)/.test(text)) return 'Support';
  if (/(newsletter|introducing|update|event|invite|community|promo|offer)/.test(text)) return 'Marketing';
  if (/(gmail\.com|yahoo\.com|outlook\.com)/.test(from)) return 'Personal';
  return 'General';
}

function toFolderCounts(messages) {
  const inboxCount = messages.filter((m) => m.folderId === 'inbox').length;
  const sentCount = messages.filter((m) => m.folderId === 'sent').length;
  const draftsCount = messages.filter((m) => m.folderId === 'drafts').length;
  const trashCount = messages.filter((m) => m.folderId === 'trash').length;
  const spamCount = messages.filter((m) => m.folderId === 'spam').length;
  const unread = messages.filter((m) => m.unread && m.folderId === 'inbox').length;
  return [
    { id: 'inbox', label: 'Inbox', count: inboxCount },
    { id: 'sent', label: 'Sent', count: sentCount },
    { id: 'spam', label: 'Spam', count: spamCount },
    { id: 'drafts', label: 'Drafts', count: draftsCount },
    { id: 'trash', label: 'Trash', count: trashCount },
    { id: 'unread', label: 'Unread', count: unread },
  ];
}

function inferFolderId(message) {
  const from = String(message?.from || '').toLowerCase();
  const subject = String(message?.subject || '').toLowerCase();
  const text = `${from} ${subject}`;

  if (from.includes('@cloudbaud.com')) return 'sent';

  if (/(icloud storage is full|verify account|urgent action required|password reset|winner|lottery|crypto|airdrop|click here|act now)/.test(text)) {
    return 'spam';
  }

  return 'inbox';
}

function toPreview(message) {
  const textPreview = stripHtml(message.text || message.html || message.raw || '').slice(0, 120);
  const preview = [message.subject, textPreview || message.from, ...(message.to || [])].filter(Boolean).join(' | ');
  return preview || '(No preview)';
}

export default function InboxViewerPage() {
  const outletContext = useOutletContext() || {};
  const workspaceSearchQuery = String(outletContext.workspaceSearchQuery || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useState('');

  async function loadInboxList() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(INBOX_LIST_PATH, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Inbox list not found. Run "npm run resend:sync" first.');
      }

      const payload = await response.json();
      const mapped = (payload?.messages || []).map((m) => ({
        id: m.id,
        folderId: inferFolderId(m),
        category: categorizeEmail(m),
        subject: m.subject || '(No subject)',
        from: m.from || 'Unknown sender',
        to: m.to || [],
        cc: m.cc || [],
        preview: toPreview(m),
        body: m.text || stripHtml(m.html) || stripHtml(m.raw) || m.preview || '',
        bodyHtml: m.html || '',
        createdAt: m.created_at,
        unread: false,
        attachments: (m.attachments || []).map((a) => ({
          id: a.id,
          filename: a.filename,
          contentType: a.content_type,
          size: a.size,
        })),
      }));

      setMessages(mapped);
      setSelectedMessageId((prev) => prev || mapped[0]?.id || '');
    } catch (err) {
      setError(err.message || 'Failed to load inbox list.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMessageDetails(messageId) {
    if (!messageId) return;

    const existing = messages.find((m) => m.id === messageId);
    if (existing?.body && existing.body.length > 220) return;

    try {
      const detailPath = `/data/emails/cloudbaud.com/${messageId}.json`;
      const response = await fetch(detailPath, { cache: 'no-store' });
      if (!response.ok) return;

      const payload = await response.json();
      const source = payload?.message || payload;

      const fullBody = source?.text || stripHtml(source?.html) || stripHtml(source?.raw) || existing?.body || '';
      const fullBodyHtml = source?.html || existing?.bodyHtml || '';
      const fullPreview = toPreview({
        ...source,
        text: source?.text,
        html: source?.html,
        raw: source?.raw,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                body: fullBody,
                bodyHtml: fullBodyHtml,
                preview: fullPreview,
                attachments: (source?.attachments || m.attachments || []).map((a) => ({
                  id: a.id,
                  filename: a.filename,
                  contentType: a.content_type || a.contentType,
                  size: a.size,
                })),
              }
            : m
        )
      );
    } catch {
      // Keep list payload as fallback if detail file is unavailable.
    }
  }

  useEffect(() => {
    loadInboxList();
  }, []);

  useEffect(() => {
    if (!selectedMessageId) return;
    loadMessageDetails(selectedMessageId);
  }, [selectedMessageId]);

  const folders = useMemo(() => toFolderCounts(messages), [messages]);

  function handleReply(message) {
    const cmd = `npm run resend:reply -- ${message.id} \"Thanks for your email.\"`;
    navigator.clipboard?.writeText(cmd);
    window.alert(`Reply command copied:\n\n${cmd}`);
  }

  function handleReplyAll(message) {
    const cmd = `npm run resend:reply-all -- ${message.id} \"Thanks everyone.\"`;
    navigator.clipboard?.writeText(cmd);
    window.alert(`Reply All command copied:\n\n${cmd}`);
  }

  function handleForward(message) {
    const cmd = `npm run resend:forward -- ${message.id} user@example.com`;
    navigator.clipboard?.writeText(cmd);
    window.alert(`Forward command copied:\n\n${cmd}`);
  }

  function handleMarkSpam(message) {
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, folderId: 'spam' } : m))
    );
    setSelectedMessageId('');
  }

  if (loading) {
    return <div className="p-4 text-sm text-neutral-500 dark:text-neutral-400">Loading inbox...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <StandardInbox
      className="h-full"
      messages={messages}
      selectedMessageId={selectedMessageId}
      folders={folders}
      externalSearchQuery={workspaceSearchQuery}
      hideSearchBox
      onSelectMessage={(message) => {
        setSelectedMessageId(message.id);
        loadMessageDetails(message.id);
      }}
      onRefresh={loadInboxList}
      onReply={handleReply}
      onReplyAll={handleReplyAll}
      onForward={handleForward}
      onMarkSpam={handleMarkSpam}
      emptyText="No emails in this mailbox yet."
    />
  );
}
