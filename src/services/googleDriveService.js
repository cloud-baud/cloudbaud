/**
 * googleDriveService.js
 * Google Drive integration via Google Identity Services (GIS) + Drive REST API v3.
 * No npm packages required — the Google script is loaded dynamically.
 *
 * Account:  jish.nath@cloudbaud.com
 * CPA:      David Rumsey <davidr8415@gmail.com>
 */

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const ROOT_FOLDER_NAME = 'CloudBaud';
const SCOPES = [
    'https://www.googleapis.com/auth/drive',
].join(' ');

class GoogleDriveService {
    constructor() {
        this._tokenClient = null;
        this._accessToken = null;
        this._tokenExpiry = null;
        this._listeners = []; // status-change listeners
        this._scriptsLoaded = false;
    }

    // ─────────────────────────────────────────────
    // Script Loading
    // ─────────────────────────────────────────────

    async loadScripts() {
        if (this._scriptsLoaded) return;

        await Promise.all([
            this._loadScript('https://accounts.google.com/gsi/client'),
            this._loadScript('https://apis.google.com/js/api.js'),
        ]);

        this._scriptsLoaded = true;
    }

    _loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // ─────────────────────────────────────────────
    // Auth
    // ─────────────────────────────────────────────

    async init() {
        await this.loadScripts();

        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new Error('VITE_GOOGLE_CLIENT_ID is not set in environment variables.');
        }

