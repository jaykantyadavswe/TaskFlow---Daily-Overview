import { Router } from 'express'

export function createAuthRoutes(controller, authenticate) {
  const router = Router()
  router.post('/signup', controller.signUp)
  router.post('/signin', controller.signIn)
  router.get('/me', authenticate, controller.currentUser)
  router.post('/logout', authenticate, controller.signOut)
  return router
}
