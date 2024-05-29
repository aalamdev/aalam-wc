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
            'toggle-switch': path.resolve(__dirname, "src/toggle-switch.ts"),
            'slider': path.resolve(__dirname, "src/slider.ts"),
            'minput': path.resolve(__dirname, "src/minput.ts")
          },
          output: [{
            format: 'esm',
            entryFileNames: '[name].js'
          }]
      }
  },
  server: {
    host: "0.0.0.0",
    proxy: {
        '^/aalam/.*': 'http://192.168.122.233',
    }
  }
})

