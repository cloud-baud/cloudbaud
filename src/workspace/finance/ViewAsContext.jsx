import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setViewAs as setViewAsStorage, getViewAs, VIEW_AS_KEY } from './api/taxService';

/**
 * Persona roster — the list of identities you can "View As".
 * David's UUID comes from the existing saas.memberships record.
 */
export const VIEW_AS_PERSONAS = [
  { id: '', name: 'Me (Owner)', role: 'Primary Taxpayer', initials: 'ME', color: 'bg-blue-600', email: 'jish.nath@cloudbaud.com' },
  { id: '0c04376e-2bdf-4d6e-9d59-f21feac9b8a4', name: 'Jishnu Nath', role: 'Primary Taxpayer', initials: 'JN', color: 'bg-purple-600', email: 'jishnu@cloudbaud.com' },
  { id: 'c3f1b2a4-5678-4321-9abc-def012345678', name: 'Deepika Nath', role: 'Spouse / Co-Filer', initials: 'DN', color: 'bg-pink-600', email: 'deepika.nath@gmail.com' },
  { id: 'b7d03f67-d8df-47cb-8b69-70863c5009fb', name: 'David Ramsey', role: 'CPA (External Preparer)', initials: 'DR', color: 'bg-emerald-600', email: 'david.ramsey.cpa@gmail.com' },
];

const ViewAsContext = createContext(null);

export function ViewAsProvider({ children }) {
  const [viewAsId, setViewAsId] = useState(() => getViewAs() || '');

  const activePersona = VIEW_AS_PERSONAS.find(p => p.id === viewAsId) || VIEW_AS_PERSONAS[0];
  const isViewingAs = !!viewAsId;

  const setViewAs = useCallback((userId) => {
    const id = userId || '';
    setViewAsId(id);
    setViewAsStorage(id);

    // Broadcast to any embedded iframe on the page
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      try {
        iframe.contentWindow?.postMessage(
          { type: 'VIEW_AS_CHANGE', userId: id },
          '*'
        );
      } catch (err) {
        console.warn('Failed to postMessage to iframe', err);
      }
    });
  }, []);

  const clearViewAs = useCallback(() => {
    setViewAs('');
  }, [setViewAs]);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === VIEW_AS_KEY) {
        setViewAsId(e.newValue || '');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <ViewAsContext.Provider value={{ viewAsId, activePersona, isViewingAs, setViewAs, clearViewAs, personas: VIEW_AS_PERSONAS }}>
      {children}
    </ViewAsContext.Provider>
  );
}

export function useViewAs() {
  const ctx = useContext(ViewAsContext);
  if (!ctx) {
    // Graceful fallback if rendered outside provider
    return {
      viewAsId: getViewAs() || '',
      activePersona: VIEW_AS_PERSONAS[0],
      isViewingAs: false,
      setViewAs: () => {},
      clearViewAs: () => {},
      personas: VIEW_AS_PERSONAS,
    };
  }
  return ctx;
}

export default ViewAsContext;
