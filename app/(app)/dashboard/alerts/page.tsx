"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Heart,
  Activity,
  Moon,
  Droplets,
  X,
  Settings,
  TrendingUp,
  Brain,
  BarChart3,
  Lightbulb,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react"

// ─── Predictions ──────────────────────────────────────────────────────────────
const predictions = [
  {
    id: 1,
    title: "Elevated Stress Risk",
    message: "Based on low HRV trends, you may experience a stress spike in the next few hours. Consider taking breaks.",
    confidence: 78,
    time: "30 min ago",
    severity: "warning",
  },
  {
    id: 2,
    title: "Sleep Quality Prediction",
    message: "Your activity pattern today suggests good sleep tonight. Maintain low screen time after 9 PM.",
    confidence: 85,
    time: "1 hour ago",
    severity: "info",
  },
  {
    id: 3,
    title: "Heart Rate Trend",
    message: "Resting heart rate has been improving over the past week — down 3 bpm on average.",
    confidence: 92,
    time: "2 hours ago",
    severity: "success",
  },
]

// ─── Insights (correlations) ──────────────────────────────────────────────────
const insightsData = [
  {
    id: 1,
    title: "Activity & Sleep Correlation",
    message: "Days with 8001+ steps correlate with 15% better sleep quality in your data.",
    icon: Activity,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: 2,
    title: "Stress & Heart Rate Link",
    message: "Your heart rate increases by ~12 bpm during high-stress periods (HRV < 35ms).",
    icon: Heart,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
  {
    id: 3,
    title: "Hydration Impact",
    message: "On days with 8+ glasses of water, your SpO2 averages 1.2% higher.",
    icon: Droplets,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
]

// ─── Score Breakdown ──────────────────────────────────────────────────────────
const scoreBreakdown = [
  { category: "Heart Health", score: 18, maxScore: 20, trend: "+2", color: "bg-red-500" },
  { category: "Oxygen Levels", score: 19, maxScore: 20, trend: "0", color: "bg-blue-500" },
  { category: "Stress Management", score: 14, maxScore: 20, trend: "-1", color: "bg-purple-500" },
  { category: "Respiration", score: 17, maxScore: 20, trend: "+1", color: "bg-emerald-500" },
  { category: "Blood Pressure", score: 15, maxScore: 20, trend: "0", color: "bg-amber-500" },
]

// ─── Recommendations ──────────────────────────────────────────────────────────
const recommendationsData = [
  { text: "Walk for 20 minutes after lunch to improve afternoon energy and digestion", priority: "high", category: "Activity" },
  { text: "Practice 4-7-8 breathing technique before bed for better sleep onset", priority: "medium", category: "Sleep" },
  { text: "Increase water intake by 2 glasses — you're consistently under target", priority: "high", category: "Hydration" },
  { text: "Add 10 minutes of stretching in the morning to reduce muscle tension", priority: "low", category: "Recovery" },
  { text: "Consider reducing caffeine after 2 PM for improved sleep quality", priority: "medium", category: "Nutrition" },
]

// ─── Notifications ────────────────────────────────────────────────────────────
const notifications = [
  {
    id: 1,
    type: "warning",
    title: "Elevated Heart Rate Detected",
    message: "Your resting heart rate was above 90 bpm for an extended period yesterday.",
    time: "2 hours ago",
    read: false,
    icon: Heart,
  },
  {
    id: 2,
    type: "info",
    title: "Sleep Goal Achieved",
    message: "Congratulations! You've met your sleep goal for 5 consecutive days.",
    time: "5 hours ago",
    read: false,
    icon: Moon,
  },
  {
    id: 3,
    type: "warning",
    title: "Low Water Intake",
    message: "You've only logged 4 glasses of water today. Remember to stay hydrated!",
    time: "1 day ago",
    read: true,
    icon: Droplets,
  },
  {
    id: 4,
    type: "success",
    title: "Step Goal Reached",
    message: "You've reached your daily step goal of 10,000 steps!",
    time: "1 day ago",
    read: true,
    icon: Activity,
  },
  {
    id: 5,
    type: "info",
    title: "Weekly Report Ready",
    message: "Your weekly health summary for March 9-15 is now available.",
    time: "2 days ago",
    read: true,
    icon: Info,
  },
]

const alertSettings = [
  { id: "heart-rate", label: "Heart Rate Alerts", description: "Get notified about abnormal heart rate", enabled: true },
  { id: "steps", label: "Step Goal Reminders", description: "Daily reminders to reach your step goal", enabled: true },
  { id: "sleep", label: "Sleep Schedule", description: "Bedtime and wake-up reminders", enabled: false },
  { id: "water", label: "Hydration Reminders", description: "Regular water intake reminders", enabled: true },
  { id: "predictions", label: "AI Predictions", description: "Health risk predictions from AI analysis", enabled: true },
  { id: "reports", label: "Report Notifications", description: "Get notified when reports are ready", enabled: true },
  { id: "tips", label: "Health Tips", description: "Personalized wellness recommendations", enabled: true },
]

// ─── Priority badge ───────────────────────────────────────────────────────────
function getPriorityColor(priority: string) {
  switch (priority) {
    case "high": return "bg-red-500/20 text-red-400 border-red-500/30"
    case "medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "low": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

export default function AlertsPage() {
  const [settings, setSettings] = useState(alertSettings)

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    )
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
      case "success": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      default: return "text-blue-500 bg-blue-500/10 border-blue-500/20"
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const totalScore = scoreBreakdown.reduce((a, b) => a + b.score, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts & Insights</h1>
          <p className="text-muted-foreground">AI-powered predictions, insights, and health alerts</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-sm">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            Alerts
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="space-y-6">
          {/* Score Breakdown */}
          <Card className="border-border/50 bg-gradient-to-br from-violet-500/5 via-card/80 to-blue-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-violet-400" />
                  <CardTitle className="text-lg">Score Breakdown</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-foreground">{totalScore}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
              <CardDescription>Detailed breakdown of your health score components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {scoreBreakdown.map((item) => (
                  <div key={item.category} className="p-3 rounded-xl bg-muted/40 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                    <p className="text-2xl font-bold text-foreground">{item.score}<span className="text-sm text-muted-foreground">/{item.maxScore}</span></p>
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                      />
                    </div>
                    <p className={`text-[10px] mt-1 ${item.trend.startsWith("+") ? "text-emerald-400" :
                        item.trend.startsWith("-") ? "text-red-400" : "text-muted-foreground"
                      }`}>
                      {item.trend === "0" ? "No change" : `${item.trend} pts`}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Recommendations */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </div>
              <CardDescription>Personalized actions to improve your health scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendationsData.map((rec, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors">
                    <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{rec.text}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[9px]">{rec.category}</Badge>
                      <Badge className={`text-[9px] ${getPriorityColor(rec.priority)}`}>{rec.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Predictions Tab ── */}
        <TabsContent value="predictions" className="space-y-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-rose-400" />
                <CardTitle className="text-lg">AI Predictions</CardTitle>
              </div>
              <CardDescription>Health trend forecasts based on your data patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {predictions.map((pred) => (
                <div
                  key={pred.id}
                  className={`p-4 rounded-xl border transition-colors ${pred.severity === "warning"
                      ? "bg-amber-500/5 border-amber-500/20"
                      : pred.severity === "success"
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-blue-500/5 border-blue-500/20"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{pred.title}</p>
                        <Badge variant="outline" className="text-[9px]">
                          {pred.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{pred.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{pred.time}</p>
                    </div>
                    <div className={`p-2 rounded-lg shrink-0 ${pred.severity === "warning"
                        ? "bg-amber-500/20 text-amber-400"
                        : pred.severity === "success"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}>
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Insights Tab ── */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-lg">Health Insights</CardTitle>
              </div>
              <CardDescription>Correlations and patterns discovered in your health data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insightsData.map((insight) => {
                const Icon = insight.icon
                return (
                  <div key={insight.id} className={`flex items-start gap-4 p-4 rounded-xl border ${insight.color}`}>
                    <div className="p-2 rounded-lg shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{insight.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Alerts / Notifications Tab ── */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs">All</Button>
            <Button variant="ghost" size="sm" className="text-xs">Unread</Button>
            <Button variant="ghost" size="sm" className="text-xs">Warnings</Button>
            <Button variant="ghost" size="sm" className="text-xs">Info</Button>
          </div>

          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-4 space-y-3">
              {notifications.map((notification) => {
                const NotifIcon = notification.icon
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${notification.read
                        ? 'bg-muted/30 border-border/50'
                        : 'bg-muted/50 border-primary/20'
                      }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${getAlertColor(notification.type)}`}>
                      <NotifIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium text-foreground ${!notification.read && 'font-semibold'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Settings Tab ── */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Customize which alerts and notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={setting.id} className="font-medium cursor-pointer">
                      {setting.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    id={setting.id}
                    checked={setting.enabled}
                    onCheckedChange={() => toggleSetting(setting.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">Quiet Hours</CardTitle>
              <CardDescription>
                Set times when you don&apos;t want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">Enable Quiet Hours</Label>
                  <p className="text-sm text-muted-foreground">
                    No notifications between 10 PM - 7 AM
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
