import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' + HashRouter means the production build runs from any static host
// (or straight off the filesystem) with zero server configuration.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // Vite does not read PORT on its own. Honouring it lets a supervising harness
  // assign a free port instead of Vite silently incrementing past a busy 5173 —
  // which leaves the caller pointed at a port nothing is listening on.
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
  },
})
