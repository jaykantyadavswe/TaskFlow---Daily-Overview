import { AppError } from '../utils/AppError.js'
import { pickTaskFields, validateGroupInput, validateTaskInput } from '../utils/validation.js'

export function createWorkspaceService(repository) {
  return {
    getWorkspace(userId) {
      return repository.getWorkspace(userId)
    },

    getGroups(userId) {
      return repository.getWorkspace(userId).groups
    },

    async createGroup(userId, input) {
      if (!validateGroupInput(input)) {
        throw new AppError(400, 'Enter a group name and choose a valid group type.')
      }
      return repository.createGroup(userId, input.name, input.type)
    },

    getTasks(userId) {
      return repository.getWorkspace(userId).tasks
    },

    async createTask(userId, input) {
      const workspace = repository.getWorkspace(userId)
      const validationError = validateTaskInput(input, { groups: workspace.groups, userId })
      if (validationError) throw new AppError(400, validationError)
      return repository.createTask(userId, pickTaskFields(input))
    },

    async updateTask(userId, taskId, input) {
      const workspace = repository.getWorkspace(userId)
      const task = workspace.tasks.find((item) => item.id === taskId)
      if (!task) throw new AppError(404, 'Task not found.')
      const validationError = validateTaskInput(input, {
        groups: workspace.groups,
        userId,
        partial: true,
        existing: task,
      })
      if (validationError) throw new AppError(400, validationError)
      return repository.updateTask(userId, taskId, pickTaskFields(input))
    },

    async deleteTask(userId, taskId) {
      const deleted = await repository.deleteTask(userId, taskId)
      if (!deleted) throw new AppError(404, 'Task not found.')
    },
  }
}
