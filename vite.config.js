import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs, { readFileSync } from 'fs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

try { execSync('npx --yes kill-port 17117', { stdio: 'ignore' }); } catch {}
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url))
);

function synolicResolverPlugin() {
  return {
    name: 'synolic-resolver',
    resolveId(source, importer) {
      const normSource = source.replace(/\\/g, '/');

      // Handle @common/
      if (normSource.startsWith('@common/')) {
        const sub = normSource.replace('@common/', '');
        const target = path.resolve(__dirname, '../Synolic.Core/frontend/components', sub);
        for (const ext of ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js']) {
          if (fs.existsSync(target + ext)) {
            return target + ext;
          }
        }
      }
      // Handle @synolic.core/
      if (normSource.startsWith('@synolic.core/')) {
        const sub = normSource.replace('@synolic.core/', '');
        const target = path.resolve(__dirname, '../Synolic.Core/frontend/components/features', sub);
        for (const ext of ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js']) {
          if (fs.existsSync(target + ext)) {
            return target + ext;
          }
        }
      }
      // Handle @/components/ui/* or expanded /src/components/ui/*
      if (normSource.startsWith('@/components/ui/') || normSource.includes('/src/components/ui/')) {
        const componentName = normSource.includes('/src/components/ui/')
          ? normSource.split('/src/components/ui/')[1]
          : normSource.replace('@/components/ui/', '');

        const corePath = path.resolve(__dirname, '../Synolic.Core/shared/components', componentName);
        for (const ext of ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts']) {
          if (fs.existsSync(corePath + ext)) {
            return corePath + ext;
          }
        }
        const localPath = path.resolve(__dirname, './src/shared/ui', componentName);
        for (const ext of ['', '.jsx', '.js', '.tsx', '.ts']) {
          if (fs.existsSync(localPath + ext)) {
            return localPath + ext;
          }
        }
      }
      // Handle shared components (raw @/shared/components/ or expanded /src/shared/components/)
      if (normSource.startsWith('@/shared/components/') || normSource.includes('/src/shared/components/')) {
        const componentName = normSource.includes('/src/shared/components/')
          ? normSource.split('/src/shared/components/')[1]
          : normSource.replace('@/shared/components/', '');

        // 1. Check Synolic.Core shared components first
        const corePath = path.resolve(__dirname, '../Synolic.Core/shared/components', componentName);
        for (const ext of ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts']) {
          if (fs.existsSync(corePath + ext)) {
            return corePath + ext;
          }
        }
        // 2. Check local cloudbaud src/shared/ui
        const localPath = path.resolve(__dirname, './src/shared/ui', componentName);
        for (const ext of ['', '.jsx', '.js', '.tsx', '.ts']) {
          if (fs.existsSync(localPath + ext)) {
            return localPath + ext;
          }
        }
      }
      return null;
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), synolicResolverPlugin()],
  define: {
    '__APP_VERSION__': JSON.stringify(packageJson.version),
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: [
      { find: '@common', replacement: path.resolve(__dirname, '../Synolic.Core/frontend/components') },
      { find: '@synolic.core', replacement: path.resolve(__dirname, '../Synolic.Core/frontend/components/features') },
      { find: 'synolic.core', replacement: path.resolve(__dirname, '../Synolic.Core/index.ts') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
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