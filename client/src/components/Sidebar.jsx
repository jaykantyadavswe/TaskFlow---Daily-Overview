import {LayoutDashboard, CalendarDays, CheckCircle2, ListTodo} from "lucide-react";

const links = [
    {label: "Dashboard", icon: LayoutDashboard, href: "/dashboard"},
    {label: "My Day", icon: CalendarDays, href: "/my-day"},
    {label: "Completed", icon: CheckCircle2, href: "/completed"},
    {label: "All Tasks", icon: ListTodo, href: "/all-tasks"}
];

function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-100 p-4">
      <h1 className="mb-10 text-2xl font-bold text-indigo-600">TaskFlow</h1>

      <p className="mb-3 text-xs font-semibold uppercase text-slate-400">Workspace</p>

      <nav className="space-y-2">
        {links.map(({label, icon: Icon}, index) => (
          <button
            key={label}
            href={links[index].href}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${index === 0 ? 'bg-indigo-50 font-semibold text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Icon className="mr-2"  size={18}/>
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
