/**
 * Google Drive API v3 Comments & Discussion Synchronization Service
 * 
 * Provides live 2-way communication between CloudBaud Tax Review Drawer
 * and Google Sheets native cell-anchored comments.
 */

const GOOGLE_DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3/files';

/**
 * Extracts Google Spreadsheet File ID from URL or raw ID string
 * @param {string} urlOrId
 * @returns {string} fileId
 */
export function extractSpreadsheetFileId(urlOrId) {
  if (!urlOrId) return '1QubZfLE5OC8RuhhljIBvj7dUeWN3UwefYxrtH0HSiGY';
  const clean = urlOrId.trim();
  const match = clean.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  if (!clean.includes('/')) return clean;
  return '1QubZfLE5OC8RuhhljIBvj7dUeWN3UwefYxrtH0HSiGY';
}

/**
 * Storage helpers for Google Access Token
 */
export function getStoredGoogleToken() {
  try {
    return localStorage.getItem('cloudbaud_google_drive_token') || null;
  } catch {
    return null;
  }
}

export function setStoredGoogleToken(token) {
  try {
    if (token) {
      localStorage.setItem('cloudbaud_google_drive_token', token.trim());
    } else {
      localStorage.removeItem('cloudbaud_google_drive_token');
    }
  } catch {}
}

/**
 * Fetches all live comments from Google Drive for the spreadsheet
 * @param {string} fileId
 * @param {string} accessToken
 * @returns {Promise<Array>} comments
 */
export async function fetchGoogleDriveComments(fileId, accessToken) {
  const fId = extractSpreadsheetFileId(fileId);
  const token = accessToken || getStoredGoogleToken();

  if (!token) {
    throw new Error('Google OAuth Access Token required to sync with Google Drive.');
  }

  const url = `${GOOGLE_DRIVE_API_BASE}/${fId}/comments?fields=comments(id,author,content,htmlContent,createdTime,modifiedTime,resolved,deleted,anchor,replies(id,author,content,createdTime,deleted))&includeDeleted=false&pageSize=100`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Google Drive API error (${response.status})`;
    throw new Error(message);
  }

  const data = await response.json();
  return data.comments || [];
}

/**
 * Creates a new cell-anchored comment in the Google Spreadsheet
 * @param {string} fileId
 * @param {string} content - Comment text (e.g. "@David verified against 1040 Line 1a")
 * @param {string} cellAddress - Target cell (e.g. "Summary!E2" or "Summary!F2")
 * @param {string} accessToken
 * @returns {Promise<Object>} created comment
 */
export async function createGoogleDriveComment(fileId, content, cellAddress, accessToken) {
  const fId = extractSpreadsheetFileId(fileId);
  const token = accessToken || getStoredGoogleToken();

  if (!token) {
    throw new Error('Google OAuth Access Token required to post to Google Drive.');
  }

  const url = `${GOOGLE_DRIVE_API_BASE}/${fId}/comments?fields=id,author,content,createdTime,resolved,anchor,replies`;

  // Parse cell coordinates into Google Drive anchor JSON
  let anchorPayload = undefined;
  if (cellAddress) {
    const parts = cellAddress.split('!');
    const sheetName = parts.length > 1 ? parts[0] : 'Summary';
    const cellCoord = parts.length > 1 ? parts[1] : parts[0];
    anchorPayload = JSON.stringify({
      type: 'cells',
      sheet: sheetName,
      cell: cellCoord
    });
  }

  const body = {
    content: content.trim(),
    ...(anchorPayload ? { anchor: anchorPayload } : {})
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to create Google comment (${response.status})`);
  }

  return await response.json();
}

/**
 * Replies to an existing comment discussion thread in Google Drive
 * @param {string} fileId
 * @param {string} commentId
 * @param {string} content
 * @param {string} accessToken
 * @returns {Promise<Object>} created reply
 */
