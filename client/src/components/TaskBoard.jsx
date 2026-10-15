import TaskCard from './TaskCard'

const columns = [
  { id: 'todo', title: 'To do', dot: 'bg-slate-400' },
  { id: 'in_progress', title: 'In progress', dot: 'bg-violet-500' },
  { id: 'done', title: 'Done', dot: 'bg-emerald-500' },
]

function TaskBoard({ tasks, onToggle, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.id)
        return (
          <section key={column.id} aria-labelledby={`board-${column.id}`} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
            <header className="mb-3 flex items-center justify-between px-1 py-1">
              <h3 id={`board-${column.id}`} className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <span className={`size-2 rounded-full ${column.dot}`} />
                {column.title}
              </h3>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                {columnTasks.length}
              </span>
            </header>
            <div className="space-y-2.5">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  compact
                />
              ))}
              {columnTasks.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-3 py-6 text-center text-xs text-slate-400">
                  Tasks moved here will show up.
                </p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default TaskBoard
