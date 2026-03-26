"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Calendar, TrendingUp, TrendingDown, Minus, Share2 } from "lucide-react"

const weeklyMetrics = [
  { metric: "Average Heart Rate", value: "72 bpm", change: -2, status: "good" },
  { metric: "Total Steps", value: "63,200", change: 8, status: "good" },
  { metric: "Average Sleep", value: "7.4 hrs", change: 5, status: "good" },
  { metric: "Calories Burned", value: "12,450", change: -3, status: "neutral" },
  { metric: "Stress Level", value: "2.8/5", change: -12, status: "good" },
  { metric: "Water Intake", value: "6.2 L/day", change: 0, status: "neutral" },
]

const monthlyHighlights = [
  { title: "Best Sleep Week", value: "Week 2", detail: "Avg 8.2 hrs/night" },
  { title: "Most Active Day", value: "March 15", detail: "15,420 steps" },
  { title: "Lowest Stress", value: "March 10", detail: "Score: 1/5" },
  { title: "Highest Heart Rate", value: "March 8", detail: "During workout: 145 bpm" },
]

const reports = [
  { id: 1, title: "Weekly Health Summary", date: "Mar 16 - Mar 22", type: "weekly", status: "ready" },
  { id: 2, title: "Weekly Health Summary", date: "Mar 9 - Mar 15", type: "weekly", status: "ready" },
  { id: 3, title: "Monthly Health Report", date: "February 2026", type: "monthly", status: "ready" },
  { id: 4, title: "Weekly Health Summary", date: "Mar 2 - Mar 8", type: "weekly", status: "ready" },
  { id: 5, title: "Monthly Health Report", date: "January 2026", type: "monthly", status: "ready" },
]

export default function ReportsPage() {
  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-emerald-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getChangeColor = (change: number, status: string) => {
    if (status === "good") {
      return change >= 0 ? "text-emerald-500" : "text-emerald-500"
    }
    if (change > 0) return "text-emerald-500"
    if (change < 0) return "text-red-500"
    return "text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">View and download your health reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-6">
          {/* Current Week Summary */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">This Week&apos;s Summary</CardTitle>
                  <CardDescription>March 16 - March 22, 2026</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {weeklyMetrics.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">{item.metric}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {getChangeIcon(item.change)}
                      <span className={`text-sm ${getChangeColor(item.change, item.status)}`}>
                        {item.change > 0 ? '+' : ''}{item.change}% vs last week
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Insights */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">Key Insights</CardTitle>
              <CardDescription>Notable trends and observations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <TrendingUp className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Sleep Quality Improved</p>
                    <p className="text-sm text-muted-foreground">
                      Your average sleep duration increased by 5% this week. Keep maintaining your bedtime routine.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Activity Goals Met</p>
                    <p className="text-sm text-muted-foreground">
                      You achieved your step goal on 5 out of 7 days this week. Great consistency!
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <Minus className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Hydration Needs Attention</p>
                    <p className="text-sm text-muted-foreground">
                      Your water intake has been consistent but slightly below the recommended 8 glasses per day.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">March 2026 Highlights</CardTitle>
                  <CardDescription>Your monthly health achievements</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {monthlyHighlights.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">{item.title}</p>
                    <p className="text-xl font-bold text-foreground mt-1">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Overview</CardTitle>
              <CardDescription>Comprehensive health summary for March</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-2">Overall Health Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-emerald-500">82</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                  <p className="text-sm text-emerald-500 mt-1">+5 points vs last month</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-2">Goals Achieved</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-blue-500">18</span>
                    <span className="text-sm text-muted-foreground">/22 days</span>
                  </div>
                  <p className="text-sm text-blue-500 mt-1">82% success rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">Report History</CardTitle>
              <CardDescription>Access your previous health reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{report.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{report.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={report.type === 'monthly' ? 'default' : 'secondary'}>
                        {report.type}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
