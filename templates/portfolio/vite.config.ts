import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tanaPlugin from '@tananetwork/vite-plugin-tana'

export default defineConfig({
  root: 'public',
  plugins: [
    react(),
    tailwindcss(),
    tanaPlugin(),
  ],
  server: {
    allowedHosts: true,
  },
})
