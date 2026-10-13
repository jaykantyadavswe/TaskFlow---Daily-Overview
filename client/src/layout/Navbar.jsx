import { useEffect, useState } from 'react'

function Navbar({ search, onSearchChange, onAddTask }) {
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const timerId = window.setInterval(() => setCurrentTime(new Date()), 60_000)
    return () => window.clearInterval(timerId)
  }, [])

  const hour = currentTime.getHours()
  const greeting = hour < 12
    ? 'Good morning'
    : hour < 17
      ? 'Good afternoon'
      : hour < 21
        ? 'Good evening'
        : 'Good night'

  return (
    <header className="sticky top-0 z-10 flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
      {/* <div className="hidden text-sm font-medium text-slate-400 sm:block">
        Workspace <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-700">{viewLabels[activeView]}</span>
      </div> */}

        <div className="hidden sm:block">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{greeting}, Jaykant!</h1>
            {/* <p className="text-sm font-medium text-slate-400 sm:block">
                Workspace <span className="mx-2 text-slate-300">/</span>
                <span className="text-slate-700">{viewLabels[activeView]}</span>
            </p> */}
            <p className="text-sm text-slate-500">Let's make today productive!</p>
        </div>
      <div className="ml-auto flex min-w-0 w-full items-center justify-end gap-2 sm:w-auto sm:gap-4">
        <label className="relative block min-w-0 w-full max-w-[260px]">
          <span className="sr-only">Search tasks</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.5 4.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />
        </label>
        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-violet-600 px-3 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200 sm:gap-2 sm:px-4"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">Add task</span>
          <span className="sm:hidden">Add</span>
        </button>
        <div className="hidden h-9 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            {/* <p className="text-sm font-semibold leading-5 text-slate-800">Jaykant Yadav</p> */}
            {/* <p className="text-xs text-slate-400">Personal workspace</p> */}
          </div>
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-700" aria-label="Jaykant Yadav">
            JY
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
