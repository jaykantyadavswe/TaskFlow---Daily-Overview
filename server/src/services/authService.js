import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { config } from '../config/config.js'
import { AppError } from '../utils/AppError.js'
import { isValidEmail, isValidName, normalizeEmail } from '../utils/validation.js'

const scrypt = promisify(scryptCallback)

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email }
}

function digestToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

async function passwordHash(password, salt = randomBytes(16).toString('hex')) {
  const derivedKey = await scrypt(password, salt, 64)
  return { salt, hash: derivedKey.toString('hex') }
}

async function passwordMatches(password, user) {
  const { hash } = await passwordHash(password, user.passwordSalt)
  const expectedHash = Buffer.from(user.passwordHash, 'hex')
  const providedHash = Buffer.from(hash, 'hex')
  return expectedHash.length === providedHash.length && timingSafeEqual(expectedHash, providedHash)
}

export function createAuthService(repository) {
  function newSession(userId) {
    const token = randomBytes(32).toString('base64url')
    return {
      token,
      record: {
        tokenHash: digestToken(token),
        userId,
        expiresAt: Date.now() + config.sessionLifetimeMs,
      },
    }
  }

  return {
    async signUp(input) {
      const { name, email, password } = input ?? {}
      if (!isValidName(name) || !isValidEmail(email)) {
        throw new AppError(400, 'Enter a valid name and email address.')
      }
      if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
        throw new AppError(400, 'Password must be between 8 and 128 characters.')
      }
      const normalizedEmail = normalizeEmail(email)
      const { salt, hash } = await passwordHash(password)
      const user = {
        id: randomUUID(),
        name: name.trim(),
        email: normalizedEmail,
        passwordSalt: salt,
        passwordHash: hash,
        createdAt: new Date().toISOString(),
      }
      const session = newSession(user.id)
      await repository.createAccount(user, session.record)
      return { user: publicUser(user), token: session.token }
    },

    async signIn(input) {
      const { email, password } = input ?? {}
      if (!isValidEmail(email) || typeof password !== 'string' || password.length === 0) {
        throw new AppError(400, 'Enter a valid email address and password.')
      }
      const user = repository.findUserByEmail(email)
      if (!user || !(await passwordMatches(password, user))) {
        throw new AppError(401, 'Email or password is incorrect.')
      }
      const session = newSession(user.id)
      await repository.createSession(session.record)
      return { user: publicUser(user), token: session.token }
    },

    authenticate(token) {
      if (typeof token !== 'string' || token.length > 200) return null
      const session = repository.findSessionByHash(digestToken(token))
      if (!session || session.expiresAt <= Date.now()) return null
      const user = repository.findUserById(session.userId)
      return user ? { user, sessionTokenHash: session.tokenHash } : null
    },

    async signOut(tokenHash) {
      await repository.deleteSession(tokenHash)
    },

    async updateProfile(userId, input) {
      const { name, email } = input ?? {}
      if (!isValidName(name) || !isValidEmail(email)) {
        throw new AppError(400, 'Enter a valid name and email address.')
      }
      const user = await repository.updateProfile(userId, name, email)
      return publicUser(user)
    },

    toPublicUser: publicUser,
  }
}
