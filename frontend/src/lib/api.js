export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/cases/writeups"

// Base URL with "/cases/writeups" stripped off, so we can hit other endpoints
// (like the decision endpoint) without duplicating the env var.
export const API_BASE = API_URL.replace(/\/cases\/writeups\/?$/, "")

export async function postDecision(playerId, category, decision) {
  const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(playerId)}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, decision }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed with ${res.status}`)
  }

  return res.json()
}

export async function postRevert(playerId, category) {
  const res = await fetch(`${API_BASE}/cases/${encodeURIComponent(playerId)}/revert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed with ${res.status}`)
  }

  return res.json()
}
