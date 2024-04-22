import { defineConfig } from 'vite'
import path from "path"
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [legacy({
      targets: ['defaults', 'not IE 11'],
    })],
  build: {
      rollupOptions: {
          input: {
            'index': path.resolve(__dirname, "src/index.ts"),
            'toggle-switch': path.resolve(__dirname, "src/toggle-switch.ts")
          },
          output: [{
            format: 'esm',
            entryFileNames: '[name].js'
          }]
      }
  },
  server: {
    proxy: {
        '^/aalam/.*': 'http://192.168.122.233',
    }
  }
})

