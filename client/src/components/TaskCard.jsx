const categoryStyles = {
  Design: 'bg-pink-50 text-pink-700',
  Product: 'bg-blue-50 text-blue-700',
  Planning: 'bg-amber-50 text-amber-700',
  Personal: 'bg-emerald-50 text-emerald-700',
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  return (
    <article className={`flex items-start gap-3 rounded-xl border p-4 transition-colors sm:items-center ${
      task.completed
        ? 'border-slate-100 bg-slate-50/70'
        : 'border-slate-100 bg-white hover:border-violet-200 hover:bg-violet-50/20'
    }`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`}
        className="mt-1 size-[18px] shrink-0 cursor-pointer accent-violet-600 sm:mt-0"
      />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${
          task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
        }`}>
          {task.title}
        </p>
        <p className="mt-1 text-xs text-slate-400">{task.due}</p>
      </div>
      <span className={`max-w-24 shrink-0 truncate rounded-full px-2 py-1 text-[11px] font-semibold sm:px-2.5 sm:text-xs ${
        categoryStyles[task.category] ?? 'bg-slate-100 text-slate-600'
      }`}>
        {task.category}
      </span>
      <span className="max-w-24 shrink-0 truncate rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700 sm:px-2.5 sm:text-xs">
        {task.groupName ?? 'Unassigned'}
      </span>
      <div className="flex shrink-0 items-center gap-1">
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
