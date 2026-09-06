import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function synolicResolverPlugin() {
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  const resolveWithExt = (basePath) => {
    for (const ext of extensions) {
      const p = basePath + ext;
      if (fs.existsSync(p)) return p;
    }
    for (const ext of extensions) {
      const p = path.join(basePath, 'index' + ext);
      if (fs.existsSync(p)) return p;
    }
    if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) return basePath;
    return null;
  };

  return {
    name: 'synolic-resolver',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source) return null;

      // Handle raw src/components/ui paths that don't exist
      const normalizedSource = source.replace(/\\/g, '/');
      if (normalizedSource.includes('src/components/ui/')) {
        const name = normalizedSource.split('src/components/ui/')[1];
        const candidateBases = [
          path.resolve(__dirname, 'src/shared/ui', name),
          path.resolve(__dirname, '../Synolic.Core/shared/components/ui', name),
          path.resolve(__dirname, '../Synolic.Core/shared/components', name),
          path.resolve(__dirname, '../Synolic.Core/frontend/components/ui', name),
        ];
        for (const base of candidateBases) {
          const res = resolveWithExt(base);
          if (res) return res;
        }
      }

      // Handle raw src/shared/ui paths that might actually be in src/shared/components
      if (normalizedSource.includes('src/shared/ui/')) {
        const name = normalizedSource.split('src/shared/ui/')[1];
        const candidateBases = [
          path.resolve(__dirname, 'src/shared/ui', name),
          path.resolve(__dirname, 'src/shared/components', name),
          path.resolve(__dirname, '../Synolic.Core/shared/components/ui', name),
          path.resolve(__dirname, '../Synolic.Core/shared/components', name),
        ];
        for (const base of candidateBases) {
          const res = resolveWithExt(base);
          if (res) return res;
        }
      }

      if (source.startsWith('@/components/ui/') || source.startsWith('@/shared/ui/') || source.startsWith('@/ui/')) {
        const name = source.replace(/^@\/(components\/ui|shared\/ui|ui)\//, '');
        const candidateBases = [
          path.resolve(__dirname, 'src/shared/ui', name),
          path.resolve(__dirname, 'src/shared/components', name),
          path.resolve(__dirname, '../Synolic.Core/shared/components/ui', name),
          path.resolve(__dirname, '../Synolic.Core/shared/components', name),
          path.resolve(__dirname, '../Synolic.Core/frontend/components/ui', name),
          path.resolve(__dirname, 'src/components/ui', name),
        ];
        for (const base of candidateBases) {
          const res = resolveWithExt(base);
          if (res) return res;
        }
      }

      if (source.startsWith('@/shared/components/')) {
        const sub = source.replace('@/shared/components/', '');
        const candidateBases = [
          path.resolve(__dirname, 'src/shared/components', sub),
          path.resolve(__dirname, 'src/shared/ui', sub),
          path.resolve(__dirname, '../Synolic.Core/shared/components', sub),
        ];
        for (const base of candidateBases) {
          const res = resolveWithExt(base);
          if (res) return res;
        }
      }

      const isSynolicImporter = importer && importer.toLowerCase().includes('synolic.core');
      if (isSynolicImporter && source.startsWith('@/')) {
        const sub = source.replace(/^@\//, '');
        const synolicBases = [
          path.resolve(__dirname, '../Synolic.Core/frontend', sub),
          path.resolve(__dirname, '../Synolic.Core/shared', sub),
          path.resolve(__dirname, '../Synolic.Core/shared/components', sub),
          path.resolve(__dirname, '../Synolic.Core/shared/components/ui', sub),
          path.resolve(__dirname, 'src', sub),
          path.resolve(__dirname, 'src/shared/ui', sub.replace(/^components\/ui\//, '')),
          path.resolve(__dirname, 'src/shared/components', sub.replace(/^components\/ui\//, '')),
          path.resolve(__dirname, 'src/shared/lib', sub.replace(/^lib\//, '')),
        ];
        for (const base of synolicBases) {
          const res = resolveWithExt(base);
          if (res) return res;
        }
        return null;
      }

      if (source === '@/context/ContentContext' || source === '@/contexts/ContentContext' || source.includes('context/ContentContext')) {
        return path.resolve(__dirname, 'src/shared/contexts/ContentContext.jsx');
      }

      return null;
    },
  };
}

function smartUiResolver() {
  const extensions = ['.tsx', '.jsx', '.ts', '.js'];
  return {
    name: 'smart-ui-resolver',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('@/components/ui/')) {
        const name = source.replace('@/components/ui/', '');
        const candidateBases = [
          path.resolve(__dirname, 'src/shared/ui', name),
          path.resolve(__dirname, 'src/shared/components', name),
          path.resolve(__dirname, '../Synolic.Core/shared/components/ui', name),
          path.resolve(__dirname, '../Synolic.Core/shared/components', name),
          path.resolve(__dirname, '../Synolic.Core/frontend/components/ui', name),
          path.resolve(__dirname, 'src/components/ui', name),
        ];
        for (const base of candidateBases) {
          for (const ext of extensions) {
            const p = base + ext;
            if (fs.existsSync(p)) return p;
          }
          if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
        }
        return null;
      }
      return null;
    }
  };
}

// FINANCE / WORKSPACE - includes everything, fixes card
export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify('0.0.2'), __BUILD_TIME__: JSON.stringify(new Date().toISOString()), 'process.env': {} },
  plugins: [smartUiResolver(), tailwindcss(), react(), synolicResolverPlugin()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-resizable-panels', 'lucide-react'],
    alias: [
      { find: 'react-resizable-panels', replacement: path.resolve(__dirname, 'node_modules/react-resizable-panels') },
      { find: 'react', replacement: path.resolve(__dirname, 'node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(__dirname, 'node_modules/react-dom') },
      { find: '@/components/ui', replacement: path.resolve(__dirname, 'src/shared/ui') },
      { find: '@/shared/components', replacement: path.resolve(__dirname, 'src/shared/components') },
      { find: '@/shared/ui', replacement: path.resolve(__dirname, 'src/shared/ui') },
      { find: '@/components/common', replacement: path.resolve(__dirname, 'src/components/common') },
      { find: '@/components/home', replacement: path.resolve(__dirname, 'src/components/home') },
      { find: '@/components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@/lib', replacement: path.resolve(__dirname, 'src/shared/lib') },
      { find: '@/context', replacement: path.resolve(__dirname, 'src/shared/contexts') },
      { find: '@/contexts', replacement: path.resolve(__dirname, 'src/shared/contexts') },
      { find: '@/workspace', replacement: path.resolve(__dirname, 'src/workspace') },
      { find: '@/collaboration', replacement: path.resolve(__dirname, 'src/collaboration') },
      { find: '@/shared', replacement: path.resolve(__dirname, 'src/shared') },
      { find: 'synolic.core', replacement: path.resolve(__dirname, '../Synolic.Core/frontend') },
      { find: 'src', replacement: path.resolve(__dirname, 'src') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  optimizeDeps: { exclude: [] },
  server: { 
    port: 17118, 
    strictPort: true, 
    host: true,
    fs: {
      allow: [__dirname, path.resolve(__dirname, '../Synolic.Core')]
    }
  },
});
