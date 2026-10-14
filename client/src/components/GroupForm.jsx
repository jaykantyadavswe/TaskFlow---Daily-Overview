import { useEffect, useState } from 'react'

function GroupForm({ onSubmit, onClose }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Enter a group name.')
      return
    }

    if (!type) {
      setError('Choose what kind of group you are creating.')
      return
    }

    if (!onSubmit(trimmedName, type)) {
      setError('A group with this name already exists.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-form-heading"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl shadow-slate-900/20"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="group-form-heading" className="text-xl font-bold text-slate-900">Create a group</h2>
            <p className="mt-1 text-sm text-slate-500">Make a space for a project or area of your life.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close group form"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="group-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Group name
            </label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setError('')
              }}
              placeholder="e.g. Coding, Health, or Learning"
              maxLength={40}
              required
              autoFocus
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
            {error && <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
          </div>

          <div>
            <label htmlFor="group-type" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Group type
            </label>
            <select
              id="group-type"
              value={type}
              onChange={(event) => {
                setType(event.target.value)
                setError('')
              }}
              required
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            >
              <option value="" disabled>Select a group type</option>
              <option value="Coding">Coding & technology</option>
              <option value="Health">Health & fitness</option>
              <option value="Work">Work & projects</option>
              <option value="Study">Study & learning</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>
            <p className="mt-1.5 text-xs text-slate-400">Choose the area this group is for.</p>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200"
            >
              Create group
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default GroupForm
