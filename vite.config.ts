import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Tentativa02/', // 👈 ISSO DIZ AO GITHUB EXATAMENTE ONDE ACHAR OS SCRIPTS
})
