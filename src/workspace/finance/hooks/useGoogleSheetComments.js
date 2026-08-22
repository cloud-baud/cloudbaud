import { useState, useEffect, useCallback } from 'react';
import {
  fetchGoogleDriveComments,
  createGoogleDriveComment,
  replyGoogleDriveComment,
  setGoogleDriveCommentStatus,
  mapGoogleCommentToAppThread,
  getStoredGoogleToken,
  setStoredGoogleToken,
  extractSpreadsheetFileId
} from '../services/googleCommentsSyncService';

/**
 * Custom React Hook for Two-Way Google Drive Comments Sync
 * 
 * @param {string} spreadsheetUrlOrId - Google Sheet URL or ID
 * @param {number} currentYear - Active tax year (2020, 2022, 2023, 2024)
 * @param {Object} threads - Current active local threads map
 * @param {Function} setThreads - State updater for threads
 */
export function useGoogleSheetComments({
  spreadsheetUrlOrId = '1QubZfLE5OC8RuhhljIBvj7dUeWN3UwefYxrtH0HSiGY',
  currentYear = 2022,
  threads = {},
  setThreads
}) {
  const [token, setToken] = useState(() => getStoredGoogleToken());
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error' | 'unauthenticated'
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  const fileId = extractSpreadsheetFileId(spreadsheetUrlOrId);

  // Save new OAuth token
  const updateToken = useCallback((newToken) => {
    setStoredGoogleToken(newToken);
    setToken(newToken ? newToken.trim() : null);
    if (newToken) {
      setErrorMessage(null);
      setSyncStatus('idle');
    }
  }, []);

  // Fetch and sync remote comments from Google Drive into threads
  const syncComments = useCallback(async () => {
    const activeToken = token || getStoredGoogleToken();
    if (!activeToken) {
      setSyncStatus('unauthenticated');
      return;
    }

    try {
      setSyncStatus('syncing');
      setErrorMessage(null);

      const remoteComments = await fetchGoogleDriveComments(fileId, activeToken);

      if (setThreads && Array.isArray(remoteComments)) {
        setThreads(prevThreads => {
          const updated = { ...prevThreads };
          remoteComments.forEach(driveComment => {
            const mappedThread = mapGoogleCommentToAppThread(driveComment, currentYear);
            updated[mappedThread.id] = mappedThread;
          });
          return updated;
        });
      }

      setSyncStatus('synced');
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Google Drive Comments Sync Error:', err.message);
      setSyncStatus('error');
      setErrorMessage(err.message);
    }
  }, [fileId, token, currentYear, setThreads]);

  // Post a new comment from the App directly to Google Sheet
  const postCommentToGoogle = useCallback(async (content, cellAddress) => {
    const activeToken = token || getStoredGoogleToken();
    if (!activeToken) {
      setIsTokenModalOpen(true);
      throw new Error('Please connect your Google Account or enter a Google Drive Access Token first.');
    }

    setSyncStatus('syncing');
    try {
      const created = await createGoogleDriveComment(fileId, content, cellAddress, activeToken);
      const mapped = mapGoogleCommentToAppThread(created, currentYear);

      if (setThreads) {
        setThreads(prev => ({
          ...prev,
          [mapped.id]: mapped
        }));
      }

      setSyncStatus('synced');
      setLastSyncTime(new Date());
      return mapped;
    } catch (err) {
      setSyncStatus('error');
      setErrorMessage(err.message);
      throw err;
    }
  }, [fileId, token, currentYear, setThreads]);

  // Post a reply to an existing Google Sheet discussion
  const replyToGoogleThread = useCallback(async (googleCommentId, replyText) => {
    const activeToken = token || getStoredGoogleToken();
    if (!activeToken) {
      setIsTokenModalOpen(true);
      throw new Error('Google authentication required to post replies.');
    }

    try {
      const replyObj = await replyGoogleDriveComment(fileId, googleCommentId, replyText, activeToken);
      await syncComments();
      return replyObj;
    } catch (err) {
      setErrorMessage(err.message);
      throw err;
    }
  }, [fileId, token, syncComments]);

  // Mark comment thread as resolved in Google Drive
  const resolveGoogleThread = useCallback(async (googleCommentId, isResolved = true) => {
    const activeToken = token || getStoredGoogleToken();
    if (!activeToken) return;

    try {
      await setGoogleDriveCommentStatus(fileId, googleCommentId, isResolved, activeToken);
      await syncComments();
    } catch (err) {
      setErrorMessage(err.message);
    }
  }, [fileId, token, syncComments]);

  // Periodic Auto-Sync (Every 60 seconds if token exists)
  useEffect(() => {
    if (!token) {
      setSyncStatus('unauthenticated');
      return;
    }

    // Initial sync
    syncComments();

    const interval = setInterval(() => {
      syncComments();
    }, 60000);

    return () => clearInterval(interval);
  }, [token, syncComments]);

  return {
    token,
    updateToken,
    syncStatus,
    lastSyncTime,
    errorMessage,
    syncComments,
    postCommentToGoogle,
    replyToGoogleThread,
    resolveGoogleThread,
    isTokenModalOpen,
    setIsTokenModalOpen
  };
}
