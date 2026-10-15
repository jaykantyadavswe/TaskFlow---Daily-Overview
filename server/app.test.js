import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { mkdtemp, readFile, rm, rmdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { createApp } from './app.js'

let server
let app
let baseUrl
let databaseFile
let temporaryDirectory
let token
let groupId
let taskId

async function api(path, { method = 'GET', body, authToken = token } = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

before(async () => {
  temporaryDirectory = await mkdtemp(join(tmpdir(), 'taskflow-test-'))
  databaseFile = join(temporaryDirectory, 'taskflow.sqlite')
  app = await createApp({ databaseFile, legacyDataFile: join(temporaryDirectory, 'legacy.json') })
  server = app.listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => {
    server.once('listening', resolve)
    server.once('error', reject)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve))
  app?.locals.closeDatabase()
  if (databaseFile) {
    await Promise.all(['', '-shm', '-wal'].map((suffix) => rm(`${databaseFile}${suffix}`, { force: true })))
  }
  if (temporaryDirectory) await rmdir(temporaryDirectory)
})

test('signup, sign in, and reject invalid credentials', async () => {
  const response = await api('/api/auth/signup', {
    method: 'POST',
    authToken: null,
    body: { name: 'Taylor User', email: 'Taylor@example.com', password: 'secure-password' },
  })
  assert.equal(response.status, 201)
  const result = await response.json()
  assert.equal(result.user.email, 'taylor@example.com')
  assert.equal(typeof result.token, 'string')
  assert.equal(Object.hasOwn(result.user, 'passwordHash'), false)
  token = result.token

  const groupsResponse = await api('/api/groups')
  const groups = (await groupsResponse.json()).groups
  assert.equal(groups.length, 3)
  groupId = groups[0].id

  const duplicate = await api('/api/auth/signup', {
    method: 'POST',
    authToken: null,
    body: { name: 'Another User', email: 'taylor@example.com', password: 'secure-password' },
  })
  assert.equal(duplicate.status, 409)

  const badLogin = await api('/api/auth/signin', {
    method: 'POST',
    authToken: null,
    body: { email: 'taylor@example.com', password: 'incorrect-password' },
  })
  assert.equal(badLogin.status, 401)

  const login = await api('/api/auth/signin', {
    method: 'POST',
    authToken: null,
    body: { email: 'TAYLOR@example.com', password: 'secure-password' },
  })
  assert.equal(login.status, 200)
  token = (await login.json()).token
})

test('task and group CRUD is authenticated and user-scoped', async () => {
  const unauthorized = await api('/api/workspace', { authToken: null })
  assert.equal(unauthorized.status, 401)

  const createdGroup = await api('/api/groups', {
    method: 'POST',
    body: { name: 'Research', type: 'Study' },
  })
  assert.equal(createdGroup.status, 201)
  const duplicateGroup = await api('/api/groups', {
    method: 'POST',
    body: { name: 'research', type: 'Study' },
  })
  assert.equal(duplicateGroup.status, 409)

  const createdTask = await api('/api/tasks', {
    method: 'POST',
    body: {
      title: 'Write tests',
      description: 'Cover the authenticated task workflow.',
      category: 'Planning',
      groupId,
      dueDate: '2026-10-20',
      dueTime: '09:30',
      priority: 'high',
      status: 'in_progress',
      labels: ['backend', 'release'],
      subtasks: [
        { title: 'Add the API contract' },
        { title: 'Cover the happy path', completed: true },
      ],
    },
  })
  assert.equal(createdTask.status, 201)
  const result = (await createdTask.json()).task
  assert.equal(result.title, 'Write tests')
  assert.equal(result.completed, false)
  assert.equal(result.status, 'in_progress')
  assert.equal(result.priority, 'high')
  assert.deepEqual(result.labels, ['backend', 'release'])
  assert.deepEqual(result.subtasks.map(({ title, completed }) => ({ title, completed })), [
    { title: 'Add the API contract', completed: false },
    { title: 'Cover the happy path', completed: true },
  ])
  taskId = result.id

  const invalidTask = await api('/api/tasks', {
    method: 'POST',
    body: { title: 'Invalid group', groupId: 'not-yours', dueDate: '', dueTime: '' },
  })
  assert.equal(invalidTask.status, 400)

  const completedTask = await api(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: { completed: true },
  })
  assert.equal((await completedTask.json()).task.completed, true)
  assert.equal((await api(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: { status: 'not-a-status' },
  })).status, 400)
  assert.equal((await api(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: { labels: ['x'.repeat(25)] },
  })).status, 400)
  const updatedSubtasks = await api(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: { subtasks: [{ title: 'Ship the MVP', completed: true }] },
  })
  assert.deepEqual((await updatedSubtasks.json()).task.subtasks.map(({ title, completed }) => ({ title, completed })), [
    { title: 'Ship the MVP', completed: true },
  ])

  const workspace = await api('/api/workspace')
  assert.equal((await workspace.json()).tasks.length, 1)

  const otherSignup = await api('/api/auth/signup', {
    method: 'POST',
    authToken: null,
    body: { name: 'Other User', email: 'other@example.com', password: 'secure-password' },
  })
  const otherToken = (await otherSignup.json()).token
  const crossAccountTask = await api(`/api/tasks/${taskId}`, { authToken: otherToken })
  assert.equal(crossAccountTask.status, 404)
  await api('/api/auth/logout', { method: 'POST', authToken: otherToken })

  const deleted = await api(`/api/tasks/${taskId}`, { method: 'DELETE' })
  assert.equal(deleted.status, 204)
  assert.equal((await api(`/api/tasks/${taskId}`)).status, 404)
})

