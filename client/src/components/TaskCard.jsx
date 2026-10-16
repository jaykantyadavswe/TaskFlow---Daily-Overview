import React from 'react'

function TaskCard({ task }) {
    const priorityColors = {
        low: 'bg-green-100 text-green-600',
        medium: 'bg-amber-100 text-amber-600',
        high: 'bg-red-100 text-red-600',
    }
    return (
        <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0 bg-white p-5 shadow-sm rounded-2xl">
            <input type="checkbox"
                defaultChecked={task.status === "completed"}
                aria-label={`Mark ${task.title} as ${task.status === "completed" ? "pending" : "completed"}`}
                className="mt-1 h-4 w-4 accent-indigo-500 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />

            <div className="min-w-0 flex-1">
                <p className={`font-medium ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                    {task.title}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                    {task.category} . Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                </p>
            </div>

            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityColors[task.priority] ?? priorityColors.medium}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
        </div>
    )
}

export default TaskCard
