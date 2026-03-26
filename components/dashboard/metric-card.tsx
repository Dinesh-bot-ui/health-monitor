"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type MetricCardProps = {
  title: string
  value: string | number
  unit: string
  icon: LucideIcon
  trend: number
  gradient: string
  iconColor: string
  invertTrend?: boolean
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  gradient,
  iconColor,
  invertTrend = false
}: MetricCardProps) {
  const isPositive = invertTrend ? trend < 0 : trend > 0

  return (
    <Card className={cn(
      "border-border/50 bg-gradient-to-br overflow-hidden relative",
      gradient
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{value}</span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>
          <div className={cn("p-2 rounded-lg bg-background/50", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        
        {/* Trend indicator */}
        <div className="flex items-center gap-1 mt-3">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={cn(
            "text-xs font-medium",
            isPositive ? "text-emerald-500" : "text-red-500"
          )}>
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-muted-foreground">vs last week</span>
        </div>

        {/* Mini sparkline (decorative) */}
        <div className="absolute bottom-0 right-0 opacity-20">
          <svg width="80" height="40" viewBox="0 0 80 40" className={iconColor}>
            <path
              d="M0 35 L10 30 L20 32 L30 25 L40 28 L50 20 L60 22 L70 15 L80 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
