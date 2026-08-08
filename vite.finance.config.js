import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs, { readFileSync } from 'fs';

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

const htmlFallbackPlugin = {
  name: 'html-fallback',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (
        req.method === 'GET' &&
        req.headers.accept &&
        req.headers.accept.includes('text/html') &&
        !req.url.includes('.')
      ) {
        req.url = '/finance.html';
      }
      next();
    });
  }
};

const combineDistPlugin = {
  name: 'combine-dist',
  closeBundle() {
    const src = path.resolve(__dirname, 'dist-finance');
    const dest = path.resolve(__dirname, 'dist');
    
    if (fs.existsSync(src) && fs.existsSync(dest)) {
      console.log('\n[Vite Post-Build] Merging dist-finance assets and pages into dist...');
      
      function copyRecursiveSync(s, d) {
        const exists = fs.existsSync(s);
        const stats = exists && fs.statSync(s);
        const isDirectory = exists && stats.isDirectory();
        if (isDirectory) {
          if (!fs.existsSync(d)) {
            fs.mkdirSync(d);
          }
          fs.readdirSync(s).forEach((childItemName) => {
            copyRecursiveSync(path.join(s, childItemName), path.join(d, childItemName));
          });
        } else {
          fs.copyFileSync(s, d);
        }
      }
      
      copyRecursiveSync(src, dest);
      console.log('[Vite Post-Build] Successfully merged both SPAs into dist directory!\n');
    }
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), synolicResolverPlugin(), htmlFallbackPlugin, combineDistPlugin],
  define: {
    '__APP_VERSION__': JSON.stringify(packageJson.version),
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: [
      { find: "@common", replacement: path.resolve(__dirname, "../Synolic.Core/frontend/components") },
      { find: "synolic.core", replacement: path.resolve(__dirname, "../Synolic.Core/index.ts") },
      { find: "@synolic.core", replacement: path.resolve(__dirname, "../Synolic.Core/frontend/components/features") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "react", replacement: path.resolve(__dirname, "./node_modules/react") },
      { find: "react-dom", replacement: path.resolve(__dirname, "./node_modules/react-dom") },
    ],
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist-finance',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'finance.html')
      }
    }
  },
  server: {
    port: 17118,
    strictPort: true,
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        path.resolve(__dirname, '../Synolic.Core'),
      ],
    },
  },
})