test('profiles and sessions persist across app restarts', async () => {
  const update = await api('/api/profile', {
    method: 'PATCH',
    body: { name: 'Taylor Updated', email: 'new-email@example.com' },
  })
  assert.equal((await update.json()).user.name, 'Taylor Updated')

  const currentUser = await api('/api/auth/me')
  assert.equal((await currentUser.json()).user.email, 'new-email@example.com')

  const database = new DatabaseSync(databaseFile)
  try {
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM users').get().count, 2)
    assert.notEqual(
      database.prepare('SELECT password_hash FROM users LIMIT 1').get().password_hash,
      'secure-password',
    )
  } finally {
    database.close()
  }

  const taskResponse = await api('/api/tasks', {
    method: 'POST',
    body: {
      title: 'Persist this task',
      description: 'This survives a service restart.',
      category: 'Planning',
      groupId,
      dueDate: '',
      dueTime: '',
      priority: 'urgent',
      labels: ['persistent'],
      subtasks: [{ title: 'Confirm persistence', completed: true }],
    },
  })
  taskId = (await taskResponse.json()).task.id

  await new Promise((resolve) => server.close(resolve))
  app.locals.closeDatabase()
  app = await createApp({ databaseFile, legacyDataFile: join(temporaryDirectory, 'legacy.json') })
  server = app.listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => {
    server.once('listening', resolve)
    server.once('error', reject)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`

  const persistedSession = await api('/api/auth/me')
  assert.equal(persistedSession.status, 200)
  assert.equal((await persistedSession.json()).user.name, 'Taylor Updated')

  const persistedWorkspace = await api('/api/workspace')
  const workspace = await persistedWorkspace.json()
  assert.equal(workspace.groups.length, 4)
  assert.equal(workspace.tasks[0].title, 'Persist this task')
  assert.equal(workspace.tasks[0].priority, 'urgent')
  assert.equal(workspace.tasks[0].description, 'This survives a service restart.')
  assert.deepEqual(workspace.tasks[0].labels, ['persistent'])
  assert.equal(workspace.tasks[0].subtasks[0].title, 'Confirm persistence')
  assert.equal(workspace.tasks[0].subtasks[0].completed, true)

  const deletedTask = await api(`/api/tasks/${taskId}`, { method: 'DELETE' })
  assert.equal(deletedTask.status, 204)

  const logout = await api('/api/auth/logout', { method: 'POST' })
  assert.equal(logout.status, 204)
  assert.equal((await api('/api/auth/me')).status, 401)
})

test('migrates legacy JSON data to SQLite without modifying the source file', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'taskflow-migration-'))
  const legacyDataFile = join(directory, 'taskflow.json')
  const migrationDatabaseFile = join(directory, 'taskflow.sqlite')
  const legacyData = {
    users: [{
      id: 'legacy-user',
      name: 'Legacy User',
      email: 'legacy@example.com',
      passwordSalt: 'salt',
      passwordHash: 'hashed-password',
    }],
    sessions: [{ tokenHash: 'legacy-token-hash', userId: 'legacy-user', expiresAt: Date.now() + 60_000 }],
    groups: [{ id: 'legacy-group', userId: 'legacy-user', name: 'Personal', type: 'Personal' }],
    tasks: [{
      id: 'legacy-task',
      userId: 'legacy-user',
      title: 'Keep my old task',
      groupId: 'legacy-group',
      completed: false,
    }],
  }
  await writeFile(legacyDataFile, JSON.stringify(legacyData))

  const migrationApp = await createApp({ databaseFile: migrationDatabaseFile, legacyDataFile })
  const database = new DatabaseSync(migrationDatabaseFile)
  assert.equal(database.prepare('SELECT COUNT(*) AS count FROM users').get().count, 1)
  assert.equal(database.prepare('SELECT title FROM tasks WHERE id = ?').get('legacy-task').title, 'Keep my old task')
  assert.equal(JSON.parse(await readFile(legacyDataFile, 'utf8')).users.length, 1)
  database.close()
  migrationApp.locals.closeDatabase()
  await Promise.all(['', '-shm', '-wal'].map((suffix) => rm(`${migrationDatabaseFile}${suffix}`, { force: true })))
  await rm(legacyDataFile, { force: true })
  await rmdir(directory)
})

test('serves a security-hardened health response and rate-limits authentication attempts', async () => {
  const health = await api('/api/health', { authToken: null })
  assert.equal(health.status, 200)
  assert.equal((await health.json()).database, 'sqlite')
  assert.ok(health.headers.get('content-security-policy'))
  assert.equal(health.headers.get('x-powered-by'), null)

  let lastResponse
  for (let attempt = 0; attempt < 21; attempt += 1) {
    lastResponse = await api('/api/auth/signin', {
      method: 'POST',
      authToken: null,
      body: { email: 'unknown@example.com', password: 'incorrect-password' },
    })
  }
  assert.equal(lastResponse.status, 429)
  assert.match((await lastResponse.json()).error, /Too many sign-in attempts/)
})
