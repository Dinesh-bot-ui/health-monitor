"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HeartPulse, Activity, Droplets, Thermometer, TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const heartRateHistory = [
  { time: "6AM", value: 62 },
  { time: "9AM", value: 75 },
  { time: "12PM", value: 82 },
  { time: "3PM", value: 78 },
  { time: "6PM", value: 85 },
  { time: "9PM", value: 70 },
  { time: "Now", value: 72 },
]

const bpHistory = [
  { date: "Mon", systolic: 118, diastolic: 76 },
  { date: "Tue", systolic: 122, diastolic: 80 },
  { date: "Wed", systolic: 120, diastolic: 78 },
  { date: "Thu", systolic: 125, diastolic: 82 },
  { date: "Fri", systolic: 119, diastolic: 77 },
  { date: "Sat", systolic: 116, diastolic: 74 },
  { date: "Sun", systolic: 118, diastolic: 76 },
]

type HealthData = {
  restingHeartRate: number | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  bloodSugarFasting: number | null
  spO2: number | null
  bodyTemperature: number | null
  temperatureUnit: string
}

export default function HealthMetricsPage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('healthpulse_health_data')
    if (stored) {
      setHealthData(JSON.parse(stored))
    }
  }, [])

  const metrics = [
    {
      id: "heart-rate",
      title: "Heart Rate",
      value: healthData?.restingHeartRate || 72,
      unit: "bpm",
      icon: HeartPulse,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      status: "Normal",
      statusColor: "bg-emerald-500",
      description: "Resting heart rate",
      range: "60-100 bpm (normal)",
    },
    {
      id: "blood-pressure",
      title: "Blood Pressure",
      value: `${healthData?.bloodPressureSystolic || 118}/${healthData?.bloodPressureDiastolic || 76}`,
      unit: "mmHg",
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      status: "Normal",
      statusColor: "bg-emerald-500",
      description: "Systolic/Diastolic",
      range: "90-120/60-80 mmHg (normal)",
    },
    {
      id: "blood-sugar",
      title: "Blood Sugar",
      value: healthData?.bloodSugarFasting || 95,
      unit: "mg/dL",
      icon: Droplets,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      status: "Normal",
      statusColor: "bg-emerald-500",
      description: "Fasting glucose",
      range: "70-100 mg/dL (normal)",
    },
    {
      id: "spo2",
      title: "SpO2",
      value: healthData?.spO2 || 98,
      unit: "%",
      icon: Activity,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      status: "Excellent",
      statusColor: "bg-emerald-500",
      description: "Blood oxygen saturation",
      range: "95-100% (normal)",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Health Metrics</h1>
        <p className="text-muted-foreground">Monitor your vital signs and health indicators</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="border-border/50 bg-card/80">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <Badge className={`${metric.statusColor} text-white text-xs`}>
                  {metric.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground">{metric.range}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Charts */}
      <Tabs defaultValue="heart-rate" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="heart-rate">Heart Rate</TabsTrigger>
          <TabsTrigger value="blood-pressure">Blood Pressure</TabsTrigger>
          <TabsTrigger value="blood-sugar">Blood Sugar</TabsTrigger>
        </TabsList>

        <TabsContent value="heart-rate">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">Heart Rate Trend</CardTitle>
              <CardDescription>{"Today's heart rate throughout the day"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={heartRateHistory}>
                    <defs>
                      <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis domain={[50, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                              <p className="text-sm font-medium">{payload[0].value} bpm</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#heartRateGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blood-pressure">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">Blood Pressure History</CardTitle>
              <CardDescription>Weekly blood pressure readings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bpHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis domain={[60, 140]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                              <p className="text-sm">Systolic: {payload[0]?.value} mmHg</p>
                              <p className="text-sm">Diastolic: {payload[1]?.value} mmHg</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area type="monotone" dataKey="systolic" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="diastolic" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-muted-foreground">Systolic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-muted-foreground">Diastolic</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blood-sugar">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">Blood Sugar Levels</CardTitle>
              <CardDescription>Track your glucose levels over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Fasting</p>
                  <p className="text-3xl font-bold text-foreground">{healthData?.bloodSugarFasting || 95}</p>
                  <p className="text-xs text-muted-foreground">mg/dL</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Average</p>
                  <p className="text-3xl font-bold text-foreground">102</p>
                  <p className="text-xs text-muted-foreground">mg/dL</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Trend</p>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingDown className="h-5 w-5 text-emerald-500" />
                    <span className="text-lg font-bold text-emerald-500">-3%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs last week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
