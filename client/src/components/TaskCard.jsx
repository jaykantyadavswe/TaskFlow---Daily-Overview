const categoryStyles = {
  Design: 'bg-pink-50 text-pink-700',
  Product: 'bg-blue-50 text-blue-700',
  Planning: 'bg-amber-50 text-amber-700',
  Personal: 'bg-emerald-50 text-emerald-700',
}

function TaskCard({ task, onToggle }) {
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
      <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${
        categoryStyles[task.category] ?? 'bg-slate-100 text-slate-600'
      }`}>
        {task.category}
      </span>
    </article>
  )
}

export default TaskCard
