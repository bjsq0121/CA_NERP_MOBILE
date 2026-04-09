import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_BACKEND_ORIGIN || 'http://localhost:8080'
  return {
    plugins: [vue()],
    server: {
      port: 5180,
      proxy: {
        '/data': {
          target,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Origin', 'http://localhost:4830')
            })
          },
        },
        '/api': {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('error', (err, req) => {
              console.error('[proxy:error]', req.method, req.url, '->', err.message)
            })
            proxy.on('proxyReq', (proxyReq, req) => {
              // 백엔드 CORS allowed origins 에 맞춰 Origin/Referer 재작성
              proxyReq.setHeader('Origin', 'http://localhost:4830')
              proxyReq.setHeader('Referer', 'http://localhost:4830/')
              console.log('[proxy:req]', req.method, req.url, '->', target + proxyReq.path)
            })
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('[proxy:res]', proxyRes.statusCode, req.method, req.url)
            })
          },
        },
      },
    },
  }
})
