import ReactECharts from "echarts-for-react"
import { catColor, catColorHex, catLabel } from "../lib/severity"

export default function StatTiles({ cases }) {
  const total = cases.length
  const severeCount = cases.filter((c) => c.severity === "severe").length
  const avgConfidence = Math.round(
    (cases.reduce((sum, c) => sum + c.confidence, 0) / cases.length) * 100
  )

  const catCounts = {}
  cases.forEach((c) => {
    catCounts[c.category] = (catCounts[c.category] || 0) + 1
  })
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0]
  const catKeys = Object.keys(catCounts)

  const categoryChartOption = {
    grid: { left: 0, right: 6, top: 2, bottom: 2 },
    xAxis: { show: false, type: "value" },
    yAxis: { show: false, type: "category", data: catKeys },
    tooltip: { show: false },
    series: [
      {
        type: "bar",
        data: catKeys.map((cat) => ({
          value: catCounts[cat],
          itemStyle: { color: catColorHex[cat], borderRadius: [0, 4, 4, 0] },
        })),
        barWidth: 10,
        barCategoryGap: "35%",
      },
    ],
  }

  return (
    <div className="grid grid-cols-[1fr_1fr_1.6fr_1fr] gap-px bg-[var(--border)] border-b border-[var(--border)]">
      <div className="bg-[var(--background)] px-[24px] py-[18px]">
        <p className="text-xs text-[var(--text-muted)] mb-2">Flagged cases</p>
        <p className="text-3xl font-semibold leading-none mb-2.5">{total}</p>
        <div className="flex gap-3.5 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--status-critical)" }} />
            Severe
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--status-serious)" }} />
            Moderate
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--status-warning)" }} />
            Minor
          </span>
        </div>
      </div>

      <div className="bg-[var(--background)] px-[24px] py-[18px]">
        <p className="text-xs text-[var(--text-muted)] mb-2">Severe</p>
        <p className="text-3xl font-semibold leading-none mb-2.5" style={{ color: "var(--status-critical)" }}>
          {severeCount}
        </p>
        <span className="text-xs text-[var(--text-secondary)]">requires immediate review</span>
      </div>

      <div className="bg-[var(--background)] px-[24px] py-[18px]">
        <p className="text-xs text-[var(--text-muted)] mb-2">By category</p>
        <p className="text-xl font-semibold leading-none mb-2.5">{catLabel[topCat]}</p>
        <ReactECharts option={categoryChartOption} style={{ height: 44, width: "100%" }} />
        <div className="flex gap-3.5 flex-wrap mt-2">
          {catKeys.map((cat) => (
            <span key={cat} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full" style={{ background: catColor[cat] }} />
              {catLabel[cat]} ({catCounts[cat]})
            </span>
          ))}
        </div>
      </div>

      <div className="bg-[var(--background)] px-[24px] py-[18px]">
        <p className="text-xs text-[var(--text-muted)] mb-2">Avg. confidence (flagged)</p>
        <p className="text-3xl font-semibold leading-none mb-2.5">{avgConfidence}%</p>
        <span className="text-xs text-[var(--text-secondary)]">across all signals with an anomaly score</span>
      </div>
    </div>
  )
}