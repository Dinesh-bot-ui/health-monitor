"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import {
  HeartPulse,
  Footprints,
  Moon,
  Flame,
  Brain,
  Activity,
} from "lucide-react"
import { MetricCard } from "@/components/dashboard/metric-card"
import { WeeklyChart } from "@/components/dashboard/weekly-chart"
import { HealthScore } from "@/components/dashboard/health-score"
// AlertsPanel replaced by inline AI insights sections
import { GoalsPanel } from "@/components/dashboard/goals-panel"
import AIHealthPanel from "@/components/dashboard/AIHealthPanel"

// ─── Types ────────────────────────────────────────────────────────────────────

type HealthData = {
  fullName: string
  restingHeartRate: number | null
  stepsPerDay: number | null
  sleepHours: number | null
  stressLevel: number
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  spO2: number | null
  weight: number | null
  height: number | null
}

type LiveVitals = {
  hr: number
  spo2: number
  rr: number
  bpS: number
  bpD: number
}

type WaveformAnalysis = {
  qrs: number
  pr: number
  qt: number
  hrv: number
  dtw: number
  avgHR: number
  avgSpo2: number
  avgRR: number
}

type Analysis = {
  hrv: number
  avgHR: number
  avgSpo2: number
  avgRR: number
}

type AIAgentData = {
  alerts: string[]
  predictions: string[]
  insights: string[]
  score_breakdown: {
    heart: number
    oxygen: number
    stress: number
    respiration: number
    bp: number
  }
  recommendations: string[]
}

type BackendVitals = {
  heart_rate: number
  spo2: number
  resp_rate: number
  systolic_bp: number
  diastolic_bp: number
}

type LiveData = {
  vitals: BackendVitals
  alerts: { cls: string; msg: string }[]
  ai: AIAgentData
  health_score: number
  risk: string
}

