const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const validGroupTypes = ['Coding', 'Health', 'Work', 'Study', 'Personal', 'Other']
const taskFields = new Set([
  'title',
  'description',
  'category',
  'groupId',
  'dueDate',
  'dueTime',
  'completed',
  'status',
  'priority',
  'labels',
  'subtasks',
])
const validStatuses = ['todo', 'in_progress', 'done']
const validPriorities = ['low', 'medium', 'high', 'urgent']

export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 254 && emailPattern.test(email)
}

export function isValidName(name, maxLength = 80) {
  return typeof name === 'string' && name.trim().length > 0 && name.trim().length <= maxLength
}

function isValidDate(value) {
  if (value === '') return true
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function isValidTime(value) {
  return value === '' || (typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value))
}

export function validateGroupInput(input) {
  return isValidName(input?.name, 40) && validGroupTypes.includes(input?.type)
}

export function validateTaskInput(body, { groups, userId, partial = false, existing = {} }) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Task details must be an object.'
  if (Object.keys(body).some((field) => !taskFields.has(field))) return 'Task contains unsupported fields.'
  if (!partial && (typeof body.title !== 'string' || !body.title.trim())) return 'Task title is required.'
  if (body.title !== undefined && (
    typeof body.title !== 'string'
    || !body.title.trim()
    || body.title.trim().length > 120
  )) {
    return 'Task title must be between 1 and 120 characters.'
  }
  if (body.description !== undefined && (
    typeof body.description !== 'string'
    || body.description.length > 2000
  )) {
    return 'Task description must be 2,000 characters or fewer.'
  }
  if (body.category !== undefined && (typeof body.category !== 'string' || body.category.length > 40)) {
    return 'Task category must be 40 characters or fewer.'
  }
  if (body.status !== undefined && !validStatuses.includes(body.status)) {
    return 'Choose a valid task status.'
  }
  if (body.priority !== undefined && !validPriorities.includes(body.priority)) {
    return 'Choose a valid task priority.'
  }
  if (body.labels !== undefined && (
    !Array.isArray(body.labels)
    || body.labels.length > 10
    || body.labels.some((label) => typeof label !== 'string' || !label.trim() || label.trim().length > 24)
  )) {
    return 'Tasks can have up to 10 labels, each 24 characters or fewer.'
  }
  if (body.subtasks !== undefined && (
    !Array.isArray(body.subtasks)
    || body.subtasks.length > 30
    || body.subtasks.some((subtask) => (
      !subtask
      || typeof subtask !== 'object'
      || Array.isArray(subtask)
      || Object.keys(subtask).some((key) => !['title', 'completed'].includes(key))
      || typeof subtask.title !== 'string'
      || !subtask.title.trim()
      || subtask.title.trim().length > 160
      || (subtask.completed !== undefined && typeof subtask.completed !== 'boolean')
    ))
  )) {
    return 'Add up to 30 subtasks with titles of 160 characters or fewer.'
  }

  const groupId = body.groupId ?? existing.groupId
  if ((!partial && typeof groupId !== 'string')
    || (body.groupId !== undefined && (
      typeof groupId !== 'string'
      || !groups.some((group) => group.id === groupId && group.userId === userId)
    ))) {
    return 'Choose a group in your workspace.'
  }
  if (body.dueDate !== undefined && !isValidDate(body.dueDate)) return 'Due date must be a valid date.'
  if (body.dueTime !== undefined && !isValidTime(body.dueTime)) return 'Due time must use 24-hour HH:MM format.'
  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    return 'Task completion must be true or false.'
  }
  const dueDate = body.dueDate ?? existing.dueDate ?? ''
  if ((body.dueTime ?? existing.dueTime) && !dueDate) return 'A due time requires a due date.'
  const completed = body.completed ?? existing.completed
  if (body.completed !== undefined && body.status !== undefined && body.completed !== (body.status === 'done')) {
    return 'Task completion and status must match.'
  }
  if (!partial && completed !== undefined && body.status !== undefined && completed !== (body.status === 'done')) {
    return 'Task completion and status must match.'
  }
  return ''
}

export function pickTaskFields(body) {
  const fields = {}
  for (const field of taskFields) {
    if (Object.hasOwn(body, field)) fields[field] = body[field]
  }
  return fields
}
