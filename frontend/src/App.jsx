import { useState } from 'react'
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "framer-motion"
import PlaybookView from "./components/PlaybookView"
import EvidencePanel from "./components/EvidencePanel"
import InsightsPanel from "./components/InsightsPanel"
import CaseQueue from "./components/CaseQueue"
import DetailPanel from "./components/DetailPanel"
import Header from "./components/Header"
import StatTiles from "./components/StatTiles"
import { sampleCases } from "./data/sampleCases"
import ReactECharts from "echarts-for-react"
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [selectedId, setSelectedId] = useState(sampleCases[0].player_id)
  const selectedCase = sampleCases.find((c) => c.player_id === selectedId)
  const [showPlaybook, setShowPlaybook] = useState(false)
  const chartOption = {
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [12, 19, 7, 14, 9],
        type: "bar",
      },
    ],
  }

return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header showPlaybook={showPlaybook} onTogglePlaybook={() => setShowPlaybook((v) => !v)} />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 min-w-0 overflow-y-auto">
          <StatTiles cases={sampleCases} />
          <div className="grid grid-cols-[clamp(320px,22vw,480px)_1fr_clamp(300px,20vw,380px)_clamp(280px,18vw,380px)]">
            <CaseQueue cases={sampleCases} selectedId={selectedId} onSelect={setSelectedId} />
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCase.player_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <DetailPanel activeCase={selectedCase} />
              </motion.div>
            </AnimatePresence>
            <EvidencePanel activeCase={selectedCase} />
            <InsightsPanel cases={sampleCases} />
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
