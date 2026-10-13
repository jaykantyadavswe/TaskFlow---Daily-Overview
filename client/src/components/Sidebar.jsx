const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'tasks',
    label: 'My tasks',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M8 6h12M8 12h12M8 18h12" strokeLinecap="round" />
        <path d="m3.5 6 .8.8 1.5-1.6M3.5 12l.8.8 1.5-1.6M3.5 18l.8.8 1.5-1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8.5 12 2.3 2.3 4.8-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

function Sidebar({ activeView, onNavigate, completedCount }) {
  return (
    <aside className="flex min-h-screen w-[76px] shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 sm:w-64 sm:px-5">
      <a href="#dashboard" className="mb-10 flex items-center gap-3 px-1" aria-label="TaskFlow home">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true">
            <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="hidden text-xl font-bold tracking-tight text-slate-900 sm:inline">TaskFlow</span>
      </a>

      <p className="mb-3 hidden px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">
        Workspace
      </p>
      <nav aria-label="Main navigation" className="space-y-1">
        {navigationItems.map((item) => {
          const isActive = activeView === item.id
          const badge = item.id === 'completed' ? completedCount : null

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              title={item.label}
              className={`flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors sm:justify-start ${
                isActive
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="size-5 shrink-0">{item.icon}</span>
              <span className="hidden flex-1 text-left sm:inline">{item.label}</span>
              {badge !== null && (
                <span className="hidden min-w-6 rounded-full bg-white px-2 py-0.5 text-center text-xs text-slate-500 sm:inline">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto hidden rounded-2xl bg-slate-900 p-4 text-white sm:block">
        <div className="mb-3 grid size-9 place-items-center rounded-xl bg-white/10 text-violet-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5" aria-hidden="true">
            <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" strokeLinejoin="round" />
            <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold">Make room for big ideas</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">A little progress every day adds up.</p>
      </div>
    </aside>
  )
}

export default Sidebar