type Alert = { cls: "ok" | "warn" | "danger" | "info"; msg: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const NORMAL = { hr: 72, spo2: 98, rr: 16, bpS: 120, bpD: 80, qrs: 0.09, pr: 0.16, qt: 0.40, hrv: 42 }
const ANALYSIS_INTERVAL_MS = 300_000 // 5 minutes
const WAVEFORM_BUF = 300
const SAMPLE_RATE_MS = 1000 / 30 // ~30 fps

// ─── Helpers ──────────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function noise(scale: number) { return (Math.random() - 0.5) * scale }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
function avg(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0 }
function getStatus(v: number, lo: number, hi: number): "low" | "normal" | "high" {
  return v < lo ? "low" : v > hi ? "high" : "normal"
}
function colorFor(s: "low" | "normal" | "high") {
  return s === "normal" ? "#4ade80" : s === "low" ? "#60a5fa" : "#f87171"
}
function fmtCountdown(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

// ECG P-QRS-T sample (normalised 0–1)
function ecgSample(t: number, hr: number): number {
  const period = 60 / hr
  const ph = (t % period) / period
  if (ph < 0.05) return 0
  if (ph < 0.08) return 0.12
  if (ph < 0.10) return -0.18
  if (ph < 0.13) return 1.0
  if (ph < 0.16) return -0.22
  if (ph < 0.20) return 0
  if (ph < 0.35) return 0.02
  if (ph < 0.40) return 0.22
  if (ph < 0.50) return 0.32
  if (ph < 0.55) return 0.18
  return 0
}

// SpO2 PPG waveform with dicrotic notch
function spo2Sample(t: number, spo2: number): number {
  const period = 60 / 72
  const ph = (t % period) / period
  const amp = 0.35 + (spo2 - 94) * 0.02
  const systolic = Math.max(0, Math.sin(Math.PI * ph * 2))
  const dicrotic = ph > 0.55 && ph < 0.75
    ? 0.28 * Math.sin(Math.PI * (ph - 0.55) / 0.20) : 0
  return clamp(0.5 + amp * (systolic + dicrotic), 0, 1)
}

// Respiratory sinusoid
function respSample(t: number, rr: number): number {
  const period = 60 / rr
  return clamp(0.5 + 0.42 * Math.sin(2 * Math.PI * t / period), 0, 1)
}

// Draw waveform on canvas
function drawWave(canvas: HTMLCanvasElement, buf: number[], color: string, zoom: number) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H)

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.04)"
  ctx.lineWidth = 0.5
  for (let g = 1; g < 4; g++) {
    ctx.beginPath(); ctx.moveTo(0, H * g / 4); ctx.lineTo(W, H * g / 4); ctx.stroke()
  }
  for (let g = 1; g < 6; g++) {
    ctx.beginPath(); ctx.moveTo(W * g / 6, 0); ctx.lineTo(W * g / 6, H); ctx.stroke()
  }

  // Neon glow effect
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.lineWidth = 2 * devicePixelRatio

  ctx.beginPath()
  buf.forEach((v, i) => {
    const x = (i / (buf.length - 1)) * W
    const y = H * 0.08 + H * 0.84 * (1 - clamp(v * zoom, 0, 1))
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  const gradient = ctx.createLinearGradient(0, 0, W, 0)
  gradient.addColorStop(0, "rgba(0,0,0,0)")
  gradient.addColorStop(0.3, color)
  gradient.addColorStop(1, color)

  ctx.strokeStyle = gradient
  ctx.stroke()

  // remove glow for next draw
  ctx.shadowBlur = 0
}

// Build alerts array from 5-min analysis
function buildAlerts(analysis: WaveformAnalysis, lv: LiveVitals): Alert[] {
  const alerts: Alert[] = []

  alerts.push(lv.bpS > 130
    ? { cls: "warn", msg: `BP high → Reduce salt + relax breathing` }
    : { cls: "ok",   msg: `BP normal` })

  if (analysis.avgSpo2 < 95)
    alerts.push({ cls: "danger",  msg: `Low oxygen → Take rest / check breathing` })
  else if (analysis.avgSpo2 < 97)
    alerts.push({ cls: "warn", msg: `SpO2 slightly reduced: ${Math.round(analysis.avgSpo2)}% (5-min avg)` })
  else
    alerts.push({ cls: "ok", msg: `SpO2 adequate: ${Math.round(analysis.avgSpo2)}% (5-min avg)` })

  alerts.push(analysis.qrs >= 0.12
    ? { cls: "warn", msg: `QRS widening (${analysis.qrs.toFixed(2)}s) — possible conduction delay` }
    : { cls: "ok",   msg: `QRS normal (${analysis.qrs.toFixed(2)}s) — no conduction delay` })

  alerts.push(analysis.hrv < 40
    ? { cls: "warn", msg: `Stress detected → Take short walk` }
    : { cls: "info", msg: `Stress level good` })

  alerts.push(analysis.avgRR > 20
    ? { cls: "warn", msg: `Resp rate elevated: ${analysis.avgRR.toFixed(0)} br/m (5-min avg)` }
    : { cls: "info", msg: `Resp rate normal: ${analysis.avgRR.toFixed(0)} br/m (5-min avg)` })

  return alerts
}

// ─── Health Monitor Component ─────────────────────────────────────────────────
function HealthMonitor({ 
  healthData,
  liveData
}: {
  healthData: HealthData | null
  liveData: LiveData | null}) {

  const USER = {
    hr:   healthData?.restingHeartRate      ?? 78,
    spo2: healthData?.spO2                  ?? 96,
    rr:   18,
    bpS:  healthData?.bloodPressureSystolic  ?? 131,
    bpD:  healthData?.bloodPressureDiastolic ?? 88,
    qrs:  0.10, pr: 0.17, qt: 0.42, hrv: 36,
  }

  // ===================== AI HELPERS =====================

  function getBreakdown(lv: LiveVitals, a: WaveformAnalysis) {
    return {
      heart: lv.hr >= 60 && lv.hr <= 100 ? 20 : 10,
      oxygen: lv.spo2 >= 95 ? 20 : 10,
      stress: a.hrv >= 40 ? 20 : 10,
      respiration: lv.rr >= 12 && lv.rr <= 20 ? 20 : 10,
      bp: lv.bpS <= 120 ? 20 : lv.bpS <= 130 ? 15 : 10,
    }
  }

  function getCorrelations(lv: LiveVitals, a: WaveformAnalysis) {
    const res = []
    if (a.hrv < 40 && lv.hr > 90) res.push("High HR + Low HRV → Stress overload")
    if (lv.spo2 < 95 && lv.rr > 20) res.push("Low Oxygen + High Respiration → Fatigue risk")
    if (lv.bpS > 130 && a.hrv < 40) res.push("BP + Stress → Cardiovascular strain")
    return res
  }

  function getPredictions(lv: LiveVitals, a: WaveformAnalysis) {
    const res = []
    if (a.hrv < 35) res.push("⚠️ Fatigue risk in next few hours")
    if (lv.bpS > 135) res.push("⚠️ BP may increase further")
    if (lv.hr > 95) res.push("⚠️ Stress spike likely")
    return res
  }

  function enhanceAlerts(base: Alert[], lv: LiveVitals, a: WaveformAnalysis) {
    return base.map(alert => {
      if (alert.msg.includes("BP elevated")) {
        return { ...alert, msg: `${alert.msg} → Reduce salt + breathing exercise` }
      }
      if (a.hrv < 40) {
        return { ...alert, msg: `Low HRV → Stress detected. Try relaxation` }
      }
      return alert
    })
  }

  function RiskGauge({ score }: { score: number }) {
    const color =
      score >= 80 ? "text-emerald-400" :
      score >= 60 ? "text-amber-400" :
      "text-red-400"

    return (
      <div className="flex flex-col items-center">
        <div className={`text-xl font-bold ${color}`}>{score}</div>
        <div className="text-[10px] text-muted-foreground">Score</div>
      </div>
    )
  }

  // ===================== EXISTING SYSTEM =====================

  const ecgRef = useRef<HTMLCanvasElement>(null)
  const spo2Ref = useRef<HTMLCanvasElement>(null)
  const respRef = useRef<HTMLCanvasElement>(null)

  const [lv, setLv] = useState<LiveVitals>({
    hr: NORMAL.hr,
    spo2: NORMAL.spo2,
    rr: NORMAL.rr,
    bpS: NORMAL.bpS,
    bpD: NORMAL.bpD,
  })

  const [analysis, setAnalysis] = useState<WaveformAnalysis>({
    qrs: 0.09, pr: 0.16, qt: 0.40,
    hrv: 42, dtw: 94, avgHR: 72,
    avgSpo2: 98, avgRR: 16
  })

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [overall, setOverall] = useState<"NORMAL" | "CAUTION" | "ALERT">("NORMAL")
  const [countdown, setCountdown] = useState(300000) // 5 minutes
  const [clock, setClock] = useState<string>("")
  const [paused, setPaused] = useState(false)
  const [zoom, setZoom] = useState(1)

  // ===================== LOOP =====================

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => (prev <= 1000 ? 300000 : prev - 1000))
      setClock(new Date().toLocaleTimeString())
      const newLv = liveData?.vitals
        ? {
            hr: liveData.vitals.heart_rate ?? 75,
            spo2: liveData.vitals.spo2 ?? 98,
            rr: liveData.vitals.resp_rate ?? 16,
            bpS: liveData.vitals.systolic_bp ?? 120,
            bpD: liveData.vitals.diastolic_bp ?? 80,
          }
        : {
            hr: 75,
            spo2: 98,
            rr: 16,
            bpS: 120,
            bpD: 80,
          }

      const newAnalysis = {
        ...analysis,
        hrv: clamp(35 + Math.random() * 10, 20, 60),
        avgHR: newLv.hr,
        avgSpo2: newLv.spo2,
        avgRR: newLv.rr,
      }

      const baseAlerts = buildAlerts(newAnalysis, newLv)
      const smartAlerts = enhanceAlerts(baseAlerts, newLv, newAnalysis)

      setLv(newLv)
      setAnalysis(newAnalysis)
      setAlerts(smartAlerts)

      const warn = newLv.bpS > 130 || newLv.spo2 < 95
      const danger = newLv.spo2 < 90
      setOverall(danger ? "ALERT" : warn ? "CAUTION" : "NORMAL")

    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const ecgBufRef = useRef<number[]>(new Array(WAVEFORM_BUF).fill(0.5))
  const spo2BufRef = useRef<number[]>(new Array(WAVEFORM_BUF).fill(0.5))
  const respBufRef = useRef<number[]>(new Array(WAVEFORM_BUF).fill(0.5))

  useEffect(() => {
    let tick = 0
    let animationId: number

    const ecgBuf = ecgBufRef.current
    const spo2Buf = spo2BufRef.current
    const respBuf = respBufRef.current

    const loop = () => {
      if (!paused) {
        const t = tick * 0.03

        ecgBuf.shift()
        ecgBuf.push(0.5 - ecgSample(t, lv.hr) * 0.4)

        spo2Buf.shift()
        spo2Buf.push(spo2Sample(t, lv.spo2))

        respBuf.shift()
        respBuf.push(respSample(t, lv.rr))

        if (ecgRef.current) drawWave(ecgRef.current, ecgBuf, "#4ade80", zoom)
        if (spo2Ref.current) drawWave(spo2Ref.current, spo2Buf, "#60a5fa", zoom)
        if (respRef.current) drawWave(respRef.current, respBuf, "#c084fc", zoom)

        tick++
      }

      animationId = requestAnimationFrame(loop)
    }

    loop()

    return () => cancelAnimationFrame(animationId)
  }, [paused, zoom, lv])

  useEffect(() => {
    const resize = (c: HTMLCanvasElement | null) => {
      if (!c) return
      const rect = c.parentElement!.getBoundingClientRect()
      c.width = rect.width * devicePixelRatio
      c.height = rect.height * devicePixelRatio
    }

    resize(ecgRef.current)
    resize(spo2Ref.current)
    resize(respRef.current)

    window.addEventListener("resize", () => {
      resize(ecgRef.current)
      resize(spo2Ref.current)
      resize(respRef.current)
    })
  }, [])

  // ===================== AI OUTPUT =====================
  const ai = liveData?.ai
  const predictions = ai?.predictions || []
  const insights = ai?.insights || []
  const recommendations = ai?.recommendations || []
  const breakdown = ai?.score_breakdown || {
    heart: Math.round(lv.hr),
    oxygen: Math.round(lv.spo2),
    stress: Math.round(analysis.hrv),
    respiration: Math.round(lv.rr),
    bp: Math.round(lv.bpS),
  }

  // const breakdown = {
  //   heart: Math.round(lv.hr),
  //   oxygen: Math.round(lv.spo2),
  //   stress: Math.round(analysis.hrv),
  //   respiration: Math.round(lv.rr),
  //   bp: Math.round(lv.bpS),
  // }
  const hs = Object.values(breakdown).reduce((a, b) => a + b, 0)

  // ✅ ADD THIS BLOCK
  const hrSt   = getStatus(lv.hr, 60, 100)
  const spo2St = getStatus(lv.spo2, 95, 100)
  const rrSt   = getStatus(lv.rr, 12, 20)
  const bpOk   = lv.bpS <= 120
  const alertBgClass: Record<Alert["cls"], string> = {
    ok:     "bg-emerald-950 text-emerald-400",
    warn:   "bg-amber-950 text-amber-400",
    danger: "bg-red-950 text-red-400",
    info:   "bg-blue-950 text-blue-400",
  }

  return (
    <div className="flex w-full">
      <div className="flex-1">
      <Card className="border-border/50 bg-[#0a0e14] text-[#e0e0e0]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            AI Health Monitor
          </CardTitle>
          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

            {/* NEW GAUGE */}
            <RiskGauge score={hs} />
            <Badge
              variant="outline"
              className={
                overall === "NORMAL"  ? "border-emerald-700 text-emerald-400 bg-emerald-950" :
                overall === "CAUTION" ? "border-amber-700   text-amber-400   bg-amber-950"   :
                                        "border-red-700     text-red-400     bg-red-950"
              }
            >
              {overall}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{clock}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-0">
        {/* ── Waveforms ── */}
        {(
          [
            { label: "ECG",  val: Math.round(lv.hr),              unit: "bpm",  color: "#4ade80", ref: ecgRef  },
            { label: "SpO2", val: lv.spo2.toFixed(0), unit: "%",    color: "#60a5fa", ref: spo2Ref },
            { label: "RESP", val: Math.round(lv.rr),              unit: "br/m", color: "#c084fc", ref: respRef },
          ] as const
        ).map(w => (
          <div key={w.label} className="flex items-stretch gap-2" style={{ height: 72 }}>
            <div className="w-12 flex flex-col justify-center shrink-0">
              <span className="text-[10px] text-muted-foreground">{w.label}</span>
              <span className="text-base font-mono font-medium leading-tight" style={{ color: w.color }}>
                {w.val}
              </span>
              <span className="text-[9px] text-muted-foreground">{w.unit}</span>
            </div>
            <div className="flex-1 rounded bg-[#070b10] overflow-hidden">
              <canvas ref={w.ref} className="block w-full h-full" />
            </div>
          </div>
        ))}

        {/* ── Vitals strip ── */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {[
            {
              label: "Heart Rate",
              val: Math.round(lv.hr),
              unit: "bpm",
              color: colorFor(hrSt),
              sub: hrSt === "normal" ? "60–100" : hrSt === "high" ? "Elevated" : "Low"
            },
            {
              label: "Blood Press",
              val: `${Math.round(lv.bpS)}/${Math.round(lv.bpD)}`,
              unit: "mmHg",
              color: bpOk ? "#4ade80" : lv.bpS <= 130 ? "#fbbf24" : "#f87171",
              sub: bpOk ? "Normal" : "Elevated"
            },
            {
              label: "O2 Sat",
              val: Math.round(lv.spo2),
              unit: "%",
              color: colorFor(spo2St),
              sub: spo2St === "normal" ? "≥95%" : "Low"
            },
            {
              label: "Resp Rate",
              val: Math.round(lv.rr),
              unit: "br/m",
              color: colorFor(rrSt),
              sub: rrSt === "normal" ? "12–20" : rrSt === "high" ? "Elevated" : "Low"
            },
            {
              label: "Health Score",
              val: String(hs),
              unit: "/100",
              color: hs >= 80 ? "#4ade80" : hs >= 60 ? "#fbbf24" : "#f87171",
              sub: hs >= 80 ? "Good" : hs >= 60 ? "Moderate" : "Risk"
            }
          ].map(v => (
            <div key={v.label} className="bg-[#0d1520] rounded-lg p-2 border border-[#1e2d40]">
              <p className="text-[9px] text-muted-foreground mb-0.5">{v.label}</p>
              <p className="text-base font-mono font-medium leading-tight" style={{ color: v.color }}>{v.val}</p>
              <p className="text-[9px]" style={{ color: v.color }}>{v.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end mb-2">
          <button
            onClick={() => setPaused(p => !p)}
            className="px-2 py-1 text-xs bg-[#111820] rounded"
          >
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>

          <button
            onClick={() => setZoom(z => Math.min(z + 0.2, 3))}
            className="px-2 py-1 text-xs bg-[#111820] rounded"
          >
            +
          </button>

          <button
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
            className="px-2 py-1 text-xs bg-[#111820] rounded"
          >
            -
          </button>
        </div>

        {/* ── Analysis + Alerts (updated every 5 min) ── */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Waveform analysis */}
          <div className="bg-[#0d1520] rounded-lg p-3 border border-[#1e2d40]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Waveform vs Baseline</span>
              <span className="text-[9px] bg-[#111820] text-muted-foreground px-2 py-0.5 rounded">
                {fmtCountdown(countdown)}
              </span>
            </div>
            {[
              { name: "QRS Duration", val: `${analysis.qrs.toFixed(2)}s`, pct: Math.min(100, analysis.qrs / 0.12 * 100), ok: analysis.qrs < 0.12 },
              { name: "PR Interval",  val: `${analysis.pr.toFixed(2)}s`,  pct: Math.min(100, analysis.pr  / 0.20 * 100), ok: analysis.pr  <= 0.20 },
              { name: "QT Interval",  val: `${analysis.qt.toFixed(2)}s`,  pct: Math.min(100, analysis.qt  / 0.44 * 100), ok: analysis.qt  <= 0.44 },
              { name: "HRV (RMSSD)",  val: `${analysis.hrv.toFixed(2)}ms`,           pct: Math.min(100, analysis.hrv / 60  * 100),  ok: analysis.hrv >= 40 },
              { name: "DTW Match",    val: `${analysis.dtw}%`,            pct: analysis.dtw,                              ok: analysis.dtw >= 90 },
            ].map(m => (
              <div key={m.name} className="flex items-center justify-between text-[10px] py-1 border-b border-[#151f2e] last:border-0">
                <span className="text-muted-foreground w-24 shrink-0">{m.name}</span>
                <div className="w-14 h-1 bg-[#1e2d40] rounded-full overflow-hidden mx-2 shrink-0">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.round(m.pct)}%`, background: m.ok ? "#4ade80" : "#fbbf24" }}
                  />
                </div>
                <span className="font-mono" style={{ color: m.ok ? "#4ade80" : "#fbbf24" }}>{m.val}</span>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div className="bg-[#0d1520] rounded-lg p-3 border border-[#1e2d40]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Alerts &amp; Insights</span>
              <span className="text-[9px] bg-[#111820] text-muted-foreground px-2 py-0.5 rounded">
                {fmtCountdown(countdown)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {alerts.map((a, i) => (
                <div key={i} className={`text-[10px] px-2 py-1 rounded ${alertBgClass[a.cls]}`}>
                  {a.msg}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[9px] text-muted-foreground text-right font-mono">
          Waveforms live @ 30fps · Vitals every 1s · Analysis every 5 min
        </p>
      </CardContent>
      </Card>
    </div>

    {/* RIGHT AI PANEL */}
    <AIHealthPanel
      alerts={liveData?.alerts || alerts}
      predictions={predictions}
      insights={insights}
      breakdown={breakdown}
      recommendations={recommendations}
      score={hs}
    />

  </div>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [liveData, setLiveData] = useState<LiveData | null>(null)

  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null

  // Fetch user health data
  useEffect(() => {
    if (!userId) { window.location.href = "/login"; return }

    fetch(`http://127.0.0.1:8001/user/health/${userId}`)
      .then(res => {
        if (res.status === 404) { window.location.href = "/health-form"; return null }
        return res.json()
      })
      .then(data => {
        if (!data) return
        setHealthData(data)
        fetch(`http://127.0.0.1:8001/analytics/weekly/${userId}`)
          .then(r => r.json())
          .then(setWeeklyData)
      })
      .catch(() => { window.location.href = "/login" })
  }, [userId])

  // WebSocket for live data
  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8001/ws/health")
    socket.onmessage = (event) => setLiveData(JSON.parse(event.data))
    return () => socket.close()
  }, [])

  // Calculate health score
  const calculateHealthScore = (): number => {
    if (!healthData) return 75
    let score = 70
    if (healthData.restingHeartRate) {
      if (healthData.restingHeartRate >= 60 && healthData.restingHeartRate <= 80) score += 5
      else if (healthData.restingHeartRate > 100) score -= 10
    }
    if (healthData.stepsPerDay) {
      if (healthData.stepsPerDay >= 10000) score += 10
      else if (healthData.stepsPerDay >= 7000) score += 5
      else if (healthData.stepsPerDay < 3000) score -= 5
    }
    if (healthData.sleepHours) {
      if (healthData.sleepHours >= 7 && healthData.sleepHours <= 9) score += 5
      else if (healthData.sleepHours < 6) score -= 5
    }
    if (healthData.stressLevel <= 2) score += 5
    else if (healthData.stressLevel >= 4) score -= 5
    if (healthData.spO2 && healthData.spO2 >= 95) score += 5
    else if (healthData.spO2 && healthData.spO2 < 92) score -= 10
    return Math.max(0, Math.min(100, score))
  }

  const healthScore = liveData?.health_score || calculateHealthScore()
  const healthStatus = healthScore >= 80 ? "Good" : healthScore >= 60 ? "Moderate" : "Risk"

  const metrics = {
    heartRate: liveData?.vitals?.heart_rate || healthData?.restingHeartRate || 72,
    // steps:     liveData?.vitals?.steps      || healthData?.stepsPerDay      || 8432,
    steps: healthData?.stepsPerDay || 8432,
    sleep: healthData?.sleepHours  || 7.5,
    calories:  1847,
    stress:    liveData?.risk               || healthData?.stressLevel      || 2,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.fullName || healthData?.fullName || "User"}
          </h1>
          <p className="text-muted-foreground">{"Here's your health overview for today"}</p>
        </div>
        <div className="flex items-center gap-3">
          <HealthScore score={healthScore} />
          <Badge
            variant={healthStatus === "Good" ? "default" : healthStatus === "Moderate" ? "secondary" : "destructive"}
            className="text-sm py-1 px-3"
          >
            {healthStatus}
          </Badge>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Heart Rate" value={metrics.heartRate}              unit="bpm"   icon={HeartPulse} trend={-2} gradient="from-red-500/20 to-red-600/10"     iconColor="text-red-500"     />
        <MetricCard title="Steps"      value={metrics.steps.toLocaleString()} unit="steps" icon={Footprints} trend={12} gradient="from-emerald-500/20 to-emerald-600/10" iconColor="text-emerald-500" />
        <MetricCard title="Sleep"      value={metrics.sleep}                  unit="hrs"   icon={Moon}       trend={5}  gradient="from-blue-500/20 to-blue-600/10"    iconColor="text-blue-500"    />
        <MetricCard title="Calories"   value={metrics.calories.toLocaleString()} unit="kcal" icon={Flame}   trend={-3} gradient="from-orange-500/20 to-orange-600/10" iconColor="text-orange-500"  />
        <MetricCard title="Stress"     value={metrics.stress}                 unit="/5"    icon={Brain}      trend={-8} gradient="from-purple-500/20 to-purple-600/10" iconColor="text-purple-500" invertTrend />
      </div>

      {/* ── Real-Time Health Monitor (full width) ── */}
      <HealthMonitor healthData={healthData} liveData={liveData} />

      {/* Analytics & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Overview</CardTitle>
            <CardDescription>Your health metrics over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart data={weeklyData || []} />
          </CardContent>
        </Card>

        {/* AI Insights Panel (replaces old AlertsPanel) */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI Insights
            </CardTitle>
            <CardDescription>Predictions, recommendations & alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Predictions */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Predictions</p>
              {(liveData?.ai?.predictions || []).length > 0 ? (
                <div className="space-y-1.5">
                  {(liveData?.ai?.predictions || []).map((p: string, i: number) => (
                    <div key={i} className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                      {p}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No risk predictions ✓</p>
              )}
            </div>

            {/* Insights */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Insights</p>
              {(liveData?.ai?.insights || []).length > 0 ? (
                <div className="space-y-1.5">
                  {(liveData?.ai?.insights || []).map((c: string, i: number) => (
                    <div key={i} className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-lg">
                      {c}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Vitals correlations stable ✓</p>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recommendations</p>
              {(liveData?.ai?.recommendations || []).length > 0 ? (
                <div className="space-y-1.5">
                  {(liveData?.ai?.recommendations || []).map((r: string, i: number) => (
                    <div key={i} className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg">
                      • {r}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-blue-400 space-y-1">
                  <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg">• Stay hydrated 💧</div>
                  <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg">• Take short breaks 🧘</div>
                </div>
              )}
            </div>

            {/* Alerts & Insights */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Alerts & Insights</p>
              <div className="space-y-1.5">
                {(liveData?.alerts || []).map((a: any, i: number) => {
                  const colorMap: Record<string, string> = {
                    danger: "text-red-400 bg-red-500/10 border-red-500/20",
                    warn: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                    ok: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                    info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                  }
                  return (
                    <div key={i} className={`text-xs px-3 py-2 rounded-lg border ${colorMap[a.cls] || colorMap.info}`}>
                      {a.msg}
                    </div>
                  )
                })}
                {(liveData?.alerts || []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No active alerts ✓</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals */}
      <GoalsPanel steps={metrics.steps} calories={metrics.calories} sleep={metrics.sleep} />
    </div>
  )
}