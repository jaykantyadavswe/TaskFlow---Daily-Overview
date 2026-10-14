import { useEffect, useState } from 'react'

function TaskForm({ initialTask, groups, defaultGroupId, onSubmit, onClose }) {
  const [title, setTitle] = useState(() => initialTask?.title ?? '')
  const [category, setCategory] = useState(() => initialTask?.category ?? 'Personal')
  const [groupId, setGroupId] = useState(() => initialTask?.groupId ?? defaultGroupId ?? groups[0]?.id ?? '')
  const [dueDate, setDueDate] = useState(() => initialTask?.dueDate ?? '')
  const [dueTime, setDueTime] = useState(() => initialTask?.dueTime ?? '')
  const [error, setError] = useState('')
  const isEditing = Boolean(initialTask)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError('Enter a task name to continue.')
      return
    }

    onSubmit({
      title: trimmedTitle,
      category,
      groupId,
      dueDate,
      dueTime,
      due: dueDate
        ? `Due ${new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
          }).format(new Date(`${dueDate}T00:00:00`))}${dueTime
            ? ` · ${new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              }).format(new Date(`${dueDate}T${dueTime}:00`))}`
            : ''}`
        : 'No due date',
    })
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
        aria-labelledby="task-form-heading"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl shadow-slate-900/20"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="task-form-heading" className="text-xl font-bold text-slate-900">
              {isEditing ? 'Edit task' : 'Add a task'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing ? 'Update the task details below.' : 'Add something you want to get done.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Task name
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                setError('')
              }}
              placeholder="What needs to get done?"
              maxLength={120}
              required
              autoFocus
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
            {error && <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
          </div>

          <div>
            <label htmlFor="task-group" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Group
            </label>
            <select
              id="task-group"
              value={groupId}
              onChange={(event) => setGroupId(event.target.value)}
              required
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-category" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Category
              </label>
              <select
                id="task-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              >
                <option>Personal</option>
                <option>Design</option>
                <option>Product</option>
                <option>Planning</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-due-date" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Due date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </div>
            <div>
              <label htmlFor="task-due-time" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Due time <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="task-due-time"
                type="time"
                value={dueTime}
                onChange={(event) => setDueTime(event.target.value)}
                disabled={!dueDate}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
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
              {isEditing ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default TaskForm
