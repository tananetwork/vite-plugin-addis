import { defineConfig } from 'tsup'

export default defineConfig([
  // Main plugin entry
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  // CLI binary with shebang
  {
    entry: ['src/build.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    banner: {
      js: '#!/usr/bin/env node'
    }
  }
])
