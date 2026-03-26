"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Moon, Sun, Clock, TrendingUp, Bed, Zap } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Bar, BarChart } from "recharts"

const weeklySleep = [
  { day: "Mon", hours: 7.2, quality: 75 },
  { day: "Tue", hours: 6.8, quality: 65 },
  { day: "Wed", hours: 7.5, quality: 80 },
  { day: "Thu", hours: 8.0, quality: 85 },
  { day: "Fri", hours: 7.3, quality: 78 },
  { day: "Sat", hours: 8.5, quality: 90 },
  { day: "Sun", hours: 7.8, quality: 82 },
]

const sleepCycles = [
  { time: "11PM", stage: "Awake", value: 4 },
  { time: "12AM", stage: "Light", value: 2 },
  { time: "1AM", stage: "Deep", value: 1 },
  { time: "2AM", stage: "Deep", value: 1 },
  { time: "3AM", stage: "Light", value: 2 },
  { time: "4AM", stage: "REM", value: 3 },
  { time: "5AM", stage: "Light", value: 2 },
  { time: "6AM", stage: "Awake", value: 4 },
]

export default function SleepAnalysisPage() {
  const [healthData, setHealthData] = useState<{ sleepHours: number | null; sleepQuality: string | null } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('healthpulse_health_data')
    if (stored) {
      setHealthData(JSON.parse(stored))
    }
  }, [])

  const sleepHours = healthData?.sleepHours || 7.5
  const sleepGoal = 8
  const sleepQuality = healthData?.sleepQuality || 'good'

  const getSleepScore = () => {
    if (sleepQuality === 'good' && sleepHours >= 7) return 85
    if (sleepQuality === 'average') return 70
    return 55
  }

  const sleepScore = getSleepScore()

  const averageSleep = weeklySleep.reduce((acc, d) => acc + d.hours, 0) / weeklySleep.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sleep Analysis</h1>
        <p className="text-muted-foreground">Track your sleep patterns and quality</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-gradient-to-br from-blue-500/20 to-blue-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Moon className="h-6 w-6 text-blue-500" />
              <Badge className="bg-blue-500 text-white">Last Night</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Sleep Duration</p>
            <p className="text-3xl font-bold text-foreground">{sleepHours}h</p>
            <p className="text-xs text-muted-foreground">Goal: {sleepGoal} hours</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-purple-500/20 to-purple-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Zap className="h-6 w-6 text-purple-500" />
              <Badge className={`${sleepScore >= 80 ? 'bg-emerald-500' : sleepScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                {sleepScore >= 80 ? 'Excellent' : sleepScore >= 60 ? 'Good' : 'Poor'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Sleep Score</p>
            <p className="text-3xl font-bold text-foreground">{sleepScore}</p>
            <Progress value={sleepScore} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-amber-500/20 to-amber-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Bed className="h-6 w-6 text-amber-500" />
              <Sun className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground">Bedtime</p>
            <p className="text-3xl font-bold text-foreground">11:00 PM</p>
            <p className="text-xs text-muted-foreground">Wake: 6:30 AM</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Clock className="h-6 w-6 text-emerald-500" />
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground">Weekly Average</p>
            <p className="text-3xl font-bold text-foreground">{averageSleep.toFixed(1)}h</p>
            <p className="text-xs text-emerald-500">+0.3h vs last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Sleep Cycles */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg">Sleep Cycles (Last Night)</CardTitle>
          <CardDescription>Your sleep stages throughout the night</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sleepCycles}>
                <defs>
                  <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis 
                  domain={[0, 4]} 
                  ticks={[1, 2, 3, 4]}
                  tickFormatter={(value) => {
                    const labels: Record<number, string> = { 1: 'Deep', 2: 'Light', 3: 'REM', 4: 'Awake' }
                    return labels[value] || ''
                  }}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Area
                  type="stepAfter"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#sleepGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-900" />
              <span className="text-sm text-muted-foreground">Deep Sleep</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">Light Sleep</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-muted-foreground">REM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-sm text-muted-foreground">Awake</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Sleep Chart */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Sleep Duration</CardTitle>
          <CardDescription>Hours of sleep per night this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySleep}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sleep Quality Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
              <Moon className="h-6 w-6 text-blue-400" />
            </div>
            <p className="text-sm text-muted-foreground">Deep Sleep</p>
            <p className="text-2xl font-bold text-foreground">1h 45m</p>
            <p className="text-xs text-muted-foreground">23% of total sleep</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center mx-auto mb-3">
              <Moon className="h-6 w-6 text-blue-300" />
            </div>
            <p className="text-sm text-muted-foreground">Light Sleep</p>
            <p className="text-2xl font-bold text-foreground">3h 30m</p>
            <p className="text-xs text-muted-foreground">47% of total sleep</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-purple-400" />
            </div>
            <p className="text-sm text-muted-foreground">REM Sleep</p>
            <p className="text-2xl font-bold text-foreground">2h 15m</p>
            <p className="text-xs text-muted-foreground">30% of total sleep</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
