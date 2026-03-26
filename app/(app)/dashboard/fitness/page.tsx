"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Footprints,
  Flame,
  Timer,
  Trophy,
  TrendingUp,
  Dumbbell,
  Target,
  Calendar,
  Zap,
  ArrowRight,
  Star,
  Clock,
  BarChart3,
  Sparkles,
  Brain,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Line,
  LineChart,
  Tooltip,
} from "recharts"

// ─── Extended Workout History ─────────────────────────────────────────────────
const workoutHistory = [
  { date: "Today", day: "Tue", type: "Walking", duration: 45, calories: 180, intensity: "Moderate", muscles: ["Legs", "Core"] },
  { date: "Yesterday", day: "Mon", type: "Gym - Upper Body", duration: 60, calories: 350, intensity: "High", muscles: ["Chest", "Arms", "Shoulders"] },
  { date: "Mar 23", day: "Sun", type: "Rest Day", duration: 0, calories: 0, intensity: "None", muscles: [] },
  { date: "Mar 22", day: "Sat", type: "Running", duration: 35, calories: 320, intensity: "High", muscles: ["Legs", "Core"] },
  { date: "Mar 21", day: "Fri", type: "Yoga", duration: 40, calories: 120, intensity: "Low", muscles: ["Full Body", "Flexibility"] },
  { date: "Mar 20", day: "Thu", type: "Gym - Lower Body", duration: 55, calories: 380, intensity: "High", muscles: ["Legs", "Glutes", "Core"] },
  { date: "Mar 19", day: "Wed", type: "Swimming", duration: 30, calories: 280, intensity: "Moderate", muscles: ["Full Body"] },
  { date: "Mar 18", day: "Tue", type: "Walking", duration: 50, calories: 200, intensity: "Moderate", muscles: ["Legs"] },
  { date: "Mar 17", day: "Mon", type: "Gym - Upper Body", duration: 65, calories: 400, intensity: "High", muscles: ["Chest", "Back", "Arms"] },
  { date: "Mar 16", day: "Sun", type: "Cycling", duration: 45, calories: 310, intensity: "Moderate", muscles: ["Legs", "Core"] },
]

const weeklySteps = [
  { day: "Mon", steps: 8200, calories: 320 },
  { day: "Tue", steps: 9100, calories: 380 },
  { day: "Wed", steps: 7800, calories: 290 },
  { day: "Thu", steps: 10200, calories: 420 },
  { day: "Fri", steps: 8900, calories: 360 },
  { day: "Sat", steps: 12500, calories: 520 },
  { day: "Sun", steps: 6500, calories: 250 },
]

