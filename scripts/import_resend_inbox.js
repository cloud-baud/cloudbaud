import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';
import { loadRootEnv, repoRoot } from './loadRootEnv.js';

loadRootEnv({ quiet: true });

const command = process.argv[2];
const messageIdArg = process.argv[3];
const attachmentIdArg = process.argv[4];
const commandArgs = process.argv.slice(3);
const domain = (process.env.RESEND_TARGET_DOMAIN || 'cloudbaud.com').toLowerCase();
const outputDir = process.env.RESEND_INBOX_OUTPUT_DIR || path.join(repoRoot, 'data', 'emails', domain);
const defaultReplyFrom = process.env.RESEND_REPLY_FROM || `info@${domain}`;

function usage() {
  console.log('Usage:');
  console.log('  npm run resend:list');
  console.log('  npm run resend:get -- <message_id>');
  console.log('  npm run resend:sync');
  console.log('  npm run resend:attachments:list -- <message_id>');
  console.log('  npm run resend:attachments:get -- <message_id> <attachment_id>');
  console.log('  npm run resend:reply -- <message_id> [reply_text]');
  console.log('  npm run resend:reply-all -- <message_id> [reply_text]');
  console.log('  npm run resend:forward -- <message_id> <to_email>');
  console.log('');
  console.log('Required env vars:');
  console.log('  RESEND_API_KEY=<re_...>');
  console.log('Optional env vars:');
  console.log('  RESEND_TARGET_DOMAIN=cloudbaud.com');
  console.log('  RESEND_INBOX_OUTPUT_DIR=<absolute_or_relative_path>');
  console.log('  RESEND_REPLY_FROM=info@cloudbaud.com');
}

function ensureApiKey() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set. Add it to .env.test and rerun.');
  }
  return apiKey;
}

function ensureOutputDir() {
  fs.mkdirSync(outputDir, { recursive: true });
}

function getRecipientValues(message) {
  const values = [];
  const possible = [message?.to, message?.cc, message?.bcc, message?.reply_to, message?.delivered_to, message?.recipient];

  for (const field of possible) {
    if (!field) continue;
    if (Array.isArray(field)) {
      values.push(...field);
    } else {
      values.push(field);
    }
  }

  return values
    .map((value) => {
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object' && 'email' in value && typeof value.email === 'string') {
        return value.email;
      }
      return '';
    })
    .filter(Boolean)
    .map((v) => v.toLowerCase());
}

function isTargetDomainMessage(message, targetDomain) {
  const recipients = getRecipientValues(message);
  return recipients.some((email) => email.endsWith(`@${targetDomain}`));
}

function toMessageArray(listData) {
  if (Array.isArray(listData)) return listData;
  if (Array.isArray(listData?.data)) return listData.data;
  if (Array.isArray(listData?.items)) return listData.items;
  return [];
}

function writeJson(fileName, payload) {
  ensureOutputDir();
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return filePath;
}

function sanitizeFileSegment(input) {
  return String(input || '')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'unknown';
}

function parseEmailAddress(value) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  const bracketMatch = trimmed.match(/<([^>]+)>/);
  return (bracketMatch ? bracketMatch[1] : trimmed).trim().toLowerCase();
}

function normalizeEmails(input) {
  if (!input) return [];
  const raw = Array.isArray(input) ? input : [input];
  return raw
    .flatMap((item) => {
      if (!item) return [];
      if (typeof item === 'string') return [item];
      if (typeof item === 'object' && typeof item.email === 'string') return [item.email];
      return [];
    })
    .map(parseEmailAddress)
    .filter(Boolean);
}

