import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

/**
 * Local/dev/test: load `.env.test` if present, else `.env`.
 * On Netlify (`NETLIFY=true`), skip files — use dashboard-injected env only.
 */
export function loadRootEnv(options = {}) {
  const { quiet = false } = options;
  if (process.env.NETLIFY === 'true') {
    if (!quiet) console.log('[env] NETLIFY=true — using process env only (no .env.test / .env files).');
    return { path: null, source: 'netlify' };
  }
  const envTest = path.join(root, '.env.test');
  const envLegacy = path.join(root, '.env');
  if (fs.existsSync(envTest)) {
    dotenv.config({ path: envTest });
    if (!quiet) console.log(`[env] Loaded ${envTest}`);
    return { path: envTest, source: 'test' };
  }
  if (fs.existsSync(envLegacy)) {
    dotenv.config({ path: envLegacy });
    if (!quiet) console.warn(`[env] Loaded ${envLegacy} — add .env.test for local/dev/test (see .env.example).`);
    return { path: envLegacy, source: 'legacy' };
  }
  if (!quiet) console.warn('[env] No .env.test or .env at repo root.');
  return { path: null, source: 'none' };
}

export const repoRoot = root;
