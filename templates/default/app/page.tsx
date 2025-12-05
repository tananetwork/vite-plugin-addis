/**
 * Home Page - Server Component
 *
 * This is a React Server Component rendered by tana-edge.
 */
import React from 'react'
import App from '../public/App'

export default function Page() {
  const serverTimestamp = new Date().toISOString()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            tana
          </h1>
          <p className="text-xl text-zinc-400 max-w-md mx-auto leading-relaxed">
            React Server Components on the blockchain
          </p>
        </div>

        {/* Server rendered section */}
        <div className="w-full max-w-2xl">
          <div className="bg-zinc-900/80 backdrop-blur rounded-2xl p-8 border border-zinc-800 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Server Component</h2>
            </div>

            <p className="text-zinc-300 mb-4">
              This page was rendered on the server. No JavaScript required for initial display.
            </p>

            <div className="bg-black/50 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Rendered at</p>
              <p className="text-emerald-400 font-mono text-sm">{serverTimestamp}</p>
            </div>
          </div>

          {/* Client component area */}
          <App url="/" />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-zinc-500 text-sm">
            <a href="https://tana.network" className="hover:text-zinc-300 transition-colors">
              Docs
            </a>
            <a href="https://github.com/tananetwork" className="hover:text-zinc-300 transition-colors">
              GitHub
            </a>
            <a href="https://tana.network" className="hover:text-zinc-300 transition-colors">
              Deploy
            </a>
          </div>
          <p className="text-zinc-600 text-xs">
            Powered by tana-edge + React Server Components
          </p>
        </div>
      </footer>
    </div>
  )
}