function dedupeEmails(emails) {
  const seen = new Set();
  const result = [];
  for (const email of emails) {
    const normalized = parseEmailAddress(email);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function buildReplySubject(subject) {
  const safeSubject = String(subject || '').trim();
  if (!safeSubject) return 'Re: (no subject)';
  if (/^re:/i.test(safeSubject)) return safeSubject;
  return `Re: ${safeSubject}`;
}

function buildForwardSubject(subject) {
  const safeSubject = String(subject || '').trim();
  if (!safeSubject) return 'Fwd: (no subject)';
  if (/^fwd:|^fw:/i.test(safeSubject)) return safeSubject;
  return `Fwd: ${safeSubject}`;
}

function buildReplyText(message, overrideText) {
  const input = String(overrideText || '').trim();
  if (input) return input;
  const from = message?.from || 'sender';
  const subject = message?.subject || '(no subject)';
  return `Thanks for your email regarding "${subject}".\n\nBest,\nCloudBaud\n\n---\nOriginal from: ${from}`;
}

async function fetchInboundMessage(resend, messageId) {
  const { data, error } = await resend.emails.receiving.get(messageId);
  if (error) {
    throw new Error(`Unable to load inbound email ${messageId}: ${error.message || JSON.stringify(error)}`);
  }
  return data;
}

function toAttachmentArray(listData) {
  if (Array.isArray(listData)) return listData;
  if (Array.isArray(listData?.data)) return listData.data;
  if (Array.isArray(listData?.items)) return listData.items;
  return [];
}

async function listAttachments(resend, messageId) {
  if (!messageId) {
    throw new Error('Message ID is required. Example: npm run resend:attachments:list -- <message_id>');
  }

  const { data, error } = await resend.emails.receiving.attachments.list({ emailId: messageId });
  if (error) {
    throw new Error(`Resend attachments list failed for ${messageId}: ${error.message || JSON.stringify(error)}`);
  }

  const attachments = toAttachmentArray(data);
  const safeMessageId = sanitizeFileSegment(messageId);
  const filePath = writeJson(`${safeMessageId}.attachments-list.json`, {
    fetchedAt: new Date().toISOString(),
    targetDomain: domain,
    emailId: messageId,
    count: attachments.length,
    attachments,
  });

  console.log(`Saved ${attachments.length} attachments to ${filePath}`);
  return attachments;
}

async function getAttachment(resend, messageId, attachmentId) {
  if (!messageId || !attachmentId) {
    throw new Error('Message ID and Attachment ID are required. Example: npm run resend:attachments:get -- <message_id> <attachment_id>');
  }

  const { data, error } = await resend.emails.receiving.attachments.get({
    emailId: messageId,
    id: attachmentId,
  });

  if (error) {
    throw new Error(`Resend attachment get failed for ${attachmentId}: ${error.message || JSON.stringify(error)}`);
  }

  const safeMessageId = sanitizeFileSegment(messageId);
  const safeAttachmentId = sanitizeFileSegment(attachmentId);
  const filePath = writeJson(`${safeMessageId}.attachment.${safeAttachmentId}.json`, {
    fetchedAt: new Date().toISOString(),
    targetDomain: domain,
    emailId: messageId,
    attachmentId,
    attachment: data,
  });

  console.log(`Saved attachment ${attachmentId} to ${filePath}`);
}

async function listMessages(resend) {
  const { data, error } = await resend.emails.receiving.list();
  if (error) {
    throw new Error(`Resend list failed: ${error.message || JSON.stringify(error)}`);
  }

  const allMessages = toMessageArray(data);
  const filtered = allMessages.filter((msg) => isTargetDomainMessage(msg, domain));

  const output = {
    fetchedAt: new Date().toISOString(),
    targetDomain: domain,
    total: allMessages.length,
    matched: filtered.length,
    messages: filtered,
  };

  const filePath = writeJson('inbox-list.json', output);
  console.log(`Saved ${filtered.length} messages to ${filePath}`);
  return filtered;
}

async function getMessage(resend, messageId) {
  if (!messageId) {
    throw new Error('Message ID is required. Example: npm run resend:get -- <message_id>');
  }

  const { data, error } = await resend.emails.receiving.get(messageId);
  if (error) {
    throw new Error(`Resend get failed for ${messageId}: ${error.message || JSON.stringify(error)}`);
  }

  const filePath = writeJson(`${messageId}.json`, {
    fetchedAt: new Date().toISOString(),
    targetDomain: domain,
    message: data,
  });

  console.log(`Saved message ${messageId} to ${filePath}`);
}

async function syncMessages(resend) {
  const messages = await listMessages(resend);

  let saved = 0;
  for (const message of messages) {
    const id = message?.id;
    if (!id) continue;
    try {
      await getMessage(resend, id);
      saved += 1;
    } catch (err) {
      console.error(`Skipping ${id}: ${err.message}`);
    }
  }

  console.log(`Sync complete. Saved ${saved} full message records to ${outputDir}`);
}

async function replyToMessage(resend, messageId, replyText, includeAllRecipients = false) {
  if (!messageId) {
    throw new Error('Message ID is required. Example: npm run resend:reply -- <message_id> "Thanks!"');
  }

  const inbound = await fetchInboundMessage(resend, messageId);
  const fromAddress = parseEmailAddress(defaultReplyFrom);
  const targetSender = parseEmailAddress(inbound?.from);

  if (!targetSender) {
    throw new Error(`Inbound email ${messageId} has no valid sender to reply to.`);
  }

  const headers = {};
  if (inbound?.message_id) {
    headers['In-Reply-To'] = inbound.message_id;
    headers['References'] = inbound.message_id;
  }

  let cc = undefined;
  if (includeAllRecipients) {
    const inboundTo = normalizeEmails(inbound?.to);
    const inboundCc = normalizeEmails(inbound?.cc);
    const combined = dedupeEmails([...inboundTo, ...inboundCc]);
    const excluded = new Set([targetSender, fromAddress]);
    const filteredCc = combined.filter((email) => !excluded.has(email));
    if (filteredCc.length > 0) {
      cc = filteredCc;
    }
  }

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: targetSender,
    cc,
    subject: buildReplySubject(inbound?.subject),
    text: buildReplyText(inbound, replyText),
    headers,
  });

  if (error) {
    throw new Error(`Reply send failed for ${messageId}: ${error.message || JSON.stringify(error)}`);
  }

  const responseFile = writeJson(`${sanitizeFileSegment(messageId)}.${includeAllRecipients ? 'reply-all' : 'reply'}.result.json`, {
    createdAt: new Date().toISOString(),
    command: includeAllRecipients ? 'reply-all' : 'reply',
    inboundEmailId: messageId,
    outboundEmailId: data?.id || null,
    to: targetSender,
    cc: cc || [],
    from: fromAddress,
  });

  console.log(`Sent ${includeAllRecipients ? 'reply-all' : 'reply'} for ${messageId}. Result saved to ${responseFile}`);
}

