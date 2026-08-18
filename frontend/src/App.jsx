import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from "framer-motion"
import PlaybookView from "./components/PlaybookView"
import EvidencePanel from "./components/EvidencePanel"
import InsightsPanel from "./components/InsightsPanel"
import CaseQueue from "./components/CaseQueue"
import DetailPanel from "./components/DetailPanel"
import Header from "./components/Header"
import StatTiles from "./components/StatTiles"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/cases/writeups"

function App() {
  const [cases, setCases] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPlaybook, setShowPlaybook] = useState(false)

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Backend responded with ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setCases(data.cases)
        setSelectedId(data.cases[0]?.player_id ?? null)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const selectedCase = cases.find((c) => c.player_id === selectedId)

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-[var(--text-muted)] text-sm">
        Loading cases from the backend...
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-[var(--status-critical)] font-semibold mb-2">Couldn't reach the backend</p>
          <p className="text-[var(--text-secondary)] text-sm">
            Make sure your FastAPI server is running at <code className="text-[var(--text-primary)]">http://localhost:8000</code>, then refresh this page.
          </p>
          <p className="text-[var(--text-muted)] text-xs mt-3">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
            <Header showPlaybook={showPlaybook} onTogglePlaybook={() => setShowPlaybook((v) => !v)} caseCount={cases.length} />
      <div className="flex-1 flex overflow-hidden">
         <div className="flex-1 min-w-0 overflow-y-auto flex flex-col">
          <StatTiles cases={cases} />
          <div className="grid grid-cols-[clamp(320px,22vw,480px)_1fr_clamp(300px,20vw,380px)_clamp(280px,18vw,380px)] flex-1">
            <CaseQueue cases={cases} selectedId={selectedId} onSelect={setSelectedId} />
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCase?.player_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <DetailPanel activeCase={selectedCase} />
              </motion.div>
            </AnimatePresence>
            <EvidencePanel activeCase={selectedCase} />
            <InsightsPanel cases={cases} />
          </div>
        </div>

        <AnimatePresence>
          {showPlaybook && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 560, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-[var(--border)] overflow-hidden shrink-0 h-full"
            >
              <PlaybookView onClose={() => setShowPlaybook(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
