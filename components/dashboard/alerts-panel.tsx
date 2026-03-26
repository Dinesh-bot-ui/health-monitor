"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react"

const alerts = [
  {
    type: "warning",
    title: "Low Sleep Duration",
    description: "You've averaged 6.2 hours of sleep this week. Aim for 7-9 hours.",
    icon: AlertTriangle,
  },
  {
    type: "tip",
    title: "Hydration Reminder",
    description: "Based on your activity, consider drinking more water today.",
    icon: Lightbulb,
  },
  {
    type: "success",
    title: "Step Goal Progress",
    description: "Great job! You're on track to meet your daily step goal.",
    icon: CheckCircle2,
  },
]

export function AlertsPanel({ alerts }: { alerts: any[] }) {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="text-lg">Alerts & Insights</CardTitle>
        <CardDescription>AI-powered health recommendations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => {
        // Map backend alert class → UI type
        const type =
          alert.cls === "danger"
            ? "warning"
            : alert.cls === "warn"
            ? "warning"
            : alert.cls === "ok"
            ? "success"
            : "tip"

        // Icon mapping
        const Icon =
          type === "warning"
            ? AlertTriangle
            : type === "success"
            ? CheckCircle2
            : Lightbulb

        return (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              type === "warning"
                ? "bg-yellow-500/10 border border-yellow-500/20"
                : type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-blue-500/10 border border-blue-500/20"
            }`}
          >
            <Icon
              className={`h-5 w-5 mt-0.5 shrink-0 ${
                type === "warning"
                  ? "text-yellow-500"
                  : type === "success"
                  ? "text-emerald-500"
                  : "text-blue-500"
              }`}
            />

            <div>
              <p className="font-medium text-sm text-foreground">
                {type === "warning"
                  ? "Health Alert"
                  : type === "success"
                  ? "Good Status"
                  : "Recommendation"}
              </p>

              <p className="text-xs text-muted-foreground mt-0.5">
                {alert.msg}
              </p>
            </div>
          </div>
        )
      })}
      </CardContent>
    </Card>
  )
}