async function forwardMessage(resend, messageId, toEmail) {
  if (!messageId || !toEmail) {
    throw new Error('Message ID and destination email are required. Example: npm run resend:forward -- <message_id> user@example.com');
  }

  const outboundTo = parseEmailAddress(toEmail);
  if (!outboundTo) {
    throw new Error('A valid destination email is required for forward.');
  }

  const fromAddress = parseEmailAddress(defaultReplyFrom);
  const inbound = await fetchInboundMessage(resend, messageId);
  const { data, error } = await resend.emails.receiving.forward({
    emailId: messageId,
    from: fromAddress,
    to: outboundTo,
    passthrough: true,
  });

  if (error) {
    throw new Error(`Forward failed for ${messageId}: ${error.message || JSON.stringify(error)}`);
  }

  const responseFile = writeJson(`${sanitizeFileSegment(messageId)}.forward.result.json`, {
    createdAt: new Date().toISOString(),
    command: 'forward',
    inboundEmailId: messageId,
    outboundEmailId: data?.id || null,
    to: outboundTo,
    from: fromAddress,
    subject: buildForwardSubject(inbound?.subject),
  });

  console.log(`Forwarded ${messageId} to ${outboundTo}. Result saved to ${responseFile}`);
}

async function main() {
  if (!command || command === '--help' || command === '-h') {
    usage();
    return;
  }

  const resend = new Resend(ensureApiKey());

  if (command === 'list') {
    await listMessages(resend);
    return;
  }

  if (command === 'get') {
    await getMessage(resend, messageIdArg);
    return;
  }

  if (command === 'sync') {
    await syncMessages(resend);
    return;
  }

  if (command === 'attachments:list') {
    await listAttachments(resend, messageIdArg);
    return;
  }

  if (command === 'attachments:get') {
    await getAttachment(resend, messageIdArg, attachmentIdArg);
    return;
  }

  if (command === 'reply') {
    await replyToMessage(resend, commandArgs[0], commandArgs.slice(1).join(' '), false);
    return;
  }

  if (command === 'reply-all') {
    await replyToMessage(resend, commandArgs[0], commandArgs.slice(1).join(' '), true);
    return;
  }

  if (command === 'forward') {
    await forwardMessage(resend, commandArgs[0], commandArgs[1]);
    return;
  }

  usage();
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
