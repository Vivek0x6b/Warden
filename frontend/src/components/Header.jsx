export default function Header({ showPlaybook, onTogglePlaybook }) {
  return (
    <header className="flex items-center justify-between px-7 py-5 border-b border-[var(--border)]">
      <div className="flex items-center gap-3">
        <div
          className="w-[34px] h-[34px] rounded-lg flex items-center justify-center font-bold text-base text-white shrink-0"
          style={{ background: "linear-gradient(160deg, var(--cat-cheating), var(--cat-evasion))" }}
        >
          W
        </div>
        <div>
          <h1 className="m-0 text-[17px] font-semibold tracking-wide">Warden</h1>
          <p className="m-0 mt-0.5 text-[12.5px] text-[var(--text-muted)]">Player protection triage</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePlaybook}
          className={`text-[13px] font-medium px-3.5 py-1.5 rounded-md border ${
            showPlaybook
              ? "bg-white/[0.08] text-[var(--text-primary)] border-[var(--border-strong)]"
              : "text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
          }`}
        >
          {showPlaybook ? "Hide playbook" : "Playbook"}
        </button>
        <div className="text-[11.5px] text-[var(--text-muted)] border border-[var(--border)] rounded-full px-2.5 py-1">
          demo data · 10 flagged cases
        </div>
      </div>
    </header>
  )
}