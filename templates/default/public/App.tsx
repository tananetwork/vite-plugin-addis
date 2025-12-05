'use client'
// Client Component - demonstrates hydration with loading state
import React from 'react'

// SVG Spinner component
function Spinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-zinc-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function App({ url }: { url: string }) {
  const [loading, setLoading] = React.useState(true)
  const [count, setCount] = React.useState(0)

  // Simulate 4-second async loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="pt-8">
        <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
          <div className="flex flex-col items-center justify-center gap-4">
            <Spinner />
            <p className="text-zinc-500 text-sm">Loading client component...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-8">
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-300 mb-1">Client Component</h2>
            <p className="text-sm text-zinc-500">Hydrated and interactive</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Live</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCount(c => c - 1)}
            className="w-12 h-12 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xl font-bold transition-colors border border-zinc-700"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <p className="text-5xl font-bold tabular-nums text-white">{count}</p>
            <p className="text-xs text-zinc-500 mt-1">Interactive counter</p>
          </div>
          <button
            onClick={() => setCount(c => c + 1)}
            className="w-12 h-12 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xl font-bold transition-colors border border-zinc-700"
          >
            +
          </button>
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <p className="text-xs text-zinc-600">
            This component runs in the browser with <code className="text-zinc-500 bg-zinc-800 px-1 rounded">'use client'</code>
          </p>
        </div>
      </div>

      {/* How it works section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="font-semibold text-zinc-300 mb-1">Server Rendered</h3>
          <p className="text-xs text-zinc-500">HTML sent immediately, no JS required for first paint</p>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <div className="text-2xl mb-2">🔄</div>
          <h3 className="font-semibold text-zinc-300 mb-1">Hydration</h3>
          <p className="text-xs text-zinc-500">Client components become interactive after loading</p>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <div className="text-2xl mb-2">📦</div>
          <h3 className="font-semibold text-zinc-300 mb-1">Smaller Bundle</h3>
          <p className="text-xs text-zinc-500">Server code stays on server, minimal client JS</p>
        </div>
      </div>
    </div>
  )
}

export default App
