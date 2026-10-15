import { randomUUID } from 'node:crypto'
import { AppError } from '../utils/AppError.js'
import { normalizeEmail } from '../utils/validation.js'

const defaultGroups = [
  ['Coding', 'Coding'],
  ['Health', 'Health'],
  ['Personal', 'Personal'],
]

const userFields = `
  id, name, email, password_salt AS passwordSalt,
  password_hash AS passwordHash, created_at AS createdAt
`

const taskFields = `
  tasks.id, tasks.user_id AS userId, tasks.title, tasks.description, tasks.category,
  tasks.group_id AS groupId, tasks.due_date AS dueDate, tasks.due_time AS dueTime,
  tasks.completed, tasks.status, tasks.priority, tasks.labels,
  tasks.created_at AS createdAt, tasks.updated_at AS updatedAt,
  groups.name AS groupName, groups.type AS groupType
`

function toTask(row) {
  if (!row) return null
  return {
    ...row,
    completed: Boolean(row.completed),
    labels: JSON.parse(row.labels),
  }
}

function getSubtasks(db, taskId) {
  return db.prepare(`
    SELECT id, title, completed FROM task_subtasks
    WHERE task_id = ? ORDER BY position
  `).all(taskId).map((subtask) => ({ ...subtask, completed: Boolean(subtask.completed) }))
}

function insertSubtasks(db, taskId, subtasks = []) {
  const insert = db.prepare(`
    INSERT INTO task_subtasks (id, task_id, title, completed, position)
    VALUES (?, ?, ?, ?, ?)
  `)
  subtasks.forEach((subtask, position) => {
    insert.run(randomUUID(), taskId, subtask.title.trim(), Number(Boolean(subtask.completed)), position)
  })
}

function handleConstraint(error, message) {
  if (error.code?.startsWith('SQLITE_CONSTRAINT') || error.errcode === 2067 || error.errcode === 1555) {
    throw new AppError(409, message)
  }
  throw error
}

