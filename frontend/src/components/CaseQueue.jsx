import { motion } from "framer-motion"
import { sevColor, sevOrder, sevIcon, catLabel } from "../lib/severity"

export default function CaseQueue({ cases, selectedId, onSelect }) {
  const sorted = [...cases].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity])

  return (
    <div className="border-r border-[var(--border)] overflow-y-auto">
      <div className="px-6 pt-5 pb-3 text-xs text-[var(--text-muted)] uppercase tracking-wide">
        Case queue
      </div>
      <div>
        {sorted.map((c) => {
          const isActive = c.player_id === selectedId
          const Icon = sevIcon[c.severity]
          return (
            <motion.div
              key={c.player_id}
              onClick={() => onSelect(c.player_id)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className={`flex items-start gap-3 px-6 py-4 border-b border-[var(--gridline)] cursor-pointer border-l-[3px] ${
                isActive ? "bg-white/[0.045]" : "border-l-transparent hover:bg-white/[0.03]"
              }`}
              style={isActive ? { borderLeftColor: sevColor[c.severity] } : undefined}
            >
              <Icon className="w-[18px] h-[18px] mt-0.5 shrink-0" style={{ color: sevColor[c.severity] }} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <span className="text-[15px] font-semibold">{c.player_id}</span>
                  <span className="text-xs text-[var(--text-muted)] capitalize">{c.severity}</span>
                </div>
                <div className="text-[13px] text-[var(--text-secondary)] mt-1">{catLabel[c.category]}</div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}