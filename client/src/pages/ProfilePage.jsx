import { useState } from 'react'

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function ProfilePage({ user, onBack, onSave, onLogout, storageError }) {
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name').toString().trim()
    const email = formData.get('email').toString().trim()

    if (!name || !email) {
      setError('Enter your name and a valid email address.')
      return
    }

    if (onSave({ ...user, name, email })) {
      setError('')
      setIsEditing(false)
    } else {
      setError('Your changes could not be saved. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-violet-700"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden="true">
            <path d="m15 18-6-6 6-6M9 12h11" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to workspace
        </button>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
          <div className="bg-gradient-to-r from-violet-700 to-indigo-600 px-6 py-8 text-white sm:px-9">
            <p className="text-sm font-medium text-violet-100">Account</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Your profile</h1>
          </div>

          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-7">
              <div className="grid size-16 place-items-center rounded-full bg-violet-100 text-xl font-bold text-violet-700" aria-hidden="true">
                {getInitials(user.name) || '?'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{user.email}</p>
              </div>
            </div>

            {storageError && <p role="alert" className="mb-5 rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700">{storageError}</p>}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4 py-7">
                <div>
                  <label htmlFor="profile-name" className="mb-1.5 block text-sm font-semibold text-slate-700">Name</label>
                  <input
                    id="profile-name"
                    name="name"
                    type="text"
                    defaultValue={user.name}
                    maxLength={80}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
                {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}
                <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setIsEditing(false)
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                <dl className="grid gap-5 py-7 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Name</dt>
                    <dd className="mt-1.5 text-sm font-semibold text-slate-800">{user.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Email</dt>
                    <dd className="mt-1.5 break-all text-sm font-semibold text-slate-800">{user.email}</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200"
                  >
                    Edit profile
                  </button>
                  <button
                    type="button"
                    onClick={onBack}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back to workspace
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default ProfilePage
