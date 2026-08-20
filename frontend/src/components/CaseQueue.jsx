import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle } from "lucide-react"
import { sevColor, sevOrder, sevIcon, catLabel } from "../lib/severity"

function QueueRow({ c, isActive, onSelect, resolved }) {
  const SevIcon = sevIcon[c.severity]
  const isApproved = c.status === "approved"
  const rowColor = resolved ? (isApproved ? "var(--status-good)" : "var(--text-muted)") : sevColor[c.severity]
  const RowIcon = resolved ? (isApproved ? CheckCircle2 : XCircle) : SevIcon

  return (
    <motion.div
      onClick={() => onSelect(c.player_id)}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.12 }}
      className={`flex items-start gap-3 px-6 py-4 border-b border-[var(--gridline)] cursor-pointer border-l-[3px] ${
        isActive ? "bg-white/[0.045]" : "border-l-transparent hover:bg-white/[0.03]"
      } ${resolved ? "opacity-60" : ""}`}
      style={isActive ? { borderLeftColor: rowColor } : undefined}
    >
      <RowIcon className="w-[18px] h-[18px] mt-0.5 shrink-0" style={{ color: rowColor }} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <span className="text-[15px] font-semibold">{c.player_id}</span>
          <span className="text-xs text-[var(--text-muted)] capitalize">
            {resolved ? (isApproved ? "Approved" : "Overridden") : c.severity}
          </span>
        </div>
        <div className="text-[13px] text-[var(--text-secondary)] mt-1">{catLabel[c.category]}</div>
      </div>
    </motion.div>
  )
}

export default function CaseQueue({ cases, selectedId, onSelect }) {
  const [tab, setTab] = useState("pending")

  const withStatus = cases.map((c) => ({ ...c, status: c.status || "pending" }))
  const bySeverity = (a, b) => sevOrder[a.severity] - sevOrder[b.severity]

  const pending = withStatus.filter((c) => c.status === "pending").sort(bySeverity)
  const resolved = withStatus.filter((c) => c.status !== "pending").sort(bySeverity)
  const visible = tab === "pending" ? pending : resolved

  return (
    <div className="border-r border-[var(--border)] overflow-y-auto flex flex-col">
      <div className="flex gap-1.5 px-6 pt-5 pb-4">
        <button
          onClick={() => setTab("pending")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
            tab === "pending"
              ? "bg-white/[0.08] text-[var(--text-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab("resolved")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
            tab === "resolved"
              ? "bg-white/[0.08] text-[var(--text-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          Resolved ({resolved.length})
        </button>
      </div>

      <div className="flex-1">
        {visible.map((c) => (
          <QueueRow
            key={`${c.player_id}-${c.category}`}
            c={c}
            isActive={c.player_id === selectedId}
            onSelect={onSelect}
            resolved={tab === "resolved"}
          />
        ))}
        {visible.length === 0 && (
          <div className="px-6 py-6 text-[13px] text-[var(--text-muted)]">
            {tab === "pending" ? "All caught up — no pending cases." : "No decisions made yet."}
          </div>
        )}
      </div>
    </div>
  )
}
