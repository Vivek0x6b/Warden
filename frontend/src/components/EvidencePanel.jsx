export default function EvidencePanel({ activeCase }) {
  const c = activeCase
  if (!c) return null

  return (
    <div className="border-l border-[var(--border)] px-6 py-7">
      <p className="text-[11.5px] text-[var(--text-muted)] uppercase tracking-wide mb-5">Case evidence</p>

      {c.category === "cheating" && <ReactionTimeEvidence stdMs={c.reaction_std_ms} />}
      {c.category === "matchmaking_abuse" && (
        <MatchmakingEvidence ageDays={c.account_age_days} winRate={c.win_rate} />
      )}
      {c.category === "ban_evasion" && <BanEvasionEvidence playerId={c.player_id} />}
    </div>
  )
}

function ReactionTimeEvidence({ stdMs }) {
  const max = 120
  const normalStart = 45
  const normalEnd = 90
  const pct = (v) => Math.min(100, (v / max) * 100)

  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-[var(--text-secondary)]">Reaction time consistency</span>
        <span className="font-semibold" style={{ color: "var(--status-critical)" }}>{stdMs}ms std dev</span>
      </div>
      <div className="relative h-2 rounded-full bg-white/[0.06] mb-1.5">
        <div
          className="absolute top-0 h-full bg-white/[0.12] rounded-full"
          style={{ left: `${pct(normalStart)}%`, width: `${pct(normalEnd) - pct(normalStart)}%` }}
        />
        <div
          className="absolute -top-1 w-[3px] h-4 rounded-full"
          style={{ left: `${pct(stdMs)}%`, background: "var(--status-critical)" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
        <span>0ms</span>
        <span>typical human range</span>
        <span>{max}ms</span>
      </div>
      <p className="text-xs text-[var(--text-secondary)] mt-4 leading-relaxed">
        Human reaction time naturally varies match to match. A standard deviation this low means the
        player's reaction time barely changes at all, consistent with automated or scripted play
        rather than a real person.
      </p>
    </div>
  )
}

function MatchmakingEvidence({ ageDays, winRate }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-[var(--text-secondary)]">Account age</span>
          <span className="font-semibold">{ageDays} day{ageDays === 1 ? "" : "s"}</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(100, (ageDays / 30) * 100)}%`, background: "var(--status-serious)" }}
          />
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">flagged when under 14 days old</p>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-[var(--text-secondary)]">Win rate</span>
          <span className="font-semibold">{Math.round(winRate * 100)}%</span>
        </div>
        <div className="relative h-2 rounded-full bg-white/[0.06]">
          <div className="absolute top-0 h-full w-[2px] bg-white/30" style={{ left: "50%" }} />
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.round(winRate * 100)}%`, background: "var(--status-serious)" }}
          />
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">baseline average is around 50%</p>
      </div>

      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        A brand new account winning far more often than average points to boosting, or a smurf,
        someone experienced playing on a low level account.
      </p>
    </div>
  )
}

function BanEvasionEvidence({ playerId }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 border border-[var(--border-strong)] rounded-lg px-3 py-3 text-center">
          <p className="text-[10px] text-[var(--text-muted)] mb-1">banned account</p>
          <p className="text-sm font-semibold">original</p>
        </div>
        <div className="text-[var(--text-muted)] text-[10px] shrink-0 text-center leading-tight">
          shares<br />device / payment
        </div>
        <div className="flex-1 border rounded-lg px-3 py-3 text-center" style={{ borderColor: "var(--status-critical)" }}>
          <p className="text-[10px] text-[var(--text-muted)] mb-1">this account</p>
          <p className="text-sm font-semibold">{playerId}</p>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        This account matches a device or payment fingerprint already tied to an active ban.
        That link is treated as confirmed evidence, ban evasion always gets flagged as severe.
      </p>
    </div>
  )
}