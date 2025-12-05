'use client'
// Client Component - Interactive counter
import React from 'react'

export default function Counter() {
  const [count, setCount] = React.useState(0)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setHydrated(true)
  }, [])

  return (
    <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-zinc-500 mb-1">Hydration Status</p>
          <p className={`font-medium ${hydrated ? 'text-emerald-400' : 'text-amber-400'}`}>
            {hydrated ? 'Interactive' : 'Loading...'}
          </p>
        </div>
        <div className={`w-3 h-3 rounded-full ${hydrated ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setCount(c => c - 1)}
          className="w-12 h-12 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xl font-bold transition-colors"
        >
          -
        </button>
        <div className="flex-1 text-center">
          <p className="text-4xl font-bold tabular-nums">{count}</p>
          <p className="text-xs text-zinc-500 mt-1">Client-side state</p>
        </div>
        <button
          onClick={() => setCount(c => c + 1)}
          className="w-12 h-12 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xl font-bold transition-colors"
        >
          +
        </button>
      </div>

      <p className="text-xs text-zinc-600 mt-4 text-center">
        This component runs in the browser with <code className="text-zinc-500">'use client'</code>
      </p>
    </div>
  )
}
