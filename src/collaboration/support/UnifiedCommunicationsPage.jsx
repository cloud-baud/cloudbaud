import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Inbox, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
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

const UnifiedCommunicationsPage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selected = useMemo(
    () => messages.find((item) => item.id === selectedId) || messages[0] || null,
    [messages, selectedId]
  );

  const filteredMessages = useMemo(() => {
    const needle = search.toLowerCase().trim();
    if (!needle) return messages;

    return messages.filter((item) => {
      const subject = item.subject?.toLowerCase() || '';
      const fromEmail = item.from_email?.toLowerCase() || '';
      const fromName = item.from_name?.toLowerCase() || '';
      const preview = getMessagePreview(item).toLowerCase();

      return (
        subject.includes(needle) ||
        fromEmail.includes(needle) ||
        fromName.includes(needle) ||
        preview.includes(needle)
      );
    });
  }, [messages, search]);

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
      title="Unified Communications"
      subtitle="Inbound email inbox powered by Resend webhook events"
      actions={
        <Button variant="outline" onClick={loadInbox} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Resend Inbound Setup
            </CardTitle>
            <CardDescription>
              Configure Resend inbound routing to post to /api/resend/inbound. The webhook stores each inbound message in Supabase table communications_inbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Webhook URL: {window.location.origin}/api/resend/inbound</p>
            <p>Required server env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_WEBHOOK_TOKEN (recommended).</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  Inbound Inbox
                </CardTitle>
                <CardDescription>
                  {filteredMessages.length} message(s) shown
                </CardDescription>
              </div>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by sender, subject, or content"
                className="md:max-w-sm"
              />
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              </div>
            )}

            {filteredMessages.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                No inbound emails yet. Send a message to your configured Resend inbound domain to populate this inbox.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {filteredMessages.map((message) => {
                    const active = selected?.id === message.id;
                    return (
                      <button
                        key={message.id}
                        type="button"
                        onClick={() => setSelectedId(message.id)}
                        className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                          active
                            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm truncate">
                            {message.from_name || message.from_email || 'Unknown sender'}
                          </p>
                          <Badge variant="outline">{message.provider || 'resend'}</Badge>
                        </div>
                        <p className="mt-1 text-sm font-semibold truncate">{message.subject || '(No subject)'}</p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{getMessagePreview(message)}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(message.received_at)}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-lg border p-4 bg-background">
                  {!selected ? (
                    <p className="text-sm text-muted-foreground">Select a message to view details.</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">{selected.subject || '(No subject)'}</h3>
                        <p className="text-xs text-muted-foreground">Received {formatDateTime(selected.received_at)}</p>
                      </div>

                      <div className="grid gap-2 text-sm">
                        <p><span className="font-semibold">From:</span> {selected.from_name ? `${selected.from_name} <${selected.from_email}>` : (selected.from_email || 'Unknown')}</p>
                        <p><span className="font-semibold">To:</span> {joinAddresses(selected.to_emails)}</p>
                        <p><span className="font-semibold">CC:</span> {joinAddresses(selected.cc_emails)}</p>
                        <p><span className="font-semibold">Provider:</span> {selected.provider || 'resend'}</p>
                        <p><span className="font-semibold">Message ID:</span> {selected.message_id || 'Not provided'}</p>
                      </div>

                      <div className="rounded-md border p-3 bg-muted/30">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Message Body</p>
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{selected.text_body || getMessagePreview(selected)}</pre>
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
