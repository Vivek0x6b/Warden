import { ShieldAlert, AlertTriangle, Info, Bot, Users, MessageSquareWarning, UserX } from "lucide-react"

export const sevOrder = { severe: 0, moderate: 1, minor: 2 }

export const sevColor = {
  severe: "var(--status-critical)",
  moderate: "var(--status-serious)",
  minor: "var(--status-warning)",
}

export const sevTrack = {
  severe: "var(--meter-track-critical)",
  moderate: "var(--meter-track-serious)",
  minor: "var(--meter-track-warning)",
}

export const sevIcon = {
  severe: ShieldAlert,
  moderate: AlertTriangle,
  minor: Info,
}

export const catColor = {
  cheating: "var(--cat-cheating)",
  matchmaking_abuse: "var(--cat-matchmaking)",
  toxicity: "var(--cat-toxicity)",
  ban_evasion: "var(--cat-evasion)",
}

// Plain hex, not CSS vars — ECharts renders to canvas and can't resolve var() references
export const catColorHex = {
  cheating: "#3987e5",
  matchmaking_abuse: "#d95926",
  toxicity: "#199e70",
  ban_evasion: "#9085e9",
}

export const catLabel = {
  cheating: "Cheating / Hacking",
  matchmaking_abuse: "Matchmaking abuse",
  toxicity: "Toxicity",
  ban_evasion: "Ban evasion",
}

export const catIcon = {
  cheating: Bot,
  matchmaking_abuse: Users,
  toxicity: MessageSquareWarning,
  ban_evasion: UserX,
}