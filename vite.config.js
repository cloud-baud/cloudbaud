import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
try { execSync('npx --yes kill-port 17117', { stdio: 'ignore' }); } catch {}
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url))
);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    '__APP_VERSION__': JSON.stringify(packageJson.version),
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: [
      // IMPORTANT: Synolic.Core internal @ alias must come BEFORE generic @
      { find: '@/shared', replacement: path.resolve(__dirname, '../synolic.core/shared') },
      { find: '@/shared/ui', replacement: path.resolve(__dirname, '../synolic.core/shared/components/ui') },
      { find: '@/components/ui', replacement: path.resolve(__dirname, '../synolic.core/shared/components/ui') },
      { find: '@/components/common', replacement: path.resolve(__dirname, '../synolic.core/shared/components/common') },
      { find: '@/components/auth', replacement: path.resolve(__dirname, '../synolic.core/shared/components/auth') },
      { find: '@/components', replacement: path.resolve(__dirname, '../synolic.core/shared/components') },
      { find: '@/lib', replacement: path.resolve(__dirname, '../synolic.core/shared/lib') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: 'synolic.core', replacement: path.resolve(__dirname, '../synolic.core/index.ts') },
      { find: 'react', replacement: path.resolve(__dirname, './node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(__dirname, './node_modules/react-dom') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 17117,
    strictPort: true,
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        path.resolve(__dirname, '../Synolic.Core'),
      ],
    },
  },
})