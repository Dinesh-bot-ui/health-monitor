"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Footprints, Flame, Moon, Droplets } from "lucide-react"

type GoalsPanelProps = {
  steps: number
  calories: number
  sleep: number
}

const goals = [
  { key: "steps", label: "Daily Steps", target: 10000, unit: "steps", icon: Footprints, color: "bg-emerald-500" },
  { key: "calories", label: "Calories Burned", target: 2000, unit: "kcal", icon: Flame, color: "bg-orange-500" },
  { key: "sleep", label: "Sleep Hours", target: 8, unit: "hours", icon: Moon, color: "bg-blue-500" },
  { key: "water", label: "Water Intake", target: 8, unit: "glasses", icon: Droplets, color: "bg-cyan-500" },
]

export function GoalsPanel({ steps, calories, sleep }: GoalsPanelProps) {
  const values: Record<string, number> = {
    steps,
    calories,
    sleep,
    water: 5, // Mock water intake
  }

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="text-lg">Daily Goals</CardTitle>
        <CardDescription>Track your progress towards daily targets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.map((goal) => {
            const current = values[goal.key] || 0
            const progress = Math.min((current / goal.target) * 100, 100)
            
            return (
              <div key={goal.key} className="space-y-3 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${goal.color}/20`}>
                    <goal.icon className={`h-4 w-4 ${goal.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{goal.label}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      {current.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {goal.target.toLocaleString()} {goal.unit}
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {progress.toFixed(0)}% complete
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
