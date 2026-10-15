import { useEffect, useState } from 'react'

function TaskForm({ initialTask, groups, defaultGroupId, onSubmit, onClose }) {
  const [title, setTitle] = useState(() => initialTask?.title ?? '')
  const [description, setDescription] = useState(() => initialTask?.description ?? '')
  const [category, setCategory] = useState(() => initialTask?.category ?? 'Personal')
  const [groupId, setGroupId] = useState(() => initialTask?.groupId ?? defaultGroupId ?? groups[0]?.id ?? '')
  const [dueDate, setDueDate] = useState(() => initialTask?.dueDate ?? '')
  const [dueTime, setDueTime] = useState(() => initialTask?.dueTime ?? '')
  const [status, setStatus] = useState(() => initialTask?.status ?? (initialTask?.completed ? 'done' : 'todo'))
  const [priority, setPriority] = useState(() => initialTask?.priority ?? 'medium')
  const [labels, setLabels] = useState(() => (initialTask?.labels ?? []).join(', '))
  const [subtasks, setSubtasks] = useState(() => initialTask?.subtasks ?? [])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError('Enter a task name to continue.')
      return
    }
    const normalizedLabels = [...new Set(labels.split(',').map((label) => label.trim()).filter(Boolean))]
    if (normalizedLabels.length > 10 || normalizedLabels.some((label) => label.length > 24)) {
      setError('Add up to 10 labels, each no longer than 24 characters.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim(),
        category,
        groupId,
        dueDate,
        dueTime,
        status,
        completed: status === 'done',
        priority,
        labels: normalizedLabels,
        subtasks: subtasks
          .filter((subtask) => subtask.title.trim())
          .map((subtask) => ({ title: subtask.title.trim(), completed: subtask.completed })),
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
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
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
        aria-labelledby="task-form-heading"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl shadow-slate-900/20 sm:p-7"
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
            <label htmlFor="task-description" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a little more context..."
              maxLength={2000}
              rows={3}
              className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
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
              <label htmlFor="task-status" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label htmlFor="task-priority" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-due-date" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Due date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => {
                  setDueDate(event.target.value)
                  if (!event.target.value) setDueTime('')
                }}
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
              <option>Engineering</option>
              <option>Marketing</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-labels" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Labels <span className="font-normal text-slate-400">(comma separated)</span>
            </label>
            <input
              id="task-labels"
              type="text"
              value={labels}
              onChange={(event) => setLabels(event.target.value)}
              placeholder="e.g. launch, research"
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-1.5 flex w-full items-center justify-between text-sm font-semibold text-slate-700">
              <span>Subtasks <span className="font-normal text-slate-400">({subtasks.length}/30)</span></span>
              <button
                type="button"
                disabled={subtasks.length >= 30}
                onClick={() => setSubtasks((current) => [...current, { title: '', completed: false }])}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                + Add subtask
              </button>
            </legend>
            {subtasks.map((subtask, index) => (
              <div key={subtask.id ?? index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={(event) => setSubtasks((current) => current.map((item, itemIndex) => (
                    itemIndex === index ? { ...item, completed: event.target.checked } : item
                  )))}
                  aria-label={`Mark subtask ${index + 1} complete`}
                  className="size-4 shrink-0 accent-violet-600"
                />
                <input
                  type="text"
                  value={subtask.title}
                  maxLength={160}
                  placeholder={`Subtask ${index + 1}`}
                  onChange={(event) => setSubtasks((current) => current.map((item, itemIndex) => (
                    itemIndex === index ? { ...item, title: event.target.value } : item
                  )))}
                  className={`h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100 ${
                    subtask.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setSubtasks((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  aria-label={`Remove subtask ${index + 1}`}
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            ))}
            {subtasks.length === 0 && <p className="text-xs text-slate-400">Break larger tasks into smaller steps.</p>}
          </fieldset>

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
              disabled={isSubmitting}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default TaskForm
