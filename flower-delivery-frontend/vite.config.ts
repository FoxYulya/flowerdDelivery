import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Для Netlify используйте корневой путь
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})