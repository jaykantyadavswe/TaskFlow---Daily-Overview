import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export const config = {
  port: Number(process.env.PORT || 5000),
  trustProxyHops: Number(process.env.TRUST_PROXY_HOPS || 0),
  databaseFile: process.env.TASKFLOW_DATABASE_FILE || resolve(serverDirectory, 'data', 'taskflow.sqlite'),
  legacyDataFile: process.env.TASKFLOW_LEGACY_DATA_FILE || resolve(serverDirectory, 'data', 'taskflow.json'),
  clientDist: resolve(serverDirectory, '..', 'client', 'dist'),
  sessionLifetimeMs: 30 * 24 * 60 * 60 * 1000,
}
