import { createClient } from '@supabase/supabase-js';

const jsonHeaders = {
  'Content-Type': 'application/json'
};

const getFirst = (value) => {
  if (Array.isArray(value)) {
    return value[0] || null;
  }
  return value || null;
};

const toEmailString = (entry) => {
  if (!entry) return null;
  if (typeof entry === 'string') return entry.trim();
  if (typeof entry === 'object') {
    return entry.email || entry.address || entry.value || null;
  }
  return null;
};

const toNameString = (entry) => {
  if (!entry || typeof entry !== 'object') return null;
  return entry.name || entry.display_name || null;
};

const toEmailArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((entry) => toEmailString(entry))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  const one = toEmailString(value);
  return one ? [one] : [];
};

const parsePayload = (event) => {
  if (!event.body) return {};

  if (event.isBase64Encoded) {
    const decoded = Buffer.from(event.body, 'base64').toString('utf8');
    return JSON.parse(decoded);
  }

  return JSON.parse(event.body);
};

const deriveThreadKey = ({ messageId, inReplyTo, subject }) => {
  if (inReplyTo) return inReplyTo;
  if (messageId) return messageId;
  if (subject) return `subject:${subject.toLowerCase().trim()}`;
  return null;
};

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const expectedToken = process.env.RESEND_WEBHOOK_TOKEN;
    const providedToken = event.headers?.['x-webhook-token'] || event.queryStringParameters?.token;

    if (expectedToken && providedToken !== expectedToken) {
      return {
        statusCode: 401,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Unauthorized webhook request' })
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        statusCode: 500,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Missing Supabase environment variables' })
      };
    }

    const payload = parsePayload(event);
    const data = payload?.data || payload || {};

    const fromRaw = getFirst(data.from) || data.from;
    const fromEmail = toEmailString(fromRaw);
    const fromName = toNameString(fromRaw);

    const toEmails = toEmailArray(data.to);
    const ccEmails = toEmailArray(data.cc);
    const bccEmails = toEmailArray(data.bcc);

    const messageId = data.message_id || data.id || payload.message_id || null;
    const inReplyTo = data.in_reply_to || data.reply_to || null;
    const subject = data.subject || '(No subject)';
    const textBody = data.text || data.text_body || data.plain || null;
    const htmlBody = data.html || data.html_body || null;
    const eventType = payload.type || payload.event || 'email.received';
    const receivedAt = data.received_at || payload.created_at || new Date().toISOString();

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: insertResult, error } = await supabase
      .from('communications_inbox')
      .insert({
        provider: 'resend',
        direction: 'inbound',
        event_type: eventType,
        message_id: messageId,
        thread_key: deriveThreadKey({ messageId, inReplyTo, subject }),
        from_email: fromEmail,
        from_name: fromName,
        to_emails: toEmails,
        cc_emails: ccEmails,
        bcc_emails: bccEmails,
        subject,
        text_body: textBody,
        html_body: htmlBody,
        raw_payload: payload,
        received_at: receivedAt
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to persist inbound email:', error);
      return {
        statusCode: 500,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'Failed to store inbound email' })
      };
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: true, id: insertResult.id })
    };
  } catch (error) {
    console.error('Inbound webhook handler error:', error);
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Invalid webhook payload' })
    };
  }
}