// ─── AI Fitness Plan Generator ────────────────────────────────────────────────
function generateNextDayPlan(history: typeof workoutHistory) {
  const recentWorkouts = history.slice(0, 7) // last 7 days
  const recentTypes = recentWorkouts.map(w => w.type.toLowerCase())
  const recentMuscles = recentWorkouts.flatMap(w => w.muscles)
  const avgDuration = Math.round(
    recentWorkouts.filter(w => w.duration > 0).reduce((a, b) => a + b.duration, 0) /
    Math.max(1, recentWorkouts.filter(w => w.duration > 0).length)
  )
  const avgCalories = Math.round(
    recentWorkouts.filter(w => w.calories > 0).reduce((a, b) => a + b.calories, 0) /
    Math.max(1, recentWorkouts.filter(w => w.calories > 0).length)
  )

  // Check what was done recently
  const hadUpperBody = recentTypes.some(t => t.includes("upper"))
  const hadLowerBody = recentTypes.some(t => t.includes("lower"))
  const hadCardio = recentTypes.some(t => t.includes("running") || t.includes("cycling") || t.includes("swimming"))
  const hadYoga = recentTypes.some(t => t.includes("yoga"))
  const todayType = recentWorkouts[0]?.type.toLowerCase() || ""
  const yesterdayType = recentWorkouts[1]?.type.toLowerCase() || ""
  const consecutiveHighIntensity = recentWorkouts.filter((w, i) => i < 2 && w.intensity === "High").length

  // Muscle group frequency
  const muscleFreq: Record<string, number> = {}
  recentMuscles.forEach(m => { muscleFreq[m] = (muscleFreq[m] || 0) + 1 })
  const overworkedMuscles = Object.entries(muscleFreq).filter(([, v]) => v >= 3).map(([k]) => k)
  const neglectedMuscles = ["Chest", "Back", "Arms", "Legs", "Core", "Shoulders"]
    .filter(m => !recentMuscles.includes(m))

  // Build recommendation
  const plan: {
    title: string
    exercises: { name: string; sets: string; duration: string; icon: string }[]
    reasoning: string[]
    targetDuration: number
    targetCalories: number
    intensity: string
    warmup: string
    cooldown: string
  } = {
    title: "",
    exercises: [],
    reasoning: [],
    targetDuration: avgDuration,
    targetCalories: avgCalories,
    intensity: "Moderate",
    warmup: "5 min light jog + dynamic stretching",
    cooldown: "5 min walk + static stretching",
  }

  // Decision logic
  if (consecutiveHighIntensity >= 2) {
    // Need recovery
    plan.title = "Active Recovery & Flexibility"
    plan.intensity = "Low"
    plan.targetDuration = 35
    plan.targetCalories = 150
    plan.exercises = [
      { name: "Foam Rolling", sets: "10 min", duration: "Full body", icon: "🧘" },
      { name: "Yoga Flow", sets: "15 min", duration: "Sun Salutations", icon: "🌅" },
      { name: "Light Stretching", sets: "10 min", duration: "Focus on tight areas", icon: "🤸" },
      { name: "Meditation", sets: "5 min", duration: "Breathing focus", icon: "🧠" },
    ]
    plan.reasoning = [
      "You've had 2 consecutive high-intensity days — recovery prevents overtraining",
      overworkedMuscles.length > 0 ? `${overworkedMuscles.join(", ")} are overworked this week` : "Light movement aids recovery",
      "Active recovery improves flexibility and reduces injury risk",
    ]
  } else if (todayType.includes("upper") || yesterdayType.includes("upper")) {
    // Did upper body recently → do lower body or cardio
    plan.title = "Lower Body Strength"
    plan.intensity = "High"
    plan.targetDuration = 50
    plan.targetCalories = 380
    plan.exercises = [
      { name: "Barbell Squats", sets: "4 × 8-10", duration: "12 min", icon: "🏋️" },
      { name: "Romanian Deadlifts", sets: "3 × 10", duration: "10 min", icon: "💪" },
      { name: "Leg Press", sets: "3 × 12", duration: "8 min", icon: "🦵" },
      { name: "Walking Lunges", sets: "3 × 12 each", duration: "8 min", icon: "🚶" },
      { name: "Calf Raises", sets: "4 × 15", duration: "6 min", icon: "⚡" },
      { name: "Plank Hold", sets: "3 × 60s", duration: "4 min", icon: "🏗️" },
    ]
    plan.reasoning = [
      "Upper body was trained recently — alternating muscle groups for optimal recovery",
      neglectedMuscles.includes("Legs") ? "Legs haven't been trained this week" : "Balanced push/pull split",
      "Compound movements maximize calorie burn and strength gains",
    ]
  } else if (todayType.includes("lower") || yesterdayType.includes("lower")) {
    plan.title = "Upper Body Strength"
    plan.intensity = "High"
    plan.targetDuration = 50
    plan.targetCalories = 350
    plan.exercises = [
      { name: "Bench Press", sets: "4 × 8-10", duration: "12 min", icon: "🏋️" },
      { name: "Bent-over Rows", sets: "4 × 10", duration: "10 min", icon: "💪" },
      { name: "Overhead Press", sets: "3 × 10", duration: "8 min", icon: "🤸" },
      { name: "Pull-ups / Lat Pulldown", sets: "3 × 8-12", duration: "8 min", icon: "🧗" },
      { name: "Bicep Curls", sets: "3 × 12", duration: "5 min", icon: "💪" },
      { name: "Tricep Dips", sets: "3 × 12", duration: "5 min", icon: "⚡" },
    ]
    plan.reasoning = [
      "Lower body was trained recently — switching to upper body for balanced training",
      "Push/pull balance ensures even development",
      "Mix of compound and isolation exercises for strength + hypertrophy",
    ]
  } else if (todayType.includes("walk") || todayType.includes("rest")) {
    plan.title = "Cardio + Core Circuit"
    plan.intensity = "Moderate-High"
    plan.targetDuration = 45
    plan.targetCalories = 400
    plan.exercises = [
      { name: "Interval Running", sets: "20 min", duration: "1 min fast / 1 min walk", icon: "🏃" },
      { name: "Mountain Climbers", sets: "3 × 30s", duration: "5 min", icon: "⛰️" },
      { name: "Burpees", sets: "3 × 10", duration: "6 min", icon: "💥" },
      { name: "Russian Twists", sets: "3 × 20", duration: "5 min", icon: "🔄" },
      { name: "Bicycle Crunches", sets: "3 × 15", duration: "4 min", icon: "🚲" },
      { name: "Jump Rope", sets: "3 × 2 min", duration: "8 min", icon: "🪢" },
    ]
    plan.reasoning = [
      "After rest/walking day, a cardio-core session boosts metabolism",
      !hadCardio ? "No cardio in recent days — cardiovascular training is overdue" : "Varied cardio improves endurance",
      "Core stability is fundamental for all other exercises",
    ]
  } else {
    plan.title = "Full Body Functional Training"
    plan.intensity = "Moderate"
    plan.targetDuration = 45
    plan.targetCalories = 350
    plan.exercises = [
      { name: "Kettlebell Swings", sets: "4 × 15", duration: "8 min", icon: "🔔" },
      { name: "Goblet Squats", sets: "3 × 12", duration: "8 min", icon: "🏋️" },
      { name: "Push-ups", sets: "3 × 15", duration: "6 min", icon: "💪" },
      { name: "TRX Rows", sets: "3 × 12", duration: "6 min", icon: "🧗" },
      { name: "Box Jumps", sets: "3 × 10", duration: "6 min", icon: "📦" },
      { name: "Farmer's Walk", sets: "3 × 40m", duration: "5 min", icon: "🚶" },
    ]
    plan.reasoning = [
      "Functional movements improve daily performance and athleticism",
      "Full-body sessions are efficient when no specific muscles need targeting",
      `Your average workout is ${avgDuration} min — this plan matches your capacity`,
    ]
  }

  return plan
}

