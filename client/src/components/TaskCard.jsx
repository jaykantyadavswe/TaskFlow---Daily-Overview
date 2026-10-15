const categoryStyles = {
  Design: 'bg-pink-50 text-pink-700',
  Product: 'bg-blue-50 text-blue-700',
  Planning: 'bg-amber-50 text-amber-700',
  Personal: 'bg-emerald-50 text-emerald-700',
}

const priorityStyles = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-amber-50 text-amber-700',
  urgent: 'bg-rose-50 text-rose-700',
}

const statusLabels = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
}

function TaskCard({ task, onToggle, onEdit, onDelete, onStatusChange, compact = false }) {
  return (
    <article className={`task-card flex items-start gap-3 rounded-xl border p-4 transition-all sm:items-center ${
      task.completed
        ? 'border-slate-100 bg-slate-50/70'
        : 'border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md hover:shadow-slate-200/50'
    }`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`}
        className="mt-1 size-[18px] shrink-0 cursor-pointer accent-violet-600 sm:mt-0"
      />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${compact ? 'line-clamp-2' : 'truncate'} ${
          task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
        }`}>
          {task.title}
        </p>
        {task.description && !compact && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{task.description}</p>
        )}
        <p className="mt-1.5 text-xs text-slate-400">{task.due}</p>
        {task.subtasks?.length > 0 && (
          <p className="mt-1 text-[11px] font-medium text-slate-400">
            {task.subtasks.filter((subtask) => subtask.completed).length}/{task.subtasks.length} steps complete
          </p>
        )}
        {task.labels?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.labels.map((label) => (
              <span key={label} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
      <span className={`max-w-24 shrink-0 truncate rounded-full px-2 py-1 text-[11px] font-semibold sm:px-2.5 sm:text-xs ${
        categoryStyles[task.category] ?? 'bg-slate-100 text-slate-600'
      }`}>{task.category}</span>
      <div className="hidden shrink-0 flex-col items-start gap-1.5 sm:flex">
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${priorityStyles[task.priority] ?? priorityStyles.medium}`}>
          {task.priority ?? 'medium'}
        </span>
        {!compact && (
          <span className="max-w-24 truncate rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">
            {task.groupName ?? 'Unassigned'}
          </span>
        )}
      </div>
      {onStatusChange && (
        <label className="sr-only" htmlFor={`task-status-${task.id}`}>Status for {task.title}</label>
      )}
      {onStatusChange && (
        <select
          id={`task-status-${task.id}`}
          value={task.status ?? (task.completed ? 'done' : 'todo')}
          onChange={(event) => onStatusChange(task.id, event.target.value)}
          aria-label={`Status for ${task.title}`}
          className="hidden max-w-28 shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 sm:block"
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      )}
      <div className={`flex shrink-0 items-center gap-1 ${compact ? 'flex-col sm:flex-row' : ''}`}>
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
          className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-[18px]" aria-hidden="true">
            <path d="m14 5 5 5M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Delete ${task.title}`}
          className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-[18px]" aria-hidden="true">
            <path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </article>
  )
}

export default TaskCard
