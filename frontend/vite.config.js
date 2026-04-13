import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      // 로컬 개발 시 프록시 사용
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
        },
        '/ws-stomp': {
          target: apiBase.replace('http', 'ws'),
          ws: true,
        }
      }
    }
  }
})