export function createTaskFlowRepository(database) {
  const db = database.connection

  return {
    findUserByEmail(email) {
      return db.prepare(`SELECT ${userFields} FROM users WHERE email = ? COLLATE NOCASE`)
        .get(normalizeEmail(email))
    },

    findUserById(userId) {
      return db.prepare(`SELECT ${userFields} FROM users WHERE id = ?`).get(userId)
    },

    async createAccount(user, session) {
      db.exec('BEGIN IMMEDIATE')
      try {
        db.prepare(`
          INSERT INTO users (id, name, email, password_salt, password_hash, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(user.id, user.name, user.email, user.passwordSalt, user.passwordHash, user.createdAt)
        db.prepare(`
          INSERT INTO sessions (token_hash, user_id, expires_at)
          VALUES (?, ?, ?)
        `).run(session.tokenHash, session.userId, session.expiresAt)
        const insertGroup = db.prepare(`
          INSERT INTO groups (id, user_id, name, type, created_at)
          VALUES (?, ?, ?, ?, ?)
        `)
        for (const [name, type] of defaultGroups) {
          insertGroup.run(randomUUID(), user.id, name, type, new Date().toISOString())
        }
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        handleConstraint(error, 'An account with this email already exists.')
      }
    },

    findSessionByHash(tokenHash) {
      return db.prepare(`
        SELECT token_hash AS tokenHash, user_id AS userId, expires_at AS expiresAt
        FROM sessions WHERE token_hash = ?
      `).get(tokenHash)
    },

    async createSession(session) {
      db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now())
      db.prepare(`
        INSERT INTO sessions (token_hash, user_id, expires_at)
        VALUES (?, ?, ?)
      `).run(session.tokenHash, session.userId, session.expiresAt)
    },

    async deleteSession(tokenHash) {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash)
    },

    async updateProfile(userId, name, email) {
      try {
        const result = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?')
          .run(name.trim(), normalizeEmail(email), userId)
        if (result.changes === 0) throw new AppError(404, 'Account not found.')
      } catch (error) {
        handleConstraint(error, 'An account with this email already exists.')
      }
      return this.findUserById(userId)
    },

    getWorkspace(userId) {
      const groups = db.prepare(`
        SELECT id, user_id AS userId, name, type, created_at AS createdAt
        FROM groups WHERE user_id = ? ORDER BY created_at, name
      `).all(userId)
      const tasks = db.prepare(`
        SELECT ${taskFields} FROM tasks
        LEFT JOIN groups ON groups.id = tasks.group_id
        WHERE tasks.user_id = ?
        ORDER BY CASE tasks.status WHEN 'in_progress' THEN 1 WHEN 'todo' THEN 2 ELSE 3 END,
          CASE tasks.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
          tasks.due_date = '', tasks.due_date, tasks.due_time, tasks.created_at DESC
      `).all(userId).map(toTask)
      const subtasksByTask = new Map()
      const subtasks = db.prepare(`
        SELECT task_subtasks.id, task_subtasks.task_id AS taskId,
          task_subtasks.title, task_subtasks.completed
        FROM task_subtasks
        JOIN tasks ON tasks.id = task_subtasks.task_id
        WHERE tasks.user_id = ?
        ORDER BY task_subtasks.task_id, task_subtasks.position
      `).all(userId)
      for (const subtask of subtasks) {
        const taskSubtasks = subtasksByTask.get(subtask.taskId) ?? []
        taskSubtasks.push({ id: subtask.id, title: subtask.title, completed: Boolean(subtask.completed) })
        subtasksByTask.set(subtask.taskId, taskSubtasks)
      }
      for (const task of tasks) task.subtasks = subtasksByTask.get(task.id) ?? []
      return { groups, tasks }
    },

    async createGroup(userId, name, type) {
      const group = {
        id: randomUUID(),
        userId,
        name: name.trim(),
        type,
        createdAt: new Date().toISOString(),
      }
      try {
        db.prepare(`
          INSERT INTO groups (id, user_id, name, type, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(group.id, group.userId, group.name, group.type, group.createdAt)
      } catch (error) {
        handleConstraint(error, 'A group with this name already exists.')
      }
      return group
    },

    async createTask(userId, taskFields) {
      const now = new Date().toISOString()
      const status = taskFields.status ?? (taskFields.completed ? 'done' : 'todo')
      const task = {
        description: '',
        category: 'Personal',
        dueDate: '',
        dueTime: '',
        priority: 'medium',
        labels: [],
        subtasks: [],
        ...taskFields,
        id: randomUUID(),
        userId,
        status,
        completed: status === 'done',
        subtasks: (taskFields.subtasks ?? []).map((subtask) => ({
          title: subtask.title.trim(),
          completed: Boolean(subtask.completed),
        })),
        createdAt: now,
        updatedAt: now,
      }
      db.exec('BEGIN IMMEDIATE')
      try {
        db.prepare(`
          INSERT INTO tasks (
            id, user_id, title, description, category, group_id, due_date, due_time,
            completed, status, priority, labels, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          task.id, task.userId, task.title, task.description, task.category, task.groupId,
          task.dueDate, task.dueTime, Number(task.completed), task.status, task.priority,
          JSON.stringify(task.labels), task.createdAt, task.updatedAt,
        )
        insertSubtasks(db, task.id, task.subtasks)
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
      return task
    },

    async updateTask(userId, taskId, taskFields) {
      const currentRow = db.prepare(`
        SELECT ${taskFieldsSql} FROM tasks WHERE id = ? AND user_id = ?
      `).get(taskId, userId)
      if (!currentRow) throw new AppError(404, 'Task not found.')

      const currentTask = toTask(currentRow)
      currentTask.subtasks = getSubtasks(db, currentTask.id)
      const updated = { ...currentTask, ...taskFields }
      if (Object.hasOwn(taskFields, 'completed') && !Object.hasOwn(taskFields, 'status')) {
        updated.status = taskFields.completed
          ? 'done'
          : currentTask.status === 'done' ? 'todo' : currentTask.status
      } else if (Object.hasOwn(taskFields, 'status')) {
        updated.completed = taskFields.status === 'done'
      }
      const updatedAt = new Date().toISOString()
      db.exec('BEGIN IMMEDIATE')
      try {
        db.prepare(`
          UPDATE tasks SET title = ?, description = ?, category = ?, group_id = ?,
            due_date = ?, due_time = ?, completed = ?, status = ?, priority = ?,
            labels = ?, updated_at = ?
          WHERE id = ? AND user_id = ?
        `).run(
          updated.title, updated.description, updated.category, updated.groupId,
          updated.dueDate, updated.dueTime, Number(updated.status === 'done'), updated.status,
          updated.priority, JSON.stringify(updated.labels), updatedAt, taskId, userId,
        )
        if (Object.hasOwn(taskFields, 'subtasks')) {
          db.prepare('DELETE FROM task_subtasks WHERE task_id = ?').run(taskId)
          insertSubtasks(db, taskId, taskFields.subtasks)
        }
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
      return {
        ...updated,
        subtasks: getSubtasks(db, taskId),
        completed: updated.status === 'done',
        updatedAt,
      }
    },

    async deleteTask(userId, taskId) {
      const result = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(taskId, userId)
      return result.changes > 0
    },
  }
}

const taskFieldsSql = `
  id, user_id AS userId, title, description, category, group_id AS groupId,
  due_date AS dueDate, due_time AS dueTime, completed, status, priority, labels,
  created_at AS createdAt, updated_at AS updatedAt
`
