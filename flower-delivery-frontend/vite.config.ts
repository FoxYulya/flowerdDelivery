import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/flowerdDelivery/', // обязательно с косой чертой в конце
  plugins: [react()],
});
