import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  build: {
    outDir: './gen',
    emptyOutDir: true,
    manifest: true,
    assetsDir: 'js',
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./client/home.ts', import.meta.url)),
        goooNavigation: fileURLToPath(new URL('./client/utils/goooNavigation.ts', import.meta.url)),
        themeSwitcher: fileURLToPath(new URL('./client/themeSwitcher.ts', import.meta.url)),
        todo: fileURLToPath(new URL('./client/todo.ts', import.meta.url)),
      },
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'css/[name].[hash].[ext]',
        manualChunks: {
          'gooo-hydrate': ['@/utils/goooHydrate.ts'],
        }
      },
    }
  },
  server: {
    host: "localhost",
    port: 5173,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./client', import.meta.url))
    },
  },
})
