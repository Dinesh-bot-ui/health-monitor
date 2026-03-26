"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Smile, Frown, Meh, TrendingUp, TrendingDown, Sparkles } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

const weeklyMood = [
  { day: "Mon", stress: 3, anxiety: 2, mood: 4 },
  { day: "Tue", stress: 4, anxiety: 3, mood: 3 },
  { day: "Wed", stress: 2, anxiety: 2, mood: 4 },
  { day: "Thu", stress: 3, anxiety: 2, mood: 4 },
  { day: "Fri", stress: 4, anxiety: 3, mood: 3 },
  { day: "Sat", stress: 2, anxiety: 1, mood: 5 },
  { day: "Sun", stress: 2, anxiety: 1, mood: 5 },
]

const tips = [
  {
    title: "Practice Deep Breathing",
    description: "Take 5-10 minutes to practice deep breathing exercises to reduce stress.",
    icon: Sparkles,
  },
  {
    title: "Stay Physically Active",
    description: "Regular exercise releases endorphins that improve your mood naturally.",
    icon: Sparkles,
  },
  {
    title: "Maintain Sleep Schedule",
    description: "Consistent sleep patterns help regulate mood and reduce anxiety.",
    icon: Sparkles,
  },
]

export default function MentalWellnessPage() {
  const [healthData, setHealthData] = useState<{ stressLevel: number; anxiety: string; mood: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('healthpulse_health_data')
    if (stored) {
      setHealthData(JSON.parse(stored))
    }
  }, [])

  const stressLevel = healthData?.stressLevel || 2
  const anxietyLevel = healthData?.anxiety || 'sometimes'
  const currentMood = healthData?.mood || 'neutral'

  const getMoodIcon = () => {
    switch (currentMood) {
      case 'happy': return Smile
      case 'low': return Frown
      default: return Meh
    }
  }

  const getMoodColor = () => {
    switch (currentMood) {
      case 'happy': return 'text-emerald-500'
      case 'low': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  const MoodIcon = getMoodIcon()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mental Wellness</h1>
        <p className="text-muted-foreground">Track and improve your mental health</p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-6 text-center">
            <div className={`mx-auto mb-3 p-4 rounded-full bg-muted/50 w-fit ${getMoodColor()}`}>
              <MoodIcon className="h-8 w-8" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Current Mood</p>
            <p className="text-xl font-bold text-foreground capitalize">{currentMood}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Stress Level</p>
              <Badge variant={stressLevel <= 2 ? 'default' : stressLevel <= 3 ? 'secondary' : 'destructive'}>
                {stressLevel <= 2 ? 'Low' : stressLevel <= 3 ? 'Moderate' : 'High'}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-2xl text-foreground">{stressLevel}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
              <Progress value={stressLevel * 20} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Anxiety</p>
              <Badge variant={anxietyLevel === 'never' ? 'default' : anxietyLevel === 'sometimes' ? 'secondary' : 'destructive'}>
                {anxietyLevel === 'never' ? 'None' : anxietyLevel === 'sometimes' ? 'Occasional' : 'Frequent'}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-foreground capitalize">{anxietyLevel}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {anxietyLevel === 'never' ? 'Great job maintaining calm!' : 
               anxietyLevel === 'sometimes' ? 'Consider relaxation techniques' : 
               'Please consult a professional'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Mental Health Trends</CardTitle>
          <CardDescription>Track your stress, anxiety, and mood over the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyMood}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Bar dataKey="stress" fill="#ef4444" radius={[4, 4, 0, 0]} name="Stress" />
                <Bar dataKey="anxiety" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Anxiety" />
                <Bar dataKey="mood" fill="#10b981" radius={[4, 4, 0, 0]} name="Mood" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-muted-foreground">Stress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-muted-foreground">Anxiety</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-muted-foreground">Mood</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Recommendations */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg">Wellness Tips</CardTitle>
          <CardDescription>Personalized recommendations to improve your mental health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tips.map((tip, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <tip.icon className="h-5 w-5 text-primary" />
                  <p className="font-medium text-foreground">{tip.title}</p>
                </div>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
