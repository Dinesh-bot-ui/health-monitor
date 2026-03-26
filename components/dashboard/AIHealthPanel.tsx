"use client"
import { useState, useEffect, useMemo } from "react"
import {
  TrendingUp,
  Brain,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Clock,
} from "lucide-react"

type Props = {
  alerts: any[]
  predictions: string[]
  insights: string[]
  breakdown: Record<string, number>
  score: number
  recommendations: string[]
}

// ─── Wellness Tips Engine (updates every 30 minutes based on vitals) ────────
const WELLNESS_TIPS_POOL = [
  // Heart-related
  { condition: (b: Record<string, number>) => (b.heart || 0) > 85, tip: "💓 Your heart rate is elevated. Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s.", category: "heart" },
  { condition: (b: Record<string, number>) => (b.heart || 0) <= 85 && (b.heart || 0) >= 60, tip: "💚 Heart rate is in healthy range. Keep up the good work!", category: "heart" },
  { condition: (b: Record<string, number>) => (b.heart || 0) < 60, tip: "💙 Low heart rate detected. Consider light movement if feeling dizzy.", category: "heart" },
  // Oxygen-related
  { condition: (b: Record<string, number>) => (b.oxygen || 0) < 95, tip: "🫁 Oxygen is below optimal. Practice deep breathing exercises for 5 mins.", category: "oxygen" },
  { condition: (b: Record<string, number>) => (b.oxygen || 0) >= 95, tip: "🌬️ Oxygen levels are excellent. Stay in well-ventilated areas.", category: "oxygen" },
  // Stress-related
  { condition: (b: Record<string, number>) => (b.stress || 0) < 40, tip: "🧘 High stress detected. Take a 10-minute mindfulness break.", category: "stress" },
  { condition: (b: Record<string, number>) => (b.stress || 0) >= 40, tip: "😌 Stress levels are manageable. Consider a gratitude journal tonight.", category: "stress" },
  // BP-related
  { condition: (b: Record<string, number>) => (b.bp || 0) > 130, tip: "🩸 Blood pressure is elevated. Reduce sodium intake and try walking 15 mins.", category: "bp" },
  { condition: (b: Record<string, number>) => (b.bp || 0) <= 130, tip: "✅ Blood pressure is within normal range. Maintain balanced diet.", category: "bp" },
  // Respiration-related
  { condition: (b: Record<string, number>) => (b.respiration || 0) > 20, tip: "💨 Respiratory rate is high. Practice slow, diaphragmatic breathing.", category: "respiration" },
  { condition: (b: Record<string, number>) => (b.respiration || 0) <= 20, tip: "🍃 Breathing is steady. Great time for a stretching session.", category: "respiration" },
  // General wellness
  { condition: () => true, tip: "💧 Stay hydrated — aim for 8 glasses of water today.", category: "general" },
  { condition: () => true, tip: "🏃 A 20-minute brisk walk can boost mood and cardiovascular health.", category: "general" },
  { condition: () => true, tip: "🥗 Include leafy greens in your next meal for essential micronutrients.", category: "general" },
  { condition: () => true, tip: "😴 Maintain a consistent sleep schedule for optimal recovery.", category: "general" },
  { condition: () => true, tip: "📱 Take screen breaks every 30 minutes to reduce eye strain.", category: "general" },
]

function getWellnessTips(breakdown: Record<string, number>, seed: number): string[] {
  // Filter tips that match current conditions
  const matchedTips = WELLNESS_TIPS_POOL.filter(t => t.condition(breakdown))
  // Use seed to deterministically pick 4 tips from different categories
  const categories = [...new Set(matchedTips.map(t => t.category))]
  const selected: string[] = []
  for (const cat of categories) {
    const catTips = matchedTips.filter(t => t.category === cat)
    const pick = catTips[(seed + cat.length) % catTips.length]
    if (pick && selected.length < 5) selected.push(pick.tip)
  }
  return selected
}

// ─── Section Component ────────────────────────────────────────────────────────
function PanelSection({
  title,
  icon: Icon,
  iconColor,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: React.ElementType
  iconColor: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-[#1e2d40] bg-[#0a1018] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 hover:bg-[#111c28] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          <span className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
            {title}
          </span>
        </div>
        <ChevronRight
          className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && <div className="px-3 pb-3 pt-1">{children}</div>}
    </div>
  )
}

