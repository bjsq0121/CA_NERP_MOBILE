import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

// 도면 이미지 원본 경로 — OS별 자동 감지
const DATA_ROOT = process.platform === 'win32'
  ? 'C:/Projects/ca_erp/workspace/CA_ERP/WebContent/data'
  : '/mnt/c/Projects/ca_erp/workspace/CA_ERP/WebContent/data'

console.log('[serve-data] platform:', process.platform, 'DATA_ROOT:', DATA_ROOT)
console.log('[serve-data] exists:', fs.existsSync(DATA_ROOT))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_BACKEND_ORIGIN || 'http://localhost:8080'
  return {
    plugins: [
      // /data/** 미들웨어를 vue() 보다 먼저 등록
      {
        name: 'serve-data-files',
        configureServer(server) {
          // return 없이 직접 등록 → Vite 내부 미들웨어보다 먼저 실행
          server.middlewares.use((req, res, next) => {
            if (!req.url || !req.url.startsWith('/data/')) return next()
            const relPath = decodeURIComponent(req.url.slice(5)).split('?')[0]
            const filePath = path.join(DATA_ROOT, relPath)
            console.log('[serve-data] req:', req.url, '-> file:', filePath, 'exists:', fs.existsSync(filePath))
            try {
              if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const ext = path.extname(filePath).toLowerCase()
                const mime = {
                  '.gif': 'image/gif', '.png': 'image/png',
                  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
                  '.bmp': 'image/bmp', '.svg': 'image/svg+xml',
                }
                res.writeHead(200, {
                  'Content-Type': mime[ext] || 'application/octet-stream',
                  'Cache-Control': 'public, max-age=86400',
                })
                fs.createReadStream(filePath).pipe(res)
                return
              }
            } catch (e) {
              console.error('[serve-data] error:', e.message)
            }
            next()
          })
        },
      },
      vue(),
    ],
    server: {
      host: '0.0.0.0',
      port: 5180,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('error', (err, req) => {
              console.error('[proxy:error]', req.method, req.url, '->', err.message)
            })
            proxy.on('proxyReq', (proxyReq, req) => {
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
