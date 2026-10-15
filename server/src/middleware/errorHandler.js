import { AppError } from '../utils/AppError.js'

export function errorHandler(error, _request, response, _next) {
  if (error instanceof SyntaxError && 'body' in error) {
    return response.status(400).json({ error: 'Request body must be valid JSON.' })
  }
  if (error.status === 413) {
    return response.status(413).json({ error: 'Request body must be 32 KB or smaller.' })
  }
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ error: error.message })
  }
  console.error('TaskFlow API error:', error)
  return response.status(500).json({ error: 'An unexpected server error occurred.' })
}
