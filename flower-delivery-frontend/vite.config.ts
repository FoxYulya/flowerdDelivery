import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/flowerdDelivery/', // Важно: название вашего репозитория
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})