import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function synolicResolverPlugin() {
  return {
    name: 'synolic-resolver',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source) return null;
      // ContentContext special case
      if (source === '@/context/ContentContext' || source === '@/contexts/ContentContext' || source.includes('context/ContentContext')) {
        return path.resolve(__dirname,'src/shared/contexts/ContentContext.jsx');
      }
      // shared/components -> shared/ui
      if (source.startsWith('@/shared/components/')) {
        const sub = source.replace('@/shared/components/','');
        // try button.jsx, index.jsx etc
        const base = path.resolve(__dirname,'src/shared/ui', sub);
        const candidates = [
          base + '.jsx',
          base + '.tsx',
          base + '.js',
          base + '.ts',
          path.join(base, 'index.jsx'),
          path.join(base, 'index.tsx'),
        ];
        for (const c of candidates) {
          if (fs.existsSync(c)) return c;
        }
        // fallback to base itself - vite will try extensions
        if (fs.existsSync(path.dirname(base))) return base;
      }
      return null;
    },
  };
}

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify('0.0.2'), __BUILD_TIME__: JSON.stringify(new Date().toISOString()), 'process.env': {} },
  plugins: [tailwindcss(), react(), synolicResolverPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname,'src'),
      '@/lib': path.resolve(__dirname,'src/shared/lib'),
      '@/components': path.resolve(__dirname,'src/components'),
      '@/components/ui': path.resolve(__dirname,'src/shared/ui'),
      '@/components/common': path.resolve(__dirname,'src/components/common'),
      '@/components/home': path.resolve(__dirname,'src/components/home'),
      '@/shared': path.resolve(__dirname,'src/shared'),
      '@/shared/ui': path.resolve(__dirname,'src/shared/ui'),
      '@/shared/components': path.resolve(__dirname,'src/shared/ui'),
      '@/context': path.resolve(__dirname,'src/shared/contexts'),
      '@/contexts': path.resolve(__dirname,'src/shared/contexts'),
      '@/workspace': path.resolve(__dirname,'src/workspace'),
      'src': path.resolve(__dirname,'src'),
    },
    extensions: ['.js','.jsx','.ts','.tsx','.json'],
  },
  server: { port: 17117, strictPort: true, host: true },
});
