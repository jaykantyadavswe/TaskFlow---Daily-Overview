import './App.css'

import {CheckCircle2, ListTodo, Clock3, Plus} from "lucide-react";
import Sidebar from './components/Sidebar';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import StatsCard from './components/StatsCard';

const tasks = [
  { id: 1, title: "Revise React components and props", status: "pending", category: "React", dueDate: "2024-06-15", priority: "high"},
  { id: 2, title: "Task 2", status: "completed", category: "Work", dueDate: "2024-06-20", priority: "medium"},
  { id: 3, title: "Task 3", status: "pending", category: "Personal", dueDate: "2024-06-25", priority: "low"},
  { id: 4, title: "Task 4", status: "completed", category: "Work", dueDate: "2024-06-30", priority: "high"},
  { id: 5, title: "Task 5", status: "pending", category: "Personal", dueDate: "2024-07-05", priority: "medium"},
  { id: 6, title: "Task 6", status: "completed", category: "Work", dueDate: "2024-07-10", priority: "low"},
  { id: 7, title: "Task 7", status: "pending", category: "Personal", dueDate: "2024-07-15", priority: "high"},
  { id: 8, title: "Task 8", status: "completed", category: "Work", dueDate: "2024-07-20", priority: "medium"},
  { id: 9, title: "Task 9", status: "pending", category: "Personal", dueDate: "2024-07-25", priority: "low"},
  { id: 10, title: "Task 10", status: "completed", category: "Work", dueDate: "2024-07-30", priority: "high"},
  { id: 11, title: "Task 11", status: "pending", category: "Personal", dueDate: "2024-08-05", priority: "medium"},
  { id: 12, title: "Task 12", status: "completed", category: "Work", dueDate: "2024-08-10", priority: "low"},
  { id: 13, title: "Task 13", status: "pending", category: "Personal", dueDate: "2024-08-15", priority: "high"},
  { id: 14, title: "Task 14", status: "completed", category: "Work", dueDate: "2024-08-20", priority: "medium"},
  { id: 15, title: "Task 15", status: "pending", category: "Personal", dueDate: "2024-08-25", priority: "low"},
  { id: 16, title: "Task 16", status: "completed", category: "Work", dueDate: "2024-08-30", priority: "high"},
  { id: 17, title: "Task 17", status: "pending", category: "Personal", dueDate: "2024-09-05", priority: "medium"},
  { id: 18, title: "Task 18", status: "completed", category: "Work", dueDate: "2024-09-10", priority: "low"},
  { id: 19, title: "Task 19", status: "pending", category: "Personal", dueDate: "2024-09-15", priority: "high"},
  { id: 20, title: "Task 20", status: "completed", category: "Work", dueDate: "2024-09-20", priority: "medium"},
  { id: 21, title: "Task 21", status: "pending", category: "Personal", dueDate: "2024-09-25", priority: "low"},
  { id: 22, title: "Task 22", status: "completed", category: "Work", dueDate: "2024-09-30", priority: "high"},
  { id: 23, title: "Task 23", status: "pending", category: "Personal", dueDate: "2024-10-05", priority: "medium"},
  { id: 24, title: "Task 24", status: "completed", category: "Work", dueDate: "2024-10-10", priority: "low"},
  { id: 25, title: "Task 25", status: "pending", category: "Personal", dueDate: "2024-10-15", priority: "high"}
];

function App() {

  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const pending = total - completed;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 p-6 md:p-10">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Workspace / Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">My Dashboard</h1>
            <p className="mt-2 text-slate-500">Make progress, one task at a time</p>
          </div>

          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus size={16} />
            <span className='hidden sm:inline'>Add Task</span>
          </button>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard icon={ListTodo} title="Total Tasks" value={total} />
          <StatsCard icon={CheckCircle2} title="Completed Tasks" value={completed} />
          <StatsCard icon={Clock3} title="Pending Tasks" value={pending} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Today's Tasks</h3>
            <span>
              {pending} pending, {completed} completed
            </span>
          </div>

          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </section>
      </main>
    </div>
  )
}
export default App