export async function replyGoogleDriveComment(fileId, commentId, content, accessToken) {
  const fId = extractSpreadsheetFileId(fileId);
  const token = accessToken || getStoredGoogleToken();

  if (!token) {
    throw new Error('Google OAuth Access Token required.');
  }

  const url = `${GOOGLE_DRIVE_API_BASE}/${fId}/comments/${commentId}/replies?fields=id,author,content,createdTime`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ content: content.trim() })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to post reply (${response.status})`);
  }

  return await response.json();
}

/**
 * Marks a comment thread as resolved (or reopened) in Google Drive
 * @param {string} fileId
 * @param {string} commentId
 * @param {boolean} isResolved
 * @param {string} accessToken
 * @returns {Promise<Object>}
 */
export async function setGoogleDriveCommentStatus(fileId, commentId, isResolved = true, accessToken) {
  const fId = extractSpreadsheetFileId(fileId);
  const token = accessToken || getStoredGoogleToken();

  if (!token) {
    throw new Error('Google OAuth Access Token required.');
  }

  const url = `${GOOGLE_DRIVE_API_BASE}/${fId}/comments/${commentId}/replies?fields=id,author,content,createdTime,action`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      action: isResolved ? 'resolve' : 'reopen',
      content: isResolved ? 'Resolved in CloudBaud Tax Workspace' : 'Reopened in CloudBaud Tax Workspace'
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to update comment status (${response.status})`);
  }

  return await response.json();
}

/**
 * Maps a Google Drive comment item into CloudBaud App Thread representation
 * @param {Object} driveComment
 * @param {number} fallbackYear
 * @returns {Object} appThread
 */
export function mapGoogleCommentToAppThread(driveComment, fallbackYear = 2022) {
  let cellRef = 'Summary';
  let sheetName = 'Summary';

  if (driveComment.anchor) {
    try {
      const parsed = JSON.parse(driveComment.anchor);
      if (parsed.cell) cellRef = parsed.cell;
      if (parsed.sheet) sheetName = parsed.sheet;
    } catch {
      cellRef = driveComment.anchor;
    }
  }

  // Derive year from sheet name or default
  let year = fallbackYear;
  if (sheetName.startsWith('OC-') || sheetName.startsWith('CC-') || sheetName.startsWith('CB-')) {
    const yrShort = parseInt(sheetName.replace(/^[A-Z]+-/, ''), 10);
    if (!isNaN(yrShort)) {
      year = yrShort < 50 ? 2000 + yrShort : 1900 + yrShort;
    }
  }

  const author = driveComment.author?.displayName || 'Google User';
  const isCpa = author.toLowerCase().includes('david') || author.toLowerCase().includes('cpa') || author.toLowerCase().includes('rumsey');
  const role = isCpa ? 'CPA (External)' : 'Owner';
  const initials = author.split(' ').map(n => n[0]).join('').toUpperCase() || 'GU';

  const comments = [
    {
      id: driveComment.id,
      authorName: author,
      authorRole: role,
      authorInitials: initials,
      text: driveComment.content || '',
      createdAt: driveComment.createdTime || new Date().toISOString(),
      decision: driveComment.resolved ? 'accepted' : null,
      isGoogleSync: true
    }
  ];

  if (driveComment.replies && Array.isArray(driveComment.replies)) {
    driveComment.replies.forEach(r => {
      if (r.deleted) return;
      const rAuthor = r.author?.displayName || 'Contributor';
      const rIsCpa = rAuthor.toLowerCase().includes('david') || rAuthor.toLowerCase().includes('cpa');
      comments.push({
        id: r.id,
        authorName: rAuthor,
        authorRole: rIsCpa ? 'CPA (External)' : 'Owner',
        authorInitials: rAuthor.split(' ').map(n => n[0]).join('').toUpperCase() || 'C',
        text: r.content || '',
        createdAt: r.createdTime || new Date().toISOString(),
        decision: null,
        isGoogleSync: true
      });
    });
  }

  return {
    id: `th_google_${driveComment.id}`,
    googleCommentId: driveComment.id,
    targetType: 'worksheet_row',
    targetId: sheetName,
    targetTitle: `[${sheetName}!${cellRef}] ${driveComment.content?.slice(0, 40) || 'Comment'}`,
    cellRef: cellRef,
    sheetName: sheetName,
    year: year,
    status: driveComment.resolved ? 'accepted' : (driveComment.content?.includes('@David') ? 'pending' : 'accepted'),
    isGoogleSync: true,
    comments: comments
  };
}
