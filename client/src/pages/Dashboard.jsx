import { useEffect, useState } from 'react'
import GroupForm from '../components/GroupForm'
import Sidebar from '../components/Sidebar'
import TaskBoard from '../components/TaskBoard'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import Navbar from '../layout/Navbar'
import { taskApi } from '../services/taskApi'

function toLocalDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const viewTitles = {
  overview: 'Today’s overview',
  tasks: 'All tasks',
  completed: 'Completed tasks',
  group: 'Group tasks',
}

function toDateKey(date) {
  return toLocalDateString(date)
}

function getScheduleLabel(task, currentTime) {
  const todayDate = toLocalDateString(currentTime)
  if (!task.dueDate) return 'No due date'
  if (!task.completed && (
    task.dueDate < todayDate
    || (task.dueDate === todayDate
      && task.dueTime
      && new Date(`${task.dueDate}T${task.dueTime}:00`) < currentTime)
  )) return 'Overdue'
  if (task.dueDate === todayDate) return 'Today'

  const tomorrow = new Date(`${todayDate}T00:00:00`)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (task.dueDate === toDateKey(tomorrow)) return 'Tomorrow'

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${task.dueDate}T00:00:00`))
}

function getTaskDueLabel(task, currentTime) {
  const dateLabel = getScheduleLabel(task, currentTime)
  if (!task.dueTime) return dateLabel

  const timeLabel = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(`2000-01-01T${task.dueTime}:00`))
  return `${dateLabel} · ${timeLabel}`
}

function Dashboard({ user, token, onProfile, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [groups, setGroups] = useState([])
  const [workspaceLoading, setWorkspaceLoading] = useState(true)
  const [workspaceError, setWorkspaceError] = useState('')
  const [activeView, setActiveView] = useState('overview')
  const [viewMode, setViewMode] = useState('list')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [activeGroupId, setActiveGroupId] = useState('')
  const [search, setSearch] = useState('')
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false)
  const [defaultGroupId, setDefaultGroupId] = useState('')
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  useEffect(() => {
    const timerId = window.setInterval(() => setCurrentTime(new Date()), 30_000)
    return () => window.clearInterval(timerId)
  }, [])

  useEffect(() => {
    let isMounted = true
    taskApi.getWorkspace(token)
      .then((workspace) => {
        if (!isMounted) return
        setTasks(workspace.tasks)
        setGroups(workspace.groups)
        setWorkspaceError('')
      })
      .catch((error) => {
        if (isMounted) setWorkspaceError(error.message)
      })
      .finally(() => {
        if (isMounted) setWorkspaceLoading(false)
      })
    return () => { isMounted = false }
  }, [token])

  async function runWorkspaceMutation(mutation) {
    try {
      await mutation()
      setWorkspaceError('')
    } catch (error) {
      setWorkspaceError(error.message)
    }
  }

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
  const searchTerm = search.trim().toLowerCase()
  const getGroup = (groupId) => groups.find((group) => group.id === groupId)
  const getGroupName = (groupId) => getGroup(groupId)?.name ?? 'Unassigned'
  const matchesSearch = (task) => (
    `${task.title} ${task.description ?? ''} ${task.category} ${task.priority ?? ''} ${(task.labels ?? []).join(' ')} ${getGroupName(task.groupId)} ${getGroup(task.groupId)?.type ?? ''}`
      .toLowerCase()
      .includes(searchTerm)
  )
  const visibleTasks = tasks.filter((task) => {
    const matchesView =
      activeView === 'group'
        ? task.groupId === activeGroupId
        : activeView === 'completed'
        ? task.completed
        : activeView === 'tasks'
          ? true
          : true
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    return matchesView && matchesSearch(task) && matchesStatus && matchesPriority
  }).map((task) => ({
    ...task,
    groupName: getGroupName(task.groupId),
    groupType: getGroup(task.groupId)?.type ?? 'Other',
    due: getTaskDueLabel(task, currentTime),
  }))
  const groupsWithTasks = groups.map((group) => {
    const groupTasks = tasks
      .filter((task) => (
        task.groupId === group.id
        && matchesSearch(task)
        && (statusFilter === 'all' || task.status === statusFilter)
        && (priorityFilter === 'all' || task.priority === priorityFilter)
      ))
      .map((task) => ({
        ...task,
        groupName: group.name,
        groupType: group.type,
        due: getTaskDueLabel(task, currentTime),
      }))
      .sort((first, second) => {
        const firstDate = first.dueDate || '9999-12-31'
        const secondDate = second.dueDate || '9999-12-31'
        return firstDate.localeCompare(secondDate)
          || (first.dueTime || '99:99').localeCompare(second.dueTime || '99:99')
      })
    const scheduleSections = groupTasks.reduce((sections, task) => {
      const label = getScheduleLabel(task, currentTime)
      const section = sections.find((item) => item.title === label)
      if (section) section.tasks.push(task)
      else sections.push({ title: label, tasks: [task] })
      return sections
    }, [])

    return {
      ...group,
      tasks: groupTasks,
      activeCount: groupTasks.filter((task) => !task.completed).length,
      scheduleSections,
    }
  })
  const selectedGroup = groupsWithTasks.find((group) => group.id === activeGroupId)
  const groupTaskCounts = Object.fromEntries(
    groups.map((group) => [group.id, tasks.filter((task) => task.groupId === group.id).length]),
  )

  function navigateToView(view) {
    setActiveGroupId('')
    setActiveView(view)
    setStatusFilter('all')
    setPriorityFilter('all')
  }

  function navigateToGroup(groupId) {
    setActiveGroupId(groupId)
    setActiveView('group')
    setStatusFilter('all')
    setPriorityFilter('all')
  }

  function toggleTask(taskId) {
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return
    runWorkspaceMutation(async () => {
      const { task: updatedTask } = await taskApi.updateTask(token, taskId, { completed: !task.completed })
      setTasks((currentTasks) => currentTasks.map((item) => item.id === taskId ? updatedTask : item))
    })
  }

  function changeTaskStatus(taskId, status) {
    runWorkspaceMutation(async () => {
      const { task: updatedTask } = await taskApi.updateTask(token, taskId, {
        status,
        completed: status === 'done',
      })
      setTasks((currentTasks) => currentTasks.map((task) => task.id === taskId ? updatedTask : task))
    })
  }

  async function addTask(taskDetails) {
    try {
      const taskPayload = { ...taskDetails }
      delete taskPayload.due
      const { task } = await taskApi.createTask(token, taskPayload)
      setTasks((currentTasks) => [task, ...currentTasks])
      setSearch('')
      setIsTaskFormOpen(false)
      setWorkspaceError('')
    } catch (error) {
      setWorkspaceError(error.message)
      throw error
    }
  }

  async function saveTask(taskDetails) {
    if (editingTask) {
      try {
        const taskPayload = { ...taskDetails }
        delete taskPayload.due
        const { task } = await taskApi.updateTask(token, editingTask.id, taskPayload)
        setTasks((currentTasks) => currentTasks.map((item) => item.id === editingTask.id ? task : item))
        setEditingTask(null)
        setIsTaskFormOpen(false)
        setWorkspaceError('')
      } catch (error) {
        setWorkspaceError(error.message)
        throw error
      }
      return
    }

    await addTask(taskDetails)
  }

  function openAddTask(groupId = '') {
    setEditingTask(null)
    setDefaultGroupId(groupId || groups[0]?.id || '')
    setIsTaskFormOpen(true)
  }

  function openEditTask(task) {
    setEditingTask(task)
    setDefaultGroupId(task.groupId)
    setIsTaskFormOpen(true)
  }

  function closeTaskForm() {
    setIsTaskFormOpen(false)
    setEditingTask(null)
  }

  async function createGroup(name, type) {
    const { group } = await taskApi.createGroup(token, { name, type })
    setGroups((currentGroups) => [...currentGroups, group])
    setDefaultGroupId(group.id)
    setIsGroupFormOpen(false)
    navigateToGroup(group.id)
  }

  function confirmDeleteTask() {
    runWorkspaceMutation(async () => {
      await taskApi.deleteTask(token, deletingTask.id)
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== deletingTask.id))
      setDeletingTask(null)
    })
  }

  if (workspaceLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f7fb] text-sm font-medium text-slate-500">
        Loading your workspace…
      </main>
    )
  }

  return (
    <div id="dashboard" className="flex min-h-screen bg-[#f6f7fb]">
      <Sidebar
        activeView={activeView}
        activeGroupId={activeGroupId}
        groups={groups}
        groupTaskCounts={groupTaskCounts}
        onNavigate={navigateToView}
        onNavigateGroup={navigateToGroup}
        onAddGroup={() => setIsGroupFormOpen(true)}
        completedCount={completedCount}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          search={search}
          onSearchChange={setSearch}
          onAddTask={() => openAddTask()}
          user={user}
          onProfile={onProfile}
          onLogout={onLogout}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-9">
          {workspaceError && (
            <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {workspaceError}
            </p>
          )}
          <section className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-violet-700">{today}</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {activeView === 'group' ? selectedGroup?.name ?? viewTitles.group : viewTitles[activeView]}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {activeView === 'overview'
                  ? 'A clear plan makes for a calmer, more productive day.'
                  : activeView === 'completed'
                    ? 'Look back at the progress you’ve made.'
                    : 'Keep your priorities moving forward.'}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-200/40">
              <span className="size-2 rounded-full bg-emerald-500" />
              Your workspace
            </span>
          </section>

          <section aria-label="Task summary" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition-all hover:-translate-y-0.5 hover:shadow-md">
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

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition-all hover:-translate-y-0.5 hover:shadow-md">
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

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition-all hover:-translate-y-0.5 hover:shadow-md">
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

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition-all hover:-translate-y-0.5 hover:shadow-md">
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

          <section aria-labelledby="progress-heading" className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#312e81] via-violet-700 to-[#6d5ce7] p-5 text-white shadow-lg shadow-violet-200/60 sm:p-7">
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

          <section aria-labelledby="task-list-heading" className={activeView === 'overview' ? '' : 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6'}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="task-list-heading" className="text-lg font-bold text-slate-900">
                  {activeView === 'group' ? selectedGroup?.name ?? 'Group tasks' : viewTitles[activeView]}
                  <span className="ml-2 text-sm font-semibold text-slate-500">{today}</span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {activeView === 'overview'
                    ? 'Your tasks are organized by group, then scheduled automatically by day and time.'
                    : activeView === 'group'
                      ? `${selectedGroup?.type ?? 'Group'} group · Tasks sorted by schedule.`
                    : activeView === 'completed'
                      ? 'A look at what you’ve accomplished.'
                      : 'Keep your priorities moving forward.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(activeView === 'overview' || activeView === 'group') && (
                  <button
                    type="button"
                    onClick={activeView === 'group'
                      ? () => openAddTask(activeGroupId)
                      : () => setIsGroupFormOpen(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100"
                  >
                    {activeView === 'overview' ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden="true">
                          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h3l2 2h6A2.5 2.5 0 0 1 20 9.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" strokeLinejoin="round" />
                          <path d="M12 10v6m-3-3h6" strokeLinecap="round" />
                        </svg>
                        Add group
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                        </svg>
                        Add task
                      </>
                    )}
                  </button>
                )}
                {activeView === 'tasks' && (
                  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1" aria-label="Task display mode">
                    {['list', 'board'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        aria-pressed={viewMode === mode}
                        onClick={() => setViewMode(mode)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                          viewMode === mode ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                )}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
            </div>
            {(activeView === 'tasks' || activeView === 'group') && (
              <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
                <label className="sr-only" htmlFor="task-status-filter">Filter by status</label>
                <select
                  id="task-status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="all">All statuses</option>
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
                <label className="sr-only" htmlFor="task-priority-filter">Filter by priority</label>
                <select
                  id="task-priority-filter"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="all">All priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <span className="ml-auto text-xs text-slate-400">
                  {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'} shown
                </span>
              </div>
            )}
            {activeView === 'overview' ? (
              <div className="grid items-start gap-4 xl:grid-cols-2">
                {groupsWithTasks.map((group) => (
                  <section key={group.id} aria-label={`${group.name} group`} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-slate-900">{group.name}</h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {group.type} · {group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'} · {group.activeCount} active
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAddTask(group.id)}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-violet-50 px-3 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 focus:outline-none focus:ring-4 focus:ring-violet-100"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                        </svg>
                        Add task
                      </button>
                    </div>
                    {group.scheduleSections.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-7 text-center text-sm text-slate-500">
                        {search ? 'No tasks match your search.' : `No tasks in ${group.name} yet. Add one to get started.`}
                      </p>
                    ) : (
                      <div className="space-y-5">
                        {group.scheduleSections.map((section) => (
                          <section key={`${group.id}-${section.title}`} aria-label={`${group.name} tasks: ${section.title}`}>
                            <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                              <span className={`size-2 rounded-full ${section.title === 'Overdue' ? 'bg-rose-500' : section.title === 'Today' ? 'bg-violet-500' : 'bg-slate-300'}`} />
                              {section.title}
                            </h4>
                            <TaskList
                              tasks={section.tasks}
                              onToggle={toggleTask}
                              onEdit={openEditTask}
                              onDelete={setDeletingTask}
                              onStatusChange={changeTaskStatus}
                              emptyMessage="No tasks scheduled."
                            />
                          </section>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            ) : activeView === 'group' && selectedGroup ? (
              selectedGroup.scheduleSections.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  {search ? 'No tasks match your search.' : `No tasks in ${selectedGroup.name} yet. Add one to get started.`}
                </p>
              ) : (
                <div className="space-y-6">
                  {selectedGroup.scheduleSections.map((section) => (
                    <section key={`${selectedGroup.id}-${section.title}`} aria-label={`${selectedGroup.name} tasks: ${section.title}`}>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <span className={`size-2 rounded-full ${section.title === 'Overdue' ? 'bg-rose-500' : section.title === 'Today' ? 'bg-violet-500' : 'bg-slate-300'}`} />
                        {section.title}
                      </h3>
                      <TaskList
                        tasks={section.tasks}
                        onToggle={toggleTask}
                        onEdit={openEditTask}
                        onDelete={setDeletingTask}
                        onStatusChange={changeTaskStatus}
                        emptyMessage="No tasks scheduled."
                      />
                    </section>
                  ))}
                </div>
              )
            ) : activeView === 'tasks' && viewMode === 'board' ? (
              <TaskBoard
                tasks={visibleTasks}
                onToggle={toggleTask}
                onEdit={openEditTask}
                onDelete={setDeletingTask}
                onStatusChange={changeTaskStatus}
              />
            ) : (
              <TaskList
                tasks={visibleTasks}
                onToggle={toggleTask}
                onEdit={openEditTask}
                onDelete={setDeletingTask}
                onStatusChange={changeTaskStatus}
                emptyMessage={search ? 'No tasks match your search.' : 'Nothing to show here yet.'}
              />
            )}
          </section>
        </main>
      </div>
      {isTaskFormOpen && (
        <TaskForm
          key={editingTask?.id ?? 'new-task'}
          initialTask={editingTask}
          groups={groups}
          defaultGroupId={defaultGroupId}
          onSubmit={saveTask}
          onClose={closeTaskForm}
        />
      )}
      {isGroupFormOpen && (
        <GroupForm
          onSubmit={createGroup}
          onClose={() => setIsGroupFormOpen(false)}
        />
      )}
      {deletingTask && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDeletingTask(null)
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-task-heading"
            aria-describedby="delete-task-description"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl shadow-slate-900/20"
          >
            <h2 id="delete-task-heading" className="text-lg font-bold text-slate-900">Delete this task?</h2>
            <p id="delete-task-description" className="mt-2 break-words text-sm leading-6 text-slate-500">
              “{deletingTask.title}” will be permanently removed from your task list.
            </p>
            {workspaceError && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{workspaceError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingTask(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTask}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200"
              >
                Delete task
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Dashboard
