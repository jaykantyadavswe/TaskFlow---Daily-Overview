import { useState } from 'react'

function AuthPage({ mode, onModeChange, onAuthenticate, accountError }) {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSignUp = mode === 'signup'

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email').toString().trim()
    const name = formData.get('name')?.toString().trim()
    const password = formData.get('password').toString()

    if (!email) {
      setError('Enter a valid email address.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      await onAuthenticate({ ...(isSignUp ? { name } : {}), email, password }, mode)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f5fb] px-4 py-8 sm:px-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_32px_100px_-48px_rgba(36,34,78,0.38)] lg:min-h-[660px] lg:grid-cols-[1.02fr_0.98fr]">
        <div className="relative hidden overflow-hidden bg-[#211d43] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -right-24 -top-24 size-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 size-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-28 size-96 rounded-full bg-violet-500/20 blur-3xl" />
          <a href="#dashboard" className="relative inline-flex items-center gap-3" aria-label="TaskFlow home">
            <span className="grid size-11 place-items-center rounded-2xl bg-violet-400 text-white shadow-lg shadow-violet-950/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true">
                <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-xl font-bold tracking-tight">TaskFlow</span>
          </a>

          <div className="relative my-12 max-w-md">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-violet-200">A calmer way to work</p>
            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight xl:text-5xl">
              Make space for your best work.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-indigo-100/75">
              Bring your plans, priorities, and progress together in one thoughtfully organized workspace.
            </p>
            <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/10 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Today’s focus</p>
                  <p className="mt-1 text-[11px] text-indigo-100/60">A little progress goes a long way</p>
                </div>
                <span className="grid size-9 place-items-center rounded-xl bg-violet-300/15 text-violet-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden="true">
                    <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <div className="space-y-2.5">
                {['Plan the week with intention', 'Focus on what matters most', 'Celebrate every small win'].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-2.5">
                    <span className={`grid size-4 place-items-center rounded-full border ${index === 0 ? 'border-violet-300 bg-violet-300 text-[#211d43]' : 'border-white/30'}`}>
                      {index === 0 && <span className="text-[10px] font-bold">✓</span>}
                    </span>
                    <span className={`text-xs ${index === 0 ? 'text-indigo-100/50 line-through' : 'text-indigo-50/90'}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="relative text-xs text-indigo-100/50">Thoughtful planning. Meaningful progress.</p>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
        <div className="w-full max-w-md">
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

        {accountError && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            {accountError}
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
              Password
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
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
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
        <p className="mt-8 text-center text-xs text-slate-400">
          Your workspace stays private to your account.
        </p>
        </div>
        </div>
      </section>
    </main>
  )
}

export default AuthPage
