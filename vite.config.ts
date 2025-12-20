import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: { allowedHosts: true,
    port: 5173,
    host: true,
    hmr: {
      // Sem "host" fixo, ele usa o IP/Domínio que estiver no navegador
      port: 80,
      clientPort: 80,
    }
  }
})
