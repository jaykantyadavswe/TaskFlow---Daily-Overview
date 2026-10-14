import { useState } from 'react'

function AuthPage({ mode, onModeChange, onAuthenticate, storageError }) {
  const [error, setError] = useState('')
  const isSignUp = mode === 'signup'

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email').toString().trim()
    const name = formData.get('name')?.toString().trim()

    if (!email) {
      setError('Enter a valid email address.')
      return
    }

    onAuthenticate({
      name: name || email.split('@')[0],
      email,
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
        <a href="#dashboard" className="mb-8 inline-flex items-center gap-3" aria-label="TaskFlow">
          <span className="grid size-11 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true">
              <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">TaskFlow</span>
        </a>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isSignUp ? 'Set up your profile to get started.' : 'Sign in to continue to your workspace.'}
        </p>

        <div role="note" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-800">
          Demo mode: any valid email can continue. Passwords are not checked, sent, or stored.
        </div>
        {storageError && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            {storageError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isSignUp && (
            <div>
              <label htmlFor="auth-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Full name
              </label>
              <input
                id="auth-name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={80}
                required
                placeholder="Your name"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email address
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Password <span className="font-normal text-slate-400">(demo only)</span>
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={8}
              required
              placeholder="At least 8 characters"
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}

          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200"
          >
            {isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setError('')
              onModeChange(isSignUp ? 'signin' : 'signup')
            }}
            className="font-semibold text-violet-700 hover:text-violet-800"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </section>
    </main>
  )
}

export default AuthPage
