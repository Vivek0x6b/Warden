import { useState, useEffect } from "react"
import { sevColor, sevTrack, sevIcon, catColor, catIcon, catLabel } from "../lib/severity"

export default function DetailPanel({ activeCase, onDecide }) {
  const [saving, setSaving] = useState(null) // "approve" | "override" | null
  const [decideError, setDecideError] = useState(null)

  // Reset transient UI state whenever the selected case changes.
  useEffect(() => {
    setSaving(null)
    setDecideError(null)
  }, [activeCase?.player_id, activeCase?.category])

  if (!activeCase) return null
  const c = activeCase
  const SevIcon = sevIcon[c.severity]
  const CatIcon = catIcon[c.category]
  const status = c.status || "pending"

  const handleClick = async (decision) => {
    setSaving(decision)
    setDecideError(null)
    try {
      await onDecide(c.player_id, c.category, decision)
    } catch (err) {
      setDecideError(err.message)
    } finally {
      setSaving(null)
    }
  }

  const evidenceItems = []
  if (c.reports > 0) {
    evidenceItems.push(`${c.reports} independent player report${c.reports === 1 ? "" : "s"}`)
  }
  if (c.confidence >= 0.9) {
    evidenceItems.push(`Automated signal confidence ${Math.round(c.confidence * 100)}% — clears the severe evidence bar`)
  } else if (c.confidence >= 0.7) {
    evidenceItems.push(`Automated signal confidence ${Math.round(c.confidence * 100)}% — clears the moderate evidence bar`)
  } else {
    evidenceItems.push(`Automated signal confidence ${Math.round(c.confidence * 100)}% — below the moderate bar, minor tier only`)
  }
  evidenceItems.push(`Matches a documented playbook trigger for ${catLabel[c.category].toLowerCase()}`)

  return (
    <div className="px-9 py-7 max-w-[720px] mx-auto">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[22px] font-semibold">{c.player_id}</span>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border capitalize"
          style={{ color: sevColor[c.severity], background: sevTrack[c.severity], borderColor: "var(--border-strong)" }}
        >
          <SevIcon className="w-3.5 h-3.5" />
          {c.severity}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] mb-6">
        <CatIcon className="w-3.5 h-3.5" style={{ color: catColor[c.category] }} />
        {catLabel[c.category]}
      </div>

      <p className="text-[11.5px] text-[var(--text-muted)] uppercase tracking-wide mb-2.5">AI-generated summary</p>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[10px] px-5 py-4.5 text-[14.5px] leading-[1.55] mb-6">
        {c.ai_writeup}
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-[13px] mb-2">
          <span>Detection confidence</span>
          <span className="font-semibold">{Math.round(c.confidence * 100)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: sevTrack[c.severity] }}>
          <div className="h-full rounded-full" style={{ width: `${Math.round(c.confidence * 100)}%`, background: sevColor[c.severity] }} />
        </div>
      </div>

      <p className="text-[11.5px] text-[var(--text-muted)] uppercase tracking-wide mb-2.5">Evidence</p>
      <div className="flex flex-col gap-2.5 mb-6">
        {evidenceItems.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-[var(--text-secondary)]">
            <span
              className="w-4 h-4 rounded flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
              style={{ background: "rgba(12,163,12,0.15)", color: "var(--status-good)" }}
            >
              ✓
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      <p className="text-[11.5px] text-[var(--text-muted)] uppercase tracking-wide mb-2.5">Matched playbook rule</p>
      <div className="pl-3.5 py-1 text-[13.5px] italic text-[var(--text-secondary)] mb-6" style={{ borderLeft: "2px solid var(--border-strong)" }}>
        "{c.matches_playbook_trigger}"
      </div>

      <div className="flex items-center justify-between px-5 py-4 bg-[var(--card)] border border-[var(--border)] rounded-[10px]">
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1">Recommended action</div>
          <div className="text-[15px] font-semibold">{c.recommended_action}</div>
        </div>

        {status === "pending" ? (
          <div className="flex gap-2.5">
            <button
              onClick={() => handleClick("override")}
              disabled={saving !== null}
              className="text-[13px] font-semibold px-4 py-2.5 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--border-strong)" }}
            >
              {saving === "override" ? "Saving..." : "Override"}
            </button>
            <button
              onClick={() => handleClick("approve")}
              disabled={saving !== null}
              className="text-[13px] font-semibold px-4 py-2.5 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--status-good)", borderColor: "var(--status-good)", color: "#06230a" }}
            >
              {saving === "approve" ? "Saving..." : "Approve"}
            </button>
          </div>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md border capitalize"
            style={
              status === "approved"
                ? { color: "var(--status-good)", background: "rgba(12,163,12,0.12)", borderColor: "var(--status-good)" }
                : { color: "var(--text-secondary)", background: "var(--card)", borderColor: "var(--border-strong)" }
            }
          >
            {status === "approved" ? "Approved — enforced" : "Overridden — dismissed"}
          </span>
        )}
      </div>

      {decideError && (
        <p className="text-[var(--status-critical)] text-xs mt-3 text-right">{decideError}</p>
      )}
    </div>
  )
}