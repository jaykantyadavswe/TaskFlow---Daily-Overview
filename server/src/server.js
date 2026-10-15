import { createApp } from '../app.js'
import { config } from './config/config.js'

try {
  const app = await createApp()
  const server = app.listen(config.port, () => console.log(`TaskFlow API listening on port ${config.port}`))
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(() => {
        app.locals.closeDatabase()
        process.exit(0)
      })
    })
  }
} catch (error) {
  console.error('Could not initialize TaskFlow API:', error)
  process.exitCode = 1
}
