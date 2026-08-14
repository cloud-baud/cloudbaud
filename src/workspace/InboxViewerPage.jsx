import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StandardInbox, StandardRibbon } from 'synolic.core';
import { User, FileText, Paperclip, Tag, Send, Mail, Flag, AlertTriangle, Plus, Layers, Inbox, Search, Wrench, XSquare } from 'lucide-react';

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

  // Outlook Ribbon active states
  const [activeRibbonTab, setActiveRibbonTab] = useState('Search');
  const [onlyHasAttachments, setOnlyHasAttachments] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('current_mailbox');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [importantOnly, setImportantOnly] = useState(false);
  const [subjectFilterActive, setSubjectFilterActive] = useState(false);
  const [senderFilterActive, setSenderFilterActive] = useState(false);
  const [ribbonSearchQuery, setRibbonSearchQuery] = useState('');


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

  // Ribbon filtering layer
  const processedMessages = useMemo(() => {
    let list = messages;

    // 1. Attachment Filter
    if (onlyHasAttachments) {
      list = list.filter((m) => m.attachments && m.attachments.length > 0);
    }

    // 2. Unread Filter
    if (unreadOnly) {
      list = list.filter((m) => m.unread);
    }

    // 3. Category Filter
    if (categoryFilter !== 'all') {
      list = list.filter((m) => String(m.category || 'General').toLowerCase() === categoryFilter.toLowerCase());
    }

    // 4. Flagged & Important Filters
    if (flaggedOnly) {
      list = list.filter((m) => /(invoice|payment|tax|w2|billing|receipt|bank|payroll|finance|action|urgent|verify|flag|todo|please)/i.test(m.subject + ' ' + m.body));
    }
    if (importantOnly) {
      list = list.filter((m) => m.category === 'Security' || m.category === 'Finance');
    }

    // 5. Scope filter simulation
    if (scopeFilter === 'current_folder') {
      list = list.filter((m) => m.folderId === 'inbox');
    }

    return list;
  }, [messages, onlyHasAttachments, unreadOnly, categoryFilter, flaggedOnly, importantOnly, scopeFilter]);

  // High-fidelity Office-like Ribbon Config
  const searchRibbonConfig = useMemo(() => {
    return [
      { id: 'File', label: 'File', groups: [] },
      { id: 'Home', label: 'Home', groups: [] },
      { id: 'Send / Receive', label: 'Send / Receive', groups: [] },
      { id: 'Folder', label: 'Folder', groups: [] },
      { id: 'View', label: 'View', groups: [] },
      { id: 'Developer', label: 'Developer', groups: [] },
      { id: 'Help', label: 'Help', groups: [] },
      {
        id: 'Search',
        label: 'Search',
        groups: [
          {
            id: 'Refine',
            label: 'Refine',
            columns: [
              {
                id: 'RefineCol1',
                items: [
                  {
                    id: 'from_filter',
                    label: 'From',
                    size: 'large',
                    icon: User,
                    active: senderFilterActive,
                    onClick: () => {
                      const input = window.prompt("Enter sender name or email keyword to search:");
                      if (input !== null) {
                        setRibbonSearchQuery(input);
                        setSenderFilterActive(!!input);
                      }
                    }
                  }
                ]
              },
              {
                id: 'RefineCol2',
                items: [
                  {
                    id: 'subject_filter',
                    label: 'Subject',
                    size: 'large',
                    icon: FileText,
                    active: subjectFilterActive,
                    onClick: () => {
                      const input = window.prompt("Enter subject keyword to search:");
                      if (input !== null) {
                        setRibbonSearchQuery(input);
                        setSubjectFilterActive(!!input);
                      }
                    }
                  }
                ]
              },
              {
                id: 'RefineCol3',
                items: [
                  {
                    id: 'attachments_filter',
                    label: 'Has Attachments',
                    size: 'large',
                    icon: Paperclip,
                    active: onlyHasAttachments,
                    onClick: () => setOnlyHasAttachments(prev => !prev)
                  }
                ]
              },
              {
                id: 'RefineCol4',
                items: [
                  {
                    id: 'categorized_filter',
                    label: 'Categorized',
                    type: 'dropdown',
                    size: 'large',
                    icon: Tag,
                    active: categoryFilter !== 'all',
                    dropdownItems: [
                      { id: 'cat_all', label: 'All Categories', active: categoryFilter === 'all', onClick: () => setCategoryFilter('all') },
                      { id: 'cat_fin', label: 'Finance', active: categoryFilter === 'Finance', onClick: () => setCategoryFilter('Finance') },
                      { id: 'cat_rec', label: 'Recruiting', active: categoryFilter === 'Recruiting', onClick: () => setCategoryFilter('Recruiting') },
                      { id: 'cat_sec', label: 'Security', active: categoryFilter === 'Security', onClick: () => setCategoryFilter('Security') },
                      { id: 'cat_sal', label: 'Sales', active: categoryFilter === 'Sales', onClick: () => setCategoryFilter('Sales') },
                      { id: 'cat_per', label: 'Personal', active: categoryFilter === 'Personal', onClick: () => setCategoryFilter('Personal') },
                      { id: 'cat_gen', label: 'General', active: categoryFilter === 'General', onClick: () => setCategoryFilter('General') },
                    ]
                  }
                ]
              },
              {
                id: 'RefineCol5',
                items: [
                  {
                    id: 'sent_to_filter',
                    label: 'Sent To',
                    type: 'dropdown',
                    size: 'small',
                    icon: Send,
                    dropdownItems: [
                      { id: 'st_me', label: 'Sent to Me', onClick: () => setRibbonSearchQuery('to:me') },
                      { id: 'st_not_me', label: 'Not Sent to Me', onClick: () => setRibbonSearchQuery('to:others') },
                    ]
                  },
                  {
                    id: 'unread_filter',
                    label: 'Unread',
                    type: 'button',
                    size: 'small',
                    icon: Mail,
                    active: unreadOnly,
                    onClick: () => setUnreadOnly(prev => !prev)
                  }
                ]
              },
              {
                id: 'RefineCol6',
                items: [
                  {
                    id: 'flagged_filter',
                    label: 'Flagged',
                    type: 'button',
                    size: 'small',
                    icon: Flag,
                    active: flaggedOnly,
                    onClick: () => setFlaggedOnly(prev => !prev)
                  },
                  {
                    id: 'important_filter',
                    label: 'Important',
                    type: 'button',
                    size: 'small',
                    icon: AlertTriangle,
                    active: importantOnly,
                    onClick: () => setImportantOnly(prev => !prev)
                  },
                  {
                    id: 'more_filter',
                    label: 'More',
                    type: 'dropdown',
                    size: 'small',
                    icon: Plus,
                    dropdownItems: [
                      { id: 'more_cc', label: 'CC\'d to Me', onClick: () => setRibbonSearchQuery('cc:me') },
                      { id: 'more_bcc', label: 'BCC\'d to Me', onClick: () => setRibbonSearchQuery('bcc:me') },
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'Scope',
            label: 'Scope',
            columns: [
              {
                id: 'ScopeCol1',
                items: [
                  {
                    id: 'all_mailboxes',
                    label: 'All Mailboxes',
                    size: 'large',
                    icon: Layers,
                    active: scopeFilter === 'all_mailboxes',
                    onClick: () => setScopeFilter('all_mailboxes')
                  }
                ]
              },
              {
                id: 'ScopeCol2',
                items: [
                  {
                    id: 'current_mailbox',
                    label: 'Current Mailbox',
                    size: 'large',
                    icon: Inbox,
                    active: scopeFilter === 'current_mailbox',
                    onClick: () => setScopeFilter('current_mailbox')
                  }
                ]
              },
              {
                id: 'ScopeCol3',
                items: [
                  {
                    id: 'scope_curr_folder',
                    label: 'Current Folder',
                    type: 'radio',
                    size: 'small',
                    checked: scopeFilter === 'current_folder',
                    onClick: () => setScopeFilter('current_folder')
                  },
                  {
                    id: 'scope_subfolders',
                    label: 'Subfolders',
                    type: 'radio',
                    size: 'small',
                    checked: scopeFilter === 'subfolders',
                    onClick: () => setScopeFilter('subfolders')
                  },
                  {
                    id: 'scope_all_items',
                    label: 'All Outlook Items',
                    type: 'radio',
                    size: 'small',
                    checked: scopeFilter === 'all_outlook',
                    onClick: () => setScopeFilter('all_outlook')
                  }
                ]
              }
            ]
          },
          {
            id: 'Options',
            label: 'Options',
            columns: [
              {
                id: 'OptionsCol1',
                items: [
                  {
                    id: 'recent_searches',
                    label: 'Recent Searches',
                    type: 'dropdown',
                    size: 'large',
                    icon: Search,
                    dropdownItems: [
                      { id: 'rec_1', label: 'Tax invoices', onClick: () => setRibbonSearchQuery('invoice') },
                      { id: 'rec_2', label: 'LinkedIn updates', onClick: () => setRibbonSearchQuery('linkedin') },
                      { id: 'rec_3', label: 'Resend integration', onClick: () => setRibbonSearchQuery('resend') },
                    ]
                  }
                ]
              },
              {
                id: 'OptionsCol2',
                items: [
                  {
                    id: 'search_tools',
                    label: 'Search Tools',
                    type: 'dropdown',
                    size: 'large',
                    icon: Wrench,
                    dropdownItems: [
                      { id: 'st_advanced', label: 'Advanced Find...', onClick: () => alert('Advanced Search dialog activated') },
                      { id: 'st_options', label: 'Search Options...', onClick: () => alert('Search settings opened') },
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'Close',
            label: 'Close',
            columns: [
              {
                id: 'CloseCol1',
                items: [
                  {
                    id: 'close_search',
                    label: 'Close Search',
                    size: 'large',
                    icon: XSquare,
                    onClick: () => {
                      setOnlyHasAttachments(false);
                      setUnreadOnly(false);
                      setCategoryFilter('all');
                      setScopeFilter('current_mailbox');
                      setFlaggedOnly(false);
                      setImportantOnly(false);
                      setSubjectFilterActive(false);
                      setSenderFilterActive(false);
                      setRibbonSearchQuery('');
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }, [senderFilterActive, subjectFilterActive, onlyHasAttachments, categoryFilter, unreadOnly, flaggedOnly, importantOnly, scopeFilter]);

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
    <div className="flex h-full flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      <StandardRibbon
        tabs={searchRibbonConfig}
        activeTabId={activeRibbonTab}
        onTabChange={setActiveRibbonTab}
      />
      <div className="flex-1 min-h-0">
        <StandardInbox
          className="h-full"
          messages={processedMessages}
          selectedMessageId={selectedMessageId}
          folders={folders}
          externalSearchQuery={ribbonSearchQuery || workspaceSearchQuery}
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
          emptyText="No emails matched your active Ribbon filters."
        />
      </div>
    </div>
  );

}
