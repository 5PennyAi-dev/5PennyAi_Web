import { Buffer } from 'node:buffer'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const CURRENT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_FUNCTION_ROUTES = new Map([
  ['/sitemap.xml', 'sitemap'],
  ['/robots.txt', 'robots'],
])
export const MIDDLEWARE_PATH_PATTERN =
  /^\/(?:blog\/[^/]+|ressources-ia\/(?:articles|infographies)\/[^/]+)\/?$/

// Dev-only middleware that runs Vercel-style functions and crawler middleware
// during `npm run dev`, so the SEO HTTP routes can be validated locally.
function apiMiddleware(env) {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      for (const [key, value] of Object.entries(env)) {
        if (!(key in process.env)) process.env[key] = value
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next()
        const urlPath = req.url.split('?')[0]

        if (MIDDLEWARE_PATH_PATTERN.test(urlPath)) {
          const handled = await runRoutingMiddleware(server, req, res)
          if (handled) return
        }

        const relative = resolveApiHandlerPath(urlPath)
        if (!relative) return next()

        const handlerFile = path.resolve(CURRENT_DIRECTORY, 'api', `${relative}.js`)
        let mod
        try {
          mod = await server.ssrLoadModule(handlerFile)
        } catch (error) {
          console.error(`[dev-api] Failed to load ${handlerFile}:`, error.message)
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
        } catch (error) {
          console.error('[dev-api] Handler error:', error)
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

export function resolveApiHandlerPath(urlPath) {
  if (/^\/api\/article-social-image\/[^/]+\/?$/.test(urlPath)) {
    return 'article-social-image'
  }
  return urlPath.startsWith('/api/')
    ? urlPath.replace(/^\/api\//, '')
    : PUBLIC_FUNCTION_ROUTES.get(urlPath)
}

async function runRoutingMiddleware(server, req, res) {
  try {
    const mod = await server.ssrLoadModule(path.resolve(CURRENT_DIRECTORY, 'middleware.js'))
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    const headers = new Headers()
    for (let index = 0; index < req.rawHeaders.length; index += 2) {
      headers.append(req.rawHeaders[index], req.rawHeaders[index + 1])
    }
    const response = await mod.default(new Request(requestUrl, { method: req.method, headers }))
    if (!response) return false
    res.statusCode = response.status
    response.headers.forEach((value, key) => res.setHeader(key, value))
    const body = Buffer.from(await response.arrayBuffer())
    res.end(body)
    return true
  } catch (error) {
    console.error('[dev-middleware] Handler error:', error)
    return false
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), apiMiddleware(env)],
    resolve: {
      alias: {
        '@': path.resolve(CURRENT_DIRECTORY, './src'),
      },
    },
  }
})
