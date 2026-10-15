export function createAuthController(authService) {
  return {
    signUp: async (request, response) => {
      const result = await authService.signUp(request.body)
      response.status(201).json(result)
    },

    signIn: async (request, response) => {
      response.json(await authService.signIn(request.body))
    },

    currentUser: (request, response) => {
      response.json({ user: authService.toPublicUser(request.user) })
    },

    signOut: async (request, response) => {
      await authService.signOut(request.sessionTokenHash)
      response.status(204).end()
    },

    updateProfile: async (request, response) => {
      const user = await authService.updateProfile(request.user.id, request.body)
      response.json({ user })
    },
  }
}
