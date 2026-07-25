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
  plugins: [react(), tailwindcss(), htmlFallbackPlugin, combineDistPlugin],
  define: {
    '__APP_VERSION__': JSON.stringify(packageJson.version),
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: [
      { find: '@/components/ui', replacement: path.resolve(__dirname, '../Synolic.Core/@/components/ui') },
      { find: '@/components', replacement: path.resolve(__dirname, '../Synolic.Core/@/components') },
      { find: '@/lib', replacement: path.resolve(__dirname, '../Synolic.Core/@/lib') },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "@common", replacement: path.resolve(__dirname, "../Synolic.Core/frontend/components") },
      { find: "synolic.core", replacement: path.resolve(__dirname, "../Synolic.Core/index.ts") },
      { find: "@synolic.core", replacement: path.resolve(__dirname, "../Synolic.Core/frontend/components/features") },
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
