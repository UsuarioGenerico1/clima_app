import { defineConfig } from 'vite';

export default defineConfig({
 base: '/clima_app/', 
  test: {
    environment: 'jsdom', // Simula el navegador
  }
});