import { AppError } from '../utils/AppError.js'

export function createAuthenticate(authService) {
  return (request, _response, next) => {
    const authorization = request.get('authorization') ?? ''
    const match = /^Bearer ([^\s]+)$/.exec(authorization)
    const session = match ? authService.authenticate(match[1]) : null
    if (!session) return next(new AppError(401, 'Your session is invalid or expired. Please sign in again.'))
    request.user = session.user
    request.sessionTokenHash = session.sessionTokenHash
    return next()
  }
}
