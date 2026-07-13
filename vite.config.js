import { defineConfig } from 'vite';

export default defineConfig({
 // base: '/NOMBRE-DE-TU-REPO/', 
  test: {
    environment: 'jsdom', // Simula el navegador
  }
});