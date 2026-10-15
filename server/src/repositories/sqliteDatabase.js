import { DatabaseSync } from 'node:sqlite'
import { access, mkdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const schema = `
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expiration_idx ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL COLLATE NOCASE,
    type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, name)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Personal',
    group_id TEXT NOT NULL REFERENCES groups(id),
    due_date TEXT NOT NULL DEFAULT '',
    due_time TEXT NOT NULL DEFAULT '',
    completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'done')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
    labels TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS tasks_workspace_idx ON tasks(user_id, status, due_date);

  CREATE TABLE IF NOT EXISTS task_subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1)),
    position INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS task_subtasks_order_idx ON task_subtasks(task_id, position);

  PRAGMA user_version = 2;
`

async function migrateLegacyData(database, databaseFile, legacyDataFile) {
  if (!legacyDataFile) return
  const filePath = resolve(legacyDataFile)
  if (filePath === resolve(databaseFile)) return
  try {
    await access(filePath)
  } catch (error) {
    if (error.code === 'ENOENT') return
    throw error
  }

  const existingUsers = database.prepare('SELECT COUNT(*) AS count FROM users').get().count
  if (existingUsers !== 0) return

  const legacy = JSON.parse(await readFile(filePath, 'utf8'))
  if (!legacy || !['users', 'sessions', 'groups', 'tasks'].every((key) => Array.isArray(legacy[key]))) {
    throw new Error('Legacy TaskFlow data file has an invalid structure; it was not modified.')
  }

  database.exec('BEGIN IMMEDIATE')
  try {
    const insertUser = database.prepare(`
      INSERT INTO users (id, name, email, password_salt, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    for (const user of legacy.users) {
      insertUser.run(
        String(user.id),
        user.name,
        user.email,
        user.passwordSalt,
        user.passwordHash,
        user.createdAt || new Date().toISOString(),
      )
    }

    const insertSession = database.prepare(`
      INSERT INTO sessions (token_hash, user_id, expires_at)
      VALUES (?, ?, ?)
    `)
    for (const session of legacy.sessions) {
      insertSession.run(session.tokenHash, String(session.userId), Number(session.expiresAt))
    }

    const insertGroup = database.prepare(`
      INSERT INTO groups (id, user_id, name, type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    for (const group of legacy.groups) {
      insertGroup.run(
        String(group.id),
        String(group.userId),
        group.name,
        group.type || 'Other',
        group.createdAt || new Date().toISOString(),
      )
    }

    const insertTask = database.prepare(`
      INSERT INTO tasks (
        id, user_id, title, description, category, group_id, due_date, due_time,
        completed, status, priority, labels, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const task of legacy.tasks) {
      const completed = Boolean(task.completed)
      insertTask.run(
        String(task.id),
        String(task.userId),
        task.title,
        task.description || '',
        task.category || 'Personal',
        String(task.groupId),
        task.dueDate || '',
        task.dueTime || '',
        completed ? 1 : 0,
        completed ? 'done' : 'todo',
        'medium',
        '[]',
        task.createdAt || new Date().toISOString(),
        task.updatedAt || new Date().toISOString(),
      )
    }
    database.exec('COMMIT')
    console.info(`Imported ${legacy.users.length} TaskFlow account(s) from the legacy JSON file.`)
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
}

export async function createSqliteDatabase(databaseFile, { legacyDataFile } = {}) {
  await mkdir(dirname(databaseFile), { recursive: true })
  const database = new DatabaseSync(databaseFile)
  try {
    database.exec(schema)
    await migrateLegacyData(database, databaseFile, legacyDataFile)
  } catch (error) {
    database.close()
    throw error
  }
  return { connection: database, close: () => database.close() }
}
