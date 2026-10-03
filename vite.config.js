import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/bimbelerha/', // Sesuaikan dengan nama repository GitHub Anda (huruf besar/kecil harus sama)
})
