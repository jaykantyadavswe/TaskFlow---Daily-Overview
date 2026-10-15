import { useEffect, useRef, useState } from 'react'

function Navbar({ search, onSearchChange, onAddTask, user, onProfile, onLogout }) {
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const searchInputRef = useRef(null)

  useEffect(() => {
    const timerId = window.setInterval(() => setCurrentTime(new Date()), 60_000)
    return () => window.clearInterval(timerId)
  }, [])

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus()
  }, [isSearchOpen])

  function closeSearch() {
    setIsSearchOpen(false)
    onSearchChange('')
  }

  function requestLogout() {
    setIsAccountMenuOpen(false)
    onLogout()
  }

  const hour = currentTime.getHours()
  const greeting = hour < 12
    ? 'Good morning'
    : hour < 17
      ? 'Good afternoon'
      : hour < 21
        ? 'Good evening'
        : 'Good night'
  const firstName = user.name.split(/\s+/)[0]
  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  return (
    <header className="sticky top-0 z-10 flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-8">
      {/* <div className="hidden text-sm font-medium text-slate-400 sm:block">
        Workspace <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-700">{viewLabels[activeView]}</span>
      </div> */}

        <div className="hidden sm:block">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{greeting}, {firstName}!</h1>
            {/* <p className="text-sm font-medium text-slate-400 sm:block">
                Workspace <span className="mx-2 text-slate-300">/</span>
                <span className="text-slate-700">{viewLabels[activeView]}</span>
            </p> */}
            <p className="text-sm text-slate-500">Let's make today productive!</p>
        </div>
      <div className="ml-auto flex min-w-0 w-full items-center justify-end gap-2 sm:w-auto sm:gap-4">
          <div className={`flex min-w-0 items-center transition-[width] duration-200 ${isSearchOpen ? 'flex-1 sm:flex-none' : 'w-10'}`}>
            {isSearchOpen ? (
              <label className="relative block min-w-0 w-full sm:w-[260px]">
                <span className="sr-only">Search tasks</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" aria-hidden="true">
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 4.5 4.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') closeSearch()
                  }}
                  placeholder="Search tasks..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </label>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open task search"
                aria-expanded="false"
                className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-[18px]" aria-hidden="true">
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 4.5 4.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          {isSearchOpen && (
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close task search"
              aria-expanded="true"
              className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-[18px]" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          )}
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
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen((open) => !open)}
            aria-label={`Account menu for ${user.name}`}
            aria-haspopup="menu"
            aria-expanded={isAccountMenuOpen}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 transition hover:bg-violet-200 focus:outline-none focus:ring-4 focus:ring-violet-100"
          >
            {initials}
          </button>
          {isAccountMenuOpen && (
            <div role="menu" aria-label="Account" className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/10">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsAccountMenuOpen(false)
                  onProfile()
                }}
                className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={requestLogout}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
