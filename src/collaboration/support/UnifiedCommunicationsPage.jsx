import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Inbox, RefreshCw, Sparkles, MoreHorizontal } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import PageShell from '@/collaboration/PageShell';
import { fetchInboundEmails, getMessagePreview } from '@/services/communicationsService';

const formatDateTime = (value) => {
  if (!value) return 'Unknown time';

  try {
    return new Date(value).toLocaleString();
  } catch {
    return 'Unknown time';
  }
};

const joinAddresses = (items) => {
  if (!items || items.length === 0) return 'None';
  return items.join(', ');
};

const getInitials = (nameOrEmail) => {
  if (!nameOrEmail) return 'NA';

  const text = nameOrEmail.trim();
  if (!text) return 'NA';

  if (text.includes('@')) {
    const first = text[0]?.toUpperCase() || 'N';
    return `${first}`;
  }

  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const splitBodyToLines = (text) => {
  if (!text) return [];
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd());
};

const OTHER_KEYWORDS = [
  'unsubscribe',
  'newsletter',
  'job alert',
  'promotion',
  'digest',
  'notification',
  'daily update',
  'weekly update',
  'no-reply',
  'noreply',
  'automated message',
  'receipt',
  'invoice',
  'reddit',
];

const isOtherMessage = (message) => {
  const subject = (message.subject || '').toLowerCase();
  const preview = (getMessagePreview(message) || '').toLowerCase();
  const fromEmail = (message.from_email || '').toLowerCase();

  if (fromEmail.includes('no-reply') || fromEmail.includes('noreply')) return true;
  return OTHER_KEYWORDS.some((keyword) => subject.includes(keyword) || preview.includes(keyword));
};

const formatShortTime = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
};

const UnifiedCommunicationsPage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('focused');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const focusedMessages = useMemo(
    () => messages.filter((message) => !isOtherMessage(message)),
    [messages]
  );

  const otherMessages = useMemo(
    () => messages.filter((message) => isOtherMessage(message)),
    [messages]
  );

  const visibleMessages = useMemo(
    () => (activeTab === 'other' ? otherMessages : focusedMessages),
    [activeTab, focusedMessages, otherMessages]
  );

  const selected = useMemo(
    () => visibleMessages.find((item) => item.id === selectedId) || visibleMessages[0] || null,
    [visibleMessages, selectedId]
  );

  useEffect(() => {
    if (!selected) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !visibleMessages.some((item) => item.id === selectedId)) {
      setSelectedId(selected.id);
    }
  }, [selected, selectedId, visibleMessages]);

  const loadInbox = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchInboundEmails();
      setMessages(data);
      if (data.length > 0) {
        setSelectedId((current) => current || data[0].id);
      } else {
        setSelectedId(null);
      }
    } catch (e) {
      setError(e.message || 'Failed to load inbound messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  return (
    <PageShell
      className="h-full overflow-y-auto max-w-none p-3 pt-3 md:p-4 md:pt-4"
      title="Unified Communications"
      subtitle="Inbound email inbox powered by Resend webhook events"
      actions={
        <Button variant="outline" size="sm" onClick={loadInbox} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      <div className="space-y-3">
        <Card className="py-3">
          <CardHeader className="pb-2 px-4">
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Inbound Inbox
            </CardTitle>
            <CardDescription>
              {visibleMessages.length} message(s) shown
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 pb-3">
            {error && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              </div>
            )}

            {visibleMessages.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                {activeTab === 'other'
                  ? 'No emails in Other yet.'
                  : 'No inbound emails yet. Send a message to your configured Resend inbound domain to populate this inbox.'}
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-[390px_1fr]">
                <div className="rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/90">
                    <div className="flex items-center gap-5 text-[23px] leading-none">
                      <button
                        type="button"
                        onClick={() => setActiveTab('focused')}
                        className={activeTab === 'focused'
                          ? 'font-semibold text-slate-900 border-b-2 border-blue-600 pb-1'
                          : 'font-medium text-slate-500 hover:text-slate-700 pb-1'}
                      >
                        Focused
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('other')}
                        className={activeTab === 'other'
                          ? 'font-semibold text-slate-900 border-b-2 border-blue-600 pb-1'
                          : 'font-medium text-slate-500 hover:text-slate-700 pb-1'}
                      >
                        Other
                      </button>
                    </div>
                    <div className="text-sm font-medium text-slate-600">By Date</div>
                  </div>

                  <div className="max-h-[560px] overflow-y-auto">
                    {visibleMessages.map((message) => {
                      const active = selected?.id === message.id;
                      return (
                        <button
                          key={message.id}
                          type="button"
                          onClick={() => setSelectedId(message.id)}
                          className={`w-full text-left px-2.5 py-2 border-b border-slate-200 transition-colors relative ${
                            active
                              ? 'bg-sky-100/80'
                              : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          {active && <span className="absolute left-0 top-0 h-full w-1 bg-blue-600" />}
                          <div className="flex items-start gap-2.5">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center text-xs font-semibold uppercase">
                              {getInitials(message.from_name || message.from_email)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-[16px] font-semibold text-slate-900">
                                  {message.from_name || message.from_email || 'Unknown sender'}
                                </p>
                                <span className="shrink-0 text-xs text-slate-600">{formatShortTime(message.received_at)}</span>
                              </div>

                              <p className="truncate text-[15px] leading-snug text-slate-900 mt-0.5">
                                {message.subject || '(No subject)'}
                              </p>
                              <p className="truncate text-[14px] leading-snug text-slate-600 mt-0.5">
                                {getMessagePreview(message)}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-100/60 p-2.5 lg:p-3">
                  {!selected ? (
                    <p className="text-sm text-muted-foreground">Select a message to view details.</p>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="rounded-lg border border-slate-300 bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold leading-snug text-slate-900">
                            {selected.subject || '(No subject)'}
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 rounded-md border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          >
                            <Sparkles className="h-4 w-4" />
                            Summarize
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-300 bg-white shadow-sm">
                        <div className="flex items-start gap-3 px-4 py-2.5 border-b border-slate-200">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-semibold uppercase">
                            {getInitials(selected.from_name || selected.from_email)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-slate-900">
                              {selected.from_name || selected.from_email || 'Unknown sender'}
                              {selected.from_email && selected.from_name ? ` <${selected.from_email}>` : ''}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-600">To: {joinAddresses(selected.to_emails)}</p>
                          </div>

                          <div className="text-right text-xs text-slate-600 whitespace-nowrap">
                            {formatDateTime(selected.received_at)}
                          </div>

                          <button
                            type="button"
                            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            aria-label="More options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="px-4 py-1.5 border-b border-slate-200 text-xs text-slate-600 bg-slate-50/80">
                          You replied on {formatDateTime(selected.received_at)}
                        </div>

                        <div className="px-5 py-4">
                          <div className="space-y-1.5 text-[16px] leading-[1.45] text-slate-900">
                            {splitBodyToLines(selected.text_body || getMessagePreview(selected)).map((line, index) => (
                              <p key={`${selected.id}-line-${index}`} className="whitespace-pre-wrap break-words">
                                {line || '\u00A0'}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
};

export default UnifiedCommunicationsPage;
