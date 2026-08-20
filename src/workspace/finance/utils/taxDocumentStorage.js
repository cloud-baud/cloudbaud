// src/workspace/finance/utils/taxDocumentStorage.js
// Persistent client-side document storage using IndexedDB
// Ensures uploaded files (W2, 1099, 1040, etc.) survive page reloads and browser sessions

const DB_NAME = 'cloudbaud_tax_documents_db';
const DB_VERSION = 1;
const STORE_NAME = 'tax_documents';

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve(null);
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = (err) => {
        console.warn('[TaxDocStorage] IndexedDB open error:', err);
        resolve(null);
      };
    });
  }
  return dbPromise;
}

/**
 * Save an uploaded file blob in IndexedDB
 */
export async function saveTaxDocumentBlob(year, docId, file) {
  try {
    const db = await getDB();
    if (!db) return false;

    const key = `${year}_${docId}`;
    const nameKey = `${year}_${file.name}`;
    const arrayBuffer = await file.arrayBuffer();

    const record = {
      key,
      year: Number(year),
      docId,
      fileName: file.name,
      mimeType: file.type || 'application/pdf',
      data: arrayBuffer,
      size: file.size,
      updatedAt: Date.now()
    };

    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(record);
      // Also store with filename key for fast lookups by name
      store.put({ ...record, key: nameKey });
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => {
        console.warn('[TaxDocStorage] Save error:', e);
        resolve(false);
      };
    });
  } catch (err) {
    console.error('[TaxDocStorage] Failed to save document:', err);
    return false;
  }
}

/**
 * Retrieve an uploaded file Blob from IndexedDB
 */
export async function getTaxDocumentBlob(year, docIdOrName) {
  try {
    const db = await getDB();
    if (!db) return null;

    const key = `${year}_${docIdOrName}`;
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const result = req.result;
        if (result && result.data) {
          const blob = new Blob([result.data], { type: result.mimeType || 'application/pdf' });
          resolve(blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('[TaxDocStorage] Get error:', err);
    return null;
  }
}

/**
 * Common known aliases for year documents on disk
 */
const KNOWN_DOC_ALIASES = {
  2022: {
    '2022w2.pdf': ['2022W2.pdf', 'Deepika W2 2022.pdf', '2022 W2.pdf'],
    'deepika w2 2022.pdf': ['Deepika W2 2022.pdf', '2022W2.pdf', '2022 W2.pdf'],
    'doc_2022_w2': ['Deepika W2 2022.pdf', '2022W2.pdf', '2022 W2.pdf'],
    'w2_jishnu_deepika': ['Deepika W2 2022.pdf', '2022W2.pdf']
  },
  2023: {
    'deepika w2 2023.pdf': ['Deepika W2 2023.pdf', '2023 W2.pdf', '2023W2.pdf'],
    'doc_2023_w2': ['Deepika W2 2023.pdf', '2023 W2.pdf'],
    'w2_jishnu_deepika': ['Deepika W2 2023.pdf', '2023 W2.pdf']
  },
  2024: {
    'dolly w2 2024.pdf': ['Dolly W2 2024.pdf', '2024 W2.pdf', '2024W2.pdf'],
    'doc_2024_w2': ['Dolly W2 2024.pdf', '2024 W2.pdf'],
    'w2_jishnu_deepika': ['Dolly W2 2024.pdf', '2024 W2.pdf']
  }
};

/**
 * Resolve a valid working URL for a document.
 * Tries IndexedDB first, then primary workspace disk paths, then alias candidate paths.
 */
export async function resolveDocumentUrl(year, doc) {
  if (!doc) return null;

  // 1. Check IndexedDB by doc ID
  if (doc.id) {
    const blob = await getTaxDocumentBlob(year, doc.id);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  }

  // 2. Check IndexedDB by doc name
  if (doc.name) {
    const blob = await getTaxDocumentBlob(year, doc.name);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  }

  // 3. Check direct disk URL
  if (doc.name) {
    const primaryUrl = `/src/workspace/data/Documents - Taxes/${year}/${doc.name}`;
    try {
      const res = await fetch(primaryUrl, { method: 'HEAD' });
      if (res.ok) return encodeURI(primaryUrl);
    } catch {}

    // Check alias candidate files
    const lookupKey = doc.name.toLowerCase();
    const yearAliases = KNOWN_DOC_ALIASES[year] || {};
    const candidates = yearAliases[lookupKey] || yearAliases[doc.id] || [];

    for (const altName of candidates) {
      if (altName === doc.name) continue;
      const altUrl = `/src/workspace/data/Documents - Taxes/${year}/${altName}`;
      try {
        const res = await fetch(altUrl, { method: 'HEAD' });
        if (res.ok) return encodeURI(altUrl);
      } catch {}
    }

    // Default encoded URI fallback
    return encodeURI(primaryUrl);
  }

  return null;
}
