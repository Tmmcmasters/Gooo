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
    outDir: './static/assets',
    emptyOutDir: true,
    assetsDir: 'js',
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./client/main.ts', import.meta.url)),
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: 'js/[name].[ext]',
      },
    }
  },
  // server: {
  //   origin: 'http://localhost:5173',
  //   hmr: {
  //     host: 'localhost',
  //     port: 5173
  //   }
  // },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./client', import.meta.url))
    },
  },
})
