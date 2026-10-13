import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import Navbar from '../layout/Navbar'

function toLocalDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const todayDate = toLocalDateString(new Date())
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
const tomorrowDate = toLocalDateString(tomorrow)

const initialTasks = [
  { id: 1, title: 'Finalize the new dashboard design', category: 'Design', due: 'Today · 10:30 AM', dueDate: todayDate, dueTime: '10:30', completed: false },
  { id: 2, title: 'Review Q4 product roadmap', category: 'Product', due: 'Today · 12:00 PM', dueDate: todayDate, dueTime: '12:00', completed: false },
  { id: 3, title: 'Share project update with the team', category: 'Planning', due: 'Today · 2:00 PM', dueDate: todayDate, dueTime: '14:00', completed: true },
  { id: 4, title: 'Prepare notes for the weekly sync', category: 'Planning', due: 'Today · 4:30 PM', dueDate: todayDate, dueTime: '16:30', completed: false },
  { id: 5, title: 'Organize inspiration board', category: 'Personal', due: 'Tomorrow', dueDate: tomorrowDate, completed: true },
]

const viewTitles = {
  overview: 'Today’s overview',
  tasks: 'My tasks',
  completed: 'Completed tasks',
}

function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeView, setActiveView] = useState('overview')
  const [search, setSearch] = useState('')
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  useEffect(() => {
    const timerId = window.setInterval(() => setCurrentTime(new Date()), 30_000)
    return () => window.clearInterval(timerId)
  }, [])

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(currentTime)

  const completedCount = tasks.filter((task) => task.completed).length
  const activeCount = tasks.length - completedCount
  const overdueCount = tasks.filter(
    (task) => {
      if (task.completed || !task.dueDate) return false
      const endOfDueDate = task.dueTime
        ? `${task.dueDate}T${task.dueTime}:00`
        : `${task.dueDate}T23:59:59`
      return new Date(endOfDueDate).getTime() < currentTime.getTime()
    },
  ).length
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100)
  const activeProgress = tasks.length === 0 ? 0 : Math.round((activeCount / tasks.length) * 100)
  const overdueProgress = tasks.length === 0 ? 0 : Math.round((overdueCount / tasks.length) * 100)
  const visibleTasks = tasks.filter((task) => {
    const matchesView =
      activeView === 'completed'
        ? task.completed
        : activeView === 'tasks'
          ? !task.completed
          : true
    const matchesSearch = task.title.toLowerCase().includes(search.trim().toLowerCase())
    return matchesView && matchesSearch
  })

  function toggleTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  function addTask(taskDetails) {
    setTasks((currentTasks) => [
      { id: crypto.randomUUID(), ...taskDetails, completed: false },
      ...currentTasks,
    ])
    setActiveView('tasks')
    setSearch('')
    setIsTaskFormOpen(false)
  }

  return (
    <div id="dashboard" className="flex min-h-screen bg-slate-50">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        completedCount={completedCount}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          search={search}
          onSearchChange={setSearch}
          onAddTask={() => setIsTaskFormOpen(true)}
        />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-8 sm:py-10">
          {/* <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-violet-600">{today}</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {viewTitles[activeView]}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                A clear plan makes for a calmer, more productive day.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500" />
              Your workspace is up to date
            </span>
          </section> */}

          <section aria-label="Task summary" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Total tasks</p>
                <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-[18px]" aria-hidden="true">
                    <path d="M8 6h12M8 12h12M8 18h12" strokeLinecap="round" />
                    <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeLinecap="round" strokeWidth="3" />
                  </svg>
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{tasks.length}</p>
              <p className="mt-1 text-xs text-slate-400">Across your workspace</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">In progress</p>
                <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-[18px]" aria-hidden="true">
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7v5l3.2 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{activeCount}</p>
              <p className="mt-1 text-xs text-slate-400">Ready for you to tackle</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Completed</p>
                <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-[18px]" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{completedCount}</p>
              <p className="mt-1 text-xs text-slate-400">Nice work, keep it up</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Overdue</p>
                <span className="grid size-9 place-items-center rounded-xl bg-rose-50 text-rose-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-[18px]" aria-hidden="true">
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16.5 4.5 19 2" strokeLinecap="round" />
                  </svg>
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{overdueCount}</p>
              <p className="mt-1 text-xs text-slate-400">Past their due date or time</p>
            </article>
          </section>

          <section aria-labelledby="progress-heading" className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 p-5 text-white shadow-lg shadow-violet-200/60 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-violet-100">Your daily progress</p>
                <h2 id="progress-heading" className="mt-1 text-xl font-bold tracking-tight">
                  You’re making great progress
                </h2>
              </div>
              <p className="text-3xl font-bold tracking-tight">{progress}%</p>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-violet-100">
                  <span>Completed tasks · {completedCount} of {tasks.length}</span>
                  <span>{progress}%</span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full bg-white/20"
                  role="progressbar"
                  aria-label="Completed tasks"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <div
                    className="h-full rounded-full bg-white transition-[width] duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-violet-100">
                  <span>Active tasks · {activeCount} of {tasks.length}</span>
                  <span>{activeProgress}%</span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full bg-white/20"
                  role="progressbar"
                  aria-label="Active tasks"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={activeProgress}
                >
                  <div
                    className="h-full rounded-full bg-amber-300 transition-[width] duration-500 ease-out"
                    style={{ width: `${activeProgress}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-violet-100">
                  <span>Overdue tasks · {overdueCount} of {tasks.length}</span>
                  <span>{overdueProgress}%</span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full bg-white/20"
                  role="progressbar"
                  aria-label="Overdue tasks"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={overdueProgress}
                >
                  <div
                    className="h-full rounded-full bg-rose-300 transition-[width] duration-500 ease-out"
                    style={{ width: `${overdueProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="task-list-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="task-list-heading" className="text-lg font-bold text-slate-900">
                  {viewTitles[activeView]}
                  <span className="ml-2 text-sm font-semibold text-slate-500">{today}</span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {activeView === 'completed' ? 'A look at what you’ve accomplished.' : 'Keep your priorities moving forward.'}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <TaskList
              tasks={visibleTasks}
              onToggle={toggleTask}
              emptyMessage={search ? 'No tasks match your search.' : 'Nothing to show here yet.'}
            />
          </section>
        </main>
      </div>
      {isTaskFormOpen && (
        <TaskForm
          onSubmit={addTask}
          onClose={() => setIsTaskFormOpen(false)}
        />
      )}
    </div>
  )
}

export default Dashboard