// ─── Intensity Badge Colors ───────────────────────────────────────────────────
function getIntensityColor(intensity: string) {
  switch (intensity) {
    case "High":     return "bg-red-500/20 text-red-400 border-red-500/30"
    case "Moderate": return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "Low":      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    default:         return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

function getWorkoutIcon(type: string) {
  const t = type.toLowerCase()
  if (t.includes("gym") || t.includes("upper") || t.includes("lower")) return "🏋️"
  if (t.includes("running")) return "🏃"
  if (t.includes("yoga")) return "🧘"
  if (t.includes("swimming")) return "🏊"
  if (t.includes("cycling")) return "🚴"
  if (t.includes("walking")) return "🚶"
  if (t.includes("rest")) return "😴"
  return "💪"
}

export default function FitnessTrackingPage() {
  const [healthData, setHealthData] = useState<{ stepsPerDay: number | null; exerciseType: string[] } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('healthpulse_health_data')
    if (stored) {
      setHealthData(JSON.parse(stored))
    }
  }, [])

  const currentSteps = healthData?.stepsPerDay || 8432
  const stepsGoal = 10000
  const stepsProgress = Math.min((currentSteps / stepsGoal) * 100, 100)

  const totalCalories = 1847
  const caloriesGoal = 2000
  const activeMinutes = 45
  const activeMinutesGoal = 60

  // Generate AI fitness plan based on history
  const nextDayPlan = useMemo(() => generateNextDayPlan(workoutHistory), [])

  // Stats from history
  const totalWorkouts = workoutHistory.filter(w => w.duration > 0).length
  const totalDuration = workoutHistory.filter(w => w.duration > 0).reduce((a, b) => a + b.duration, 0)
  const totalCalsBurned = workoutHistory.filter(w => w.calories > 0).reduce((a, b) => a + b.calories, 0)
  const streak = (() => {
    let s = 0
    for (const w of workoutHistory) {
      if (w.duration > 0) s++
      else break
    }
    return s
  })()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fitness Tracking</h1>
        <p className="text-muted-foreground">Monitor your workouts, track progress & get AI-powered recommendations</p>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Footprints className="h-6 w-6 text-emerald-500" />
              <Badge className="bg-emerald-500 text-white">{stepsProgress.toFixed(0)}%</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Steps Today</p>
            <p className="text-3xl font-bold text-foreground">{currentSteps.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Goal: {stepsGoal.toLocaleString()}</p>
            <Progress value={stepsProgress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-orange-500/20 to-orange-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Flame className="h-6 w-6 text-orange-500" />
              <Badge className="bg-orange-500 text-white">{((totalCalories / caloriesGoal) * 100).toFixed(0)}%</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Calories Burned</p>
            <p className="text-3xl font-bold text-foreground">{totalCalories}</p>
            <p className="text-xs text-muted-foreground">Goal: {caloriesGoal} kcal</p>
            <Progress value={(totalCalories / caloriesGoal) * 100} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-blue-500/20 to-blue-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Timer className="h-6 w-6 text-blue-500" />
              <Badge className="bg-blue-500 text-white">{((activeMinutes / activeMinutesGoal) * 100).toFixed(0)}%</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Active Minutes</p>
            <p className="text-3xl font-bold text-foreground">{activeMinutes}</p>
            <p className="text-xs text-muted-foreground">Goal: {activeMinutesGoal} min</p>
            <Progress value={(activeMinutes / activeMinutesGoal) * 100} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-purple-500/20 to-purple-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Trophy className="h-6 w-6 text-purple-500" />
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground">Workout Streak</p>
            <p className="text-3xl font-bold text-foreground">{streak} days</p>
            <p className="text-xs text-emerald-500">Keep it going! 🔥</p>
          </CardContent>
        </Card>
      </div>

      {/* ── AI Recommended Next-Day Fitness Plan ── */}
      <Card className="border-border/50 bg-gradient-to-br from-violet-500/10 via-card/80 to-blue-500/10 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-500/30 border border-violet-500/20">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Tomorrow&apos;s AI Fitness Plan
                <Badge className="bg-violet-500/20 text-violet-400 border border-violet-500/30 text-[10px]">
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription>Personalized based on your workout history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Header */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
            <div>
              <h3 className="text-xl font-bold text-foreground">{nextDayPlan.title}</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{nextDayPlan.targetDuration} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Flame className="h-4 w-4" />
                  <span>~{nextDayPlan.targetCalories} kcal</span>
                </div>
                <Badge className={`text-[10px] ${getIntensityColor(nextDayPlan.intensity)}`}>
                  {nextDayPlan.intensity}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Calendar className="h-5 w-5 text-violet-400 mb-1" />
              <span className="text-xs text-violet-400 font-semibold">Tomorrow</span>
            </div>
          </div>

          {/* Warm-up */}
          <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
            🔥 <strong>Warm-up:</strong> {nextDayPlan.warmup}
          </div>

          {/* Exercises */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nextDayPlan.exercises.map((ex, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors"
              >
                <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
                  {ex.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{ex.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{ex.sets}</span>
                    <span className="text-[10px] text-muted-foreground/60">·</span>
                    <span className="text-xs text-muted-foreground">{ex.duration}</span>
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-foreground">#{i + 1}</div>
              </div>
            ))}
          </div>

          {/* Cool-down */}
          <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
            ❄️ <strong>Cool-down:</strong> {nextDayPlan.cooldown}
          </div>

          {/* AI Reasoning */}
          <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400 mb-2 flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5" />
              Why this plan?
            </p>
            <div className="space-y-1.5">
              {nextDayPlan.reasoning.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3 mt-0.5 text-violet-400 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Charts */}
      <Tabs defaultValue="steps" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="calories">Calories</TabsTrigger>
        </TabsList>

        <TabsContent value="steps">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Steps</CardTitle>
              <CardDescription>Your step count over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklySteps}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-4 p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Average</p>
                  <p className="text-lg font-bold text-foreground">
                    {Math.round(weeklySteps.reduce((acc, d) => acc + d.steps, 0) / 7).toLocaleString()} steps
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Steps</p>
                  <p className="text-lg font-bold text-foreground">
                    {weeklySteps.reduce((acc, d) => acc + d.steps, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calories">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Calories</CardTitle>
              <CardDescription>Calories burned through activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklySteps}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Extended Workout History ── */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Workout History
              </CardTitle>
              <CardDescription>Your complete workout log with detailed metrics</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{totalWorkouts}</p>
                <p className="text-[10px] text-muted-foreground">Workouts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{totalDuration}</p>
                <p className="text-[10px] text-muted-foreground">Total Mins</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-orange-400">{totalCalsBurned.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Cals Burned</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workoutHistory.map((workout, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  workout.duration === 0
                    ? "bg-muted/20 border-border/30 opacity-60"
                    : "bg-muted/50 border-border/50 hover:bg-muted/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
                    {getWorkoutIcon(workout.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{workout.type}</p>
                      <Badge className={`text-[9px] ${getIntensityColor(workout.intensity)}`}>
                        {workout.intensity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{workout.date} ({workout.day})</p>
                      {workout.muscles.length > 0 && (
                        <>
                          <span className="text-muted-foreground/40">·</span>
                          <p className="text-xs text-muted-foreground">{workout.muscles.join(", ")}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {workout.duration > 0 && (
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="font-medium text-foreground">{workout.duration} min</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Timer className="h-3 w-3" /> Duration
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-orange-400">{workout.calories} kcal</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Flame className="h-3 w-3" /> Calories
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
