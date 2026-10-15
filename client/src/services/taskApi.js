const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function request(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers)
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, { ...options, headers })
  } catch (cause) {
    throw new Error('Could not connect to TaskFlow. Check that the server is running and try again.', { cause })
  }

  if (response.status === 204) return null
  const responseBody = await response.text()
  let result
  try {
    result = JSON.parse(responseBody)
  } catch (cause) {
    const statusDescription = `${response.status}${response.statusText ? ` ${response.statusText}` : ''}`
    const message = response.ok
      ? `TaskFlow returned an invalid response (${statusDescription}).`
      : `TaskFlow returned ${statusDescription} without a readable error message.`
    throw new Error(message, { cause })
  }

  if (!response.ok) {
    if (response.status === 502 || response.status === 503) {
      const error = new Error('TaskFlow API is unavailable. Start it from the server folder with `npm run dev`, then try again.')
      error.status = response.status
      throw error
    }
    const fallbackMessage = `TaskFlow returned ${response.status}${response.statusText ? ` ${response.statusText}` : ''} without an error message.`
    const error = new Error(typeof result.error === 'string' ? result.error : fallbackMessage)
    error.status = response.status
    throw error
  }
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('TaskFlow returned an invalid response.')
  }
  return result
}

export const taskApi = {
  signUp: (details) => request('/auth/signup', { method: 'POST', body: JSON.stringify(details) }),
  signIn: (details) => request('/auth/signin', { method: 'POST', body: JSON.stringify(details) }),
  currentUser: (token) => request('/auth/me', { token }),
  logout: (token) => request('/auth/logout', { token, method: 'POST' }),
  updateProfile: (token, profile) => request('/profile', {
    token,
    method: 'PATCH',
    body: JSON.stringify(profile),
  }),
  getWorkspace: (token) => request('/workspace', { token }),
  createGroup: (token, group) => request('/groups', {
    token,
    method: 'POST',
    body: JSON.stringify(group),
  }),
  createTask: (token, task) => request('/tasks', {
    token,
    method: 'POST',
    body: JSON.stringify(task),
  }),
  updateTask: (token, taskId, task) => request(`/tasks/${encodeURIComponent(taskId)}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(task),
  }),
  deleteTask: (token, taskId) => request(`/tasks/${encodeURIComponent(taskId)}`, {
    token,
    method: 'DELETE',
  }),
}