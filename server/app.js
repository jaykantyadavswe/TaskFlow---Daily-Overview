import express from 'express'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import helmet from 'helmet'
import { createAuthController } from './src/controllers/authController.js'
import { createWorkspaceController } from './src/controllers/workspaceController.js'
import { config } from './src/config/config.js'
import { errorHandler } from './src/middleware/errorHandler.js'
import { createAuthenticate } from './src/middleware/authenticate.js'
import { authRateLimit } from './src/middleware/authRateLimit.js'
import { createSqliteDatabase } from './src/repositories/sqliteDatabase.js'
import { createTaskFlowRepository } from './src/repositories/taskFlowRepository.js'
import { createAuthRoutes } from './src/routes/authRoutes.js'
import { createWorkspaceRoutes } from './src/routes/workspaceRoutes.js'
import { createAuthService } from './src/services/authService.js'
import { createWorkspaceService } from './src/services/workspaceService.js'

export async function createApp({
  databaseFile = config.databaseFile,
  legacyDataFile = config.legacyDataFile,
} = {}) {
  const database = await createSqliteDatabase(databaseFile, { legacyDataFile })

  const repository = createTaskFlowRepository(database)
  const authService = createAuthService(repository)
  const workspaceService = createWorkspaceService(repository)
  const authenticate = createAuthenticate(authService)
  const authController = createAuthController(authService)
  const workspaceController = createWorkspaceController(workspaceService)
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', config.trustProxyHops)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'img-src': ["'self'", 'data:'],
        'object-src': ["'none'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'"],
      },
    },
  }))
  app.use(express.json({ limit: '32kb' }))
  app.get('/api/health', (_request, response) => response.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    database: 'sqlite',
  }))
  app.use('/api/auth', (request, response, next) => {
    if (request.method === 'POST' && ['/signin', '/signup'].includes(request.path)) {
      return authRateLimit(request, response, next)
    }
    return next()
  }, createAuthRoutes(authController, authenticate))
  app.patch('/api/profile', authenticate, authController.updateProfile)
  app.use('/api', createWorkspaceRoutes(workspaceController, authenticate))
  if (existsSync(config.clientDist)) {
    app.use(express.static(config.clientDist, { index: false, maxAge: '1d' }))
  }
  app.get('*path', (request, response, next) => {
    if (request.path === '/api' || request.path.startsWith('/api/')) return next()
    const indexFile = join(config.clientDist, 'index.html')
    if (request.accepts('html') && existsSync(indexFile)) return response.sendFile(indexFile)
    return next()
  })
  app.use((_request, response) => response.status(404).json({ error: 'Route not found.' }))
  app.use(errorHandler)
  app.locals.closeDatabase = database.close

  return app
}