        return new Promise((resolve) => {
            this._tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: SCOPES,
                hint: 'jish.nath@cloudbaud.com',
                callback: (tokenResponse) => {
                    if (tokenResponse.error) {
                        console.error('[GoogleDrive] Token error:', tokenResponse);
                        this._accessToken = null;
                        this._notifyListeners('disconnected');
                        return;
                    }
                    this._accessToken = tokenResponse.access_token;
                    // GIS tokens expire in 3600s by default
                    this._tokenExpiry = Date.now() + (tokenResponse.expires_in ?? 3600) * 1000;
                    localStorage.setItem('google_drive_connected', 'true');
                    localStorage.setItem('google_drive_email', 'jish.nath@cloudbaud.com');
                    this._notifyListeners('connected');
                },
            });
            resolve();
        });
    }

    /** Triggers the Google OAuth popup */
    signIn() {
        if (!this._tokenClient) {
            throw new Error('GoogleDriveService not initialised. Call init() first.');
        }
        this._tokenClient.requestAccessToken({ prompt: '' });
    }

    /** Clears the token and revokes access */
    async signOut() {
        if (this._accessToken) {
            window.google?.accounts.oauth2.revoke(this._accessToken, () => {});
        }
        this._accessToken = null;
        this._tokenExpiry = null;
        localStorage.removeItem('google_drive_connected');
        localStorage.removeItem('google_drive_email');
        this._notifyListeners('disconnected');
    }

    isSignedIn() {
        return !!this._accessToken && Date.now() < (this._tokenExpiry ?? 0);
    }

    /** Subscribe to auth status changes: 'connected' | 'disconnected' */
    onStatusChange(fn) {
        this._listeners.push(fn);
        return () => { this._listeners = this._listeners.filter(l => l !== fn); };
    }

    _notifyListeners(status) {
        this._listeners.forEach(fn => fn(status));
    }

    // ─────────────────────────────────────────────
    // Authorised Fetch Helper
    // ─────────────────────────────────────────────

    async _fetch(url, options = {}) {
        if (!this._accessToken) throw new Error('Not authenticated with Google Drive.');
        const res = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${this._accessToken}`,
                'Content-Type': 'application/json',
                ...(options.headers ?? {}),
            },
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
            throw new Error(err.error?.message ?? `Drive API error ${res.status}`);
        }
        return res.json();
    }

    // ─────────────────────────────────────────────
    // Root Folder Management
    // ─────────────────────────────────────────────

    /** Returns the ID of the CloudBaud root folder, creating it if missing */
    async getRootFolderId() {
        const q = `name='${ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false`;
        const data = await this._fetch(`${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)`);

        if (data.files?.length > 0) {
            return data.files[0].id;
        }

        // Create it
        const created = await this._fetch(`${DRIVE_API}/files`, {
            method: 'POST',
            body: JSON.stringify({
                name: ROOT_FOLDER_NAME,
                mimeType: 'application/vnd.google-apps.folder',
            }),
        });
        return created.id;
    }

    // ─────────────────────────────────────────────
    // Year Folder Operations
    // ─────────────────────────────────────────────

    /** Lists all year folders (YYYY) inside the CloudBaud root */
    async listYearFolders() {
        const rootId = await this.getRootFolderId();
        const q = `'${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const data = await this._fetch(
            `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name,createdTime,modifiedTime)&orderBy=name`
        );

        const yearRegex = /^\d{4}$/;
        return (data.files ?? []).filter(f => yearRegex.test(f.name));
    }

    /** Creates a year folder inside CloudBaud root if it doesn't exist. Returns folder object. */
    async createYearFolder(year) {
        const rootId = await this.getRootFolderId();
        const q = `name='${year}' and '${rootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const existing = await this._fetch(`${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)`);

        if (existing.files?.length > 0) return existing.files[0];

        return await this._fetch(`${DRIVE_API}/files`, {
            method: 'POST',
            body: JSON.stringify({
                name: String(year),
                mimeType: 'application/vnd.google-apps.folder',
                parents: [rootId],
            }),
        });
    }

    /**
     * Ensures year folders exist for a range of years.
     * @param {number} fromYear
     * @param {number} toYear
     */
    async ensureYearFolders(fromYear, toYear) {
        const results = [];
        for (let y = fromYear; y <= toYear; y++) {
            const folder = await this.createYearFolder(y);
            results.push(folder);
        }
        return results;
    }

    // ─────────────────────────────────────────────
    // File Operations
    // ─────────────────────────────────────────────

    /** Lists files inside a specific folder */
    async listFolderContents(folderId) {
        const q = `'${folderId}' in parents and trashed=false`;
        const fields = 'files(id,name,mimeType,size,modifiedTime,createdTime,webViewLink,iconLink,thumbnailLink)';
        const data = await this._fetch(
            `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=name`
        );
        return data.files ?? [];
    }

    /**
     * Uploads a file to a specific folder using multipart upload.
     * @param {string} folderId  - Target folder ID
     * @param {File} file        - Browser File object
     * @param {function} onProgress - optional (not supported in basic fetch, kept for API compat)
     */
    async uploadFile(folderId, file) {
        const metadata = {
            name: file.name,
            parents: [folderId],
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        const res = await fetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this._accessToken}`,
            },
            body: form,
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
            throw new Error(err.error?.message ?? `Upload failed: ${res.status}`);
        }
        return res.json();
    }

    // ─────────────────────────────────────────────
    // Sharing
    // ─────────────────────────────────────────────

    /**
     * Shares a file/folder with a specific email.
     * @param {string} fileId
     * @param {string} email   - e.g. 'davidr8415@gmail.com'
     * @param {'reader'|'writer'|'commenter'} role
     */
    async shareWithEmail(fileId, email, role = 'reader') {
        await this._fetch(`${DRIVE_API}/files/${fileId}/permissions`, {
            method: 'POST',
            body: JSON.stringify({
                type: 'user',
                role,
                emailAddress: email,
            }),
        });
    }

    /**
     * Shares a year folder with the configured CPA (David Rumsey).
     * Email read from VITE_CPA_EMAIL_GOOGLE env var.
     */
    async shareYearFolderWithCpa(folderId, role = 'reader') {
        const email = import.meta.env.VITE_CPA_EMAIL_GOOGLE;
        if (!email) throw new Error('VITE_CPA_EMAIL_GOOGLE is not set.');
        return this.shareWithEmail(folderId, email, role);
    }

    /** Lists existing permissions on a file/folder */
    async listPermissions(fileId) {
        const data = await this._fetch(
            `${DRIVE_API}/files/${fileId}/permissions?fields=permissions(id,emailAddress,role,type,displayName)`
        );
        return data.permissions ?? [];
    }

    /** Removes a permission by ID */
    async removePermission(fileId, permissionId) {
        const res = await fetch(`${DRIVE_API}/files/${fileId}/permissions/${permissionId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${this._accessToken}` },
        });
        if (!res.ok && res.status !== 204) {
            throw new Error(`Failed to remove permission: ${res.status}`);
        }
    }

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────

    /** Returns a human-readable file type label from MIME type */
    static mimeLabel(mimeType) {
        const map = {
            'application/vnd.google-apps.folder': 'Folder',
            'application/vnd.google-apps.document': 'Google Doc',
            'application/vnd.google-apps.spreadsheet': 'Google Sheet',
            'application/vnd.google-apps.presentation': 'Google Slides',
            'application/pdf': 'PDF',
            'image/png': 'PNG Image',
            'image/jpeg': 'JPEG Image',
            'application/zip': 'ZIP Archive',
            'text/plain': 'Text File',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
        };
        return map[mimeType] ?? mimeType.split('/').pop().toUpperCase();
    }

    /** Returns a colour class for a MIME type (for Tailwind) */
    static mimeColor(mimeType) {
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'text-emerald-500';
        if (mimeType.includes('document') || mimeType.includes('word')) return 'text-blue-500';
        if (mimeType.includes('presentation')) return 'text-amber-500';
        if (mimeType.includes('pdf')) return 'text-red-500';
        if (mimeType.includes('image')) return 'text-purple-500';
        if (mimeType.includes('folder')) return 'text-yellow-400';
        return 'text-slate-400';
    }

    /** Formats bytes to human-readable string */
    static formatSize(bytes) {
        if (!bytes) return '—';
        const b = parseInt(bytes, 10);
        if (b < 1024) return `${b} B`;
        if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
        return `${(b / (1024 * 1024)).toFixed(1)} MB`;
    }
}

export const googleDriveService = new GoogleDriveService();