export default function AIHealthPanel({
  alerts,
  predictions,
  insights,
  breakdown,
  score,
  recommendations,
}: Props) {
  const [open, setOpen] = useState(true)

  // Wellness tips that update every 30 minutes
  const [tipsSeed, setTipsSeed] = useState(() => Math.floor(Date.now() / (30 * 60 * 1000)))
  const [lastTipUpdate, setLastTipUpdate] = useState<string>(() => new Date().toLocaleTimeString())

  useEffect(() => {
    const interval = setInterval(() => {
      const newSeed = Math.floor(Date.now() / (30 * 60 * 1000))
      if (newSeed !== tipsSeed) {
        setTipsSeed(newSeed)
        setLastTipUpdate(new Date().toLocaleTimeString())
      }
    }, 60_000) // check every minute
    return () => clearInterval(interval)
  }, [tipsSeed])

  const wellnessTips = useMemo(
    () => getWellnessTips(breakdown, tipsSeed),
    [breakdown, tipsSeed]
  )

  const scoreColor =
    score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400"

  const scoreGlow =
    score >= 80
      ? "shadow-[0_0_24px_rgba(52,211,153,0.3)]"
      : score >= 60
      ? "shadow-[0_0_24px_rgba(251,191,36,0.3)]"
      : "shadow-[0_0_24px_rgba(248,113,113,0.3)]"

  return (
    <div className={`h-full transition-all duration-300 ${open ? "w-80" : "w-10"} flex-shrink-0`}>
      {/* Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-full py-2 bg-[#111820] hover:bg-[#1a2535] transition-colors border-b border-[#1e2d40]"
      >
        {open ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="p-3 space-y-3 bg-[#0d1520] h-full border-l border-[#1e2d40] overflow-y-auto">
          {/* AI Score Badge */}
          <div className={`flex flex-col items-center py-3 rounded-xl bg-[#0a1018] border border-[#1e2d40] ${scoreGlow}`}>
            <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
            <div className={`text-3xl font-black tracking-tight ${scoreColor}`}>{score}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">AI Health Score</div>
            <div className="flex gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-5 h-1 rounded-full ${
                    i < Math.ceil(score / 20)
                      ? score >= 80
                        ? "bg-emerald-400"
                        : score >= 60
                        ? "bg-amber-400"
                        : "bg-red-400"
                      : "bg-[#1e2d40]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Predictions */}
          <PanelSection title="Predictions" icon={TrendingUp} iconColor="text-rose-400">
            {predictions.length > 0 ? (
              <div className="space-y-1.5">
                {predictions.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[11px] text-rose-300 bg-rose-950/40 px-2 py-1.5 rounded-md border border-rose-900/30"
                  >
                    <TrendingUp className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground italic">No risk predictions at this time ✓</p>
            )}
          </PanelSection>

          {/* Insights */}
          <PanelSection title="Insights" icon={Brain} iconColor="text-yellow-400">
            {insights.length > 0 ? (
              <div className="space-y-1.5">
                {insights.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[11px] text-yellow-300 bg-yellow-950/40 px-2 py-1.5 rounded-md border border-yellow-900/30"
                  >
                    <Brain className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground italic">Vitals correlations are stable ✓</p>
            )}
          </PanelSection>

          {/* Score Breakdown */}
          <PanelSection title="Score Breakdown" icon={BarChart3} iconColor="text-emerald-400">
            <div className="space-y-2">
              {Object.entries(breakdown).map(([k, v]) => {
                const max = k === "bp" ? 140 : k === "heart" ? 100 : k === "oxygen" ? 100 : k === "stress" ? 60 : 20
                const pct = Math.min(100, (v / max) * 100)
                const barColor =
                  pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"
                return (
                  <div key={k}>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="capitalize text-muted-foreground">{k}</span>
                      <span className="font-mono text-emerald-400">{v}</span>
                    </div>
                    <div className="h-1 bg-[#1e2d40] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </PanelSection>

          {/* Recommendations */}
          <PanelSection title="Recommendations" icon={Lightbulb} iconColor="text-blue-400">
            {recommendations.length > 0 ? (
              <div className="space-y-1.5">
                {recommendations.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[11px] text-blue-300 bg-blue-950/40 px-2 py-1.5 rounded-md border border-blue-900/30"
                  >
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5 text-[11px] text-blue-300">
                <div className="bg-blue-950/40 px-2 py-1.5 rounded-md border border-blue-900/30">• Stay hydrated 💧</div>
                <div className="bg-blue-950/40 px-2 py-1.5 rounded-md border border-blue-900/30">• Take short breaks 🧘</div>
              </div>
            )}
          </PanelSection>

          {/* Alerts & Insights (Combined) */}
          <PanelSection title="Alerts & Insights" icon={AlertTriangle} iconColor="text-orange-400">
            <div className="space-y-1.5">
              {[
                ...alerts.map((a: any) => ({ text: a.msg || a, type: a.cls || "info" })),
                ...insights.map((c) => ({ text: c, type: "insight" })),
              ].map((item, i) => {
                const colors: Record<string, string> = {
                  danger: "text-red-300 bg-red-950/40 border-red-900/30",
                  warn: "text-amber-300 bg-amber-950/40 border-amber-900/30",
                  ok: "text-emerald-300 bg-emerald-950/40 border-emerald-900/30",
                  info: "text-blue-300 bg-blue-950/40 border-blue-900/30",
                  insight: "text-yellow-300 bg-yellow-950/40 border-yellow-900/30",
                }
                return (
                  <div
                    key={i}
                    className={`text-[11px] px-2 py-1.5 rounded-md border ${colors[item.type] || colors.info}`}
                  >
                    • {item.text}
                  </div>
                )
              })}
              {alerts.length === 0 && insights.length === 0 && (
                <p className="text-[10px] text-muted-foreground italic">No active alerts ✓</p>
              )}
            </div>
          </PanelSection>

          {/* Wellness Tips (Auto-updates every 30 min) */}
          <PanelSection title="Wellness Tips" icon={Sparkles} iconColor="text-violet-400">
            <div className="space-y-1.5">
              {wellnessTips.map((tip, i) => (
                <div
                  key={i}
                  className="text-[11px] text-violet-300 bg-violet-950/40 px-2 py-1.5 rounded-md border border-violet-900/30"
                >
                  {tip}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[9px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Last updated: {lastTipUpdate} · Refreshes every 30 min</span>
            </div>
          </PanelSection>
        </div>
      )}
    </div>
  )
}