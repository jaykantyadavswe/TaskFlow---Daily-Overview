import { Router } from 'express'

export function createWorkspaceRoutes(controller, authenticate) {
  const router = Router()
  router.use(authenticate)
  router.get('/workspace', controller.getWorkspace)
  router.get('/groups', controller.getGroups)
  router.post('/groups', controller.createGroup)
  router.get('/tasks', controller.getTasks)
  router.post('/tasks', controller.createTask)
  router.patch('/tasks/:taskId', controller.updateTask)
  router.delete('/tasks/:taskId', controller.deleteTask)
  return router
}
