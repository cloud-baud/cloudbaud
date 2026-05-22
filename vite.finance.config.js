import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), htmlFallbackPlugin],
  define: {
    '__APP_VERSION__': JSON.stringify(packageJson.version),
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@common": path.resolve(__dirname, "../Synolic.Core/frontend/components"),
      "synolic.core": path.resolve(__dirname, "../Synolic.Core/index.ts"),
      "@synolic.core": path.resolve(__dirname, "../Synolic.Core/frontend/components/features"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
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
