"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const weeklyData = [
  { day: "Mon", heartRate: 72, steps: 8200, sleep: 7.2 },
  { day: "Tue", heartRate: 75, steps: 9100, sleep: 6.8 },
  { day: "Wed", heartRate: 70, steps: 7800, sleep: 7.5 },
  { day: "Thu", heartRate: 73, steps: 10200, sleep: 8.0 },
  { day: "Fri", heartRate: 71, steps: 8900, sleep: 7.3 },
  { day: "Sat", heartRate: 68, steps: 12500, sleep: 8.5 },
  { day: "Sun", heartRate: 69, steps: 6500, sleep: 7.8 },
]

export function WeeklyChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-medium text-foreground mb-2">{label}</p>
                    {payload.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
                        <span className="font-medium text-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="heartRate"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#heartGradient)"
          />
          <Area
            type="monotone"
            dataKey="steps"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#stepsGradient)"
            yAxisId={0}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">Heart Rate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-muted-foreground">Steps (scaled)</span>
        </div>
      </div>
    </div>
  )
}
