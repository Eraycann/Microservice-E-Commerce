import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite' // <-- 1. Bu satırı ekle

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),      // <-- Mevcut React eklentin burada
    tailwindcss(), // <-- 2. Virgül koyup bunu altına ekle
  ],
})