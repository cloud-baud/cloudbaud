import { supabase } from '@/shared/lib/supabase';

const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const getMessagePreview = (message) => {
  if (!message) return '';
  if (message.text_body?.trim()) return message.text_body.trim();
  if (message.html_body?.trim()) return stripHtml(message.html_body);
  return 'No body content';
};

export const fetchInboundEmails = async () => {
  const { data, error } = await supabase
    .from('communications_inbox')
    .select('id, provider, direction, event_type, message_id, thread_key, from_email, from_name, to_emails, cc_emails, bcc_emails, subject, text_body, html_body, received_at, created_at')
    .eq('direction', 'inbound')
    .order('received_at', { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return data || [];
};
