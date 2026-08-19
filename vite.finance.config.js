import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  server: {
    port: 17118,
    strictPort: true,
  },
  build: {
    outDir: 'dist-finance',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'finance.html'),
    },
  },
})