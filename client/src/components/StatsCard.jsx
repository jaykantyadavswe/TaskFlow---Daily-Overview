import React from 'react'

function StatsCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{title}</p>
        
        {Icon && (
            <div className="`rounded-lg bg-indigo-50 text-indigo-600">
                <Icon size={20} />
            </div>
        )}
      </div>
          <p className="mt-4 text-3xl font-bold">{value}</p>
    </div>
  )
}

export default StatsCard;
