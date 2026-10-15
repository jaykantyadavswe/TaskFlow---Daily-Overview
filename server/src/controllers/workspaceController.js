export function createWorkspaceController(workspaceService) {
  return {
    getWorkspace: (request, response) => {
      response.json(workspaceService.getWorkspace(request.user.id))
    },

    getGroups: (request, response) => {
      response.json({ groups: workspaceService.getGroups(request.user.id) })
    },

    createGroup: async (request, response) => {
      const group = await workspaceService.createGroup(request.user.id, request.body)
      response.status(201).json({ group })
    },

    getTasks: (request, response) => {
      response.json({ tasks: workspaceService.getTasks(request.user.id) })
    },

    createTask: async (request, response) => {
      const task = await workspaceService.createTask(request.user.id, request.body)
      response.status(201).json({ task })
    },

    updateTask: async (request, response) => {
      const task = await workspaceService.updateTask(request.user.id, request.params.taskId, request.body)
      response.json({ task })
    },

    deleteTask: async (request, response) => {
      await workspaceService.deleteTask(request.user.id, request.params.taskId)
      response.status(204).end()
    },
  }
}
