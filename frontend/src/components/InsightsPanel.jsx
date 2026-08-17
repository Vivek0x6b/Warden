import ReactECharts from "echarts-for-react"
import { sevColor } from "../lib/severity"

const sevColorHex = {
  severe: "#e66767",
  moderate: "#ec835a",
  minor: "#fab219",
}

const sevOrder = { severe: 0, moderate: 1, minor: 2 }

export default function InsightsPanel({ cases }) {
  const sevCounts = { severe: 0, moderate: 0, minor: 0 }
  cases.forEach((c) => { sevCounts[c.severity]++ })
  const maxCount = Math.max(...Object.values(sevCounts))

  const sorted = [...cases].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity])

  const confidenceChartOption = {
    grid: { left: 4, right: 8, top: 10, bottom: 40 },
    xAxis: {
      type: "category",
      data: sorted.map((c) => c.player_id),
      axisLabel: { color: "#898781", fontSize: 9, rotate: 45, interval: 0 },
      axisLine: { lineStyle: { color: "#2c2c2a" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      max: 100,
      axisLabel: { color: "#898781", fontSize: 10, formatter: "{value}%" },
      splitLine: { lineStyle: { color: "#2c2c2a" } },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1a1a19",
      borderColor: "#2c2c2a",
      textStyle: { color: "#ffffff", fontSize: 12 },
      formatter: (params) => `${params[0].name}<br/>Confidence: ${params[0].value}%`,
    },
    series: [
      {
        type: "bar",
        data: sorted.map((c) => ({
          value: Math.round(c.confidence * 100),
          itemStyle: { color: sevColorHex[c.severity], borderRadius: [4, 4, 0, 0] },
        })),
        barWidth: "60%",
      },
    ],
  }

  return (
    <div className="border-l border-[var(--border)] px-6 py-7 overflow-y-auto">
      <p className="text-[11.5px] text-[var(--text-muted)] uppercase tracking-wide mb-4">Insights</p>

      <p className="text-xs text-[var(--text-secondary)] mb-3">Severity breakdown</p>
      <div className="flex flex-col gap-3 mb-8">
        {Object.entries(sevCounts).map(([sev, count]) => (
          <div key={sev}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="capitalize text-[var(--text-secondary)]">{sev}</span>
              <span className="font-semibold">{count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(count / maxCount) * 100}%`, background: sevColor[sev] }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--text-secondary)] mb-3">Confidence across all cases</p>
      <ReactECharts option={confidenceChartOption} style={{ height: 220, width: "100%" }} />
    </div>
  )
}