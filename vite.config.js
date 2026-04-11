import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Dev-only middleware that runs Vercel-style serverless functions from /api
// during `npm run dev`, so we don't need `vercel dev` locally.
function apiMiddleware(env) {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      for (const [key, value] of Object.entries(env)) {
        if (!(key in process.env)) process.env[key] = value
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()

        const urlPath = req.url.split('?')[0]
        const relative = urlPath.replace(/^\/api\//, '')
        const handlerFile = path.resolve(__dirname, 'api', `${relative}.js`)

        let mod
        try {
          mod = await server.ssrLoadModule(handlerFile)
        } catch (err) {
          console.error(`[dev-api] Failed to load ${handlerFile}:`, err.message)
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'API route not found' }))
          return
        }

        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const raw = Buffer.concat(chunks).toString('utf8')
        try {
          req.body = raw ? JSON.parse(raw) : {}
        } catch {
          req.body = raw
        }

        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
          return res
        }

        try {
          await mod.default(req, res)
        } catch (err) {
          console.error('[dev-api] Handler error:', err)
          if (!res.writableEnded) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Internal server error' }))
          }
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), apiMiddleware(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
