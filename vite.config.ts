import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/anotatreino/', // Isso garante que os caminhos fiquem relativos ao nome do repo
})