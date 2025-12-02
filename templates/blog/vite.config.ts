import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tanaPlugin from '@tananetwork/vite-plugin-tana'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tanaPlugin({
      // Use local tana-edge binary during development
      edgeBinary: path.resolve(__dirname, '../../../edge/target/release/tana-edge'),
    }),
  ],
})
