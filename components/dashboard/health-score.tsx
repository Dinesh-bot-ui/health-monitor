"use client"

import { cn } from "@/lib/utils"

type HealthScoreProps = {
  score: number
}

export function HealthScore({ score }: HealthScoreProps) {
  const getScoreColor = () => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getCircleColor = () => {
    if (score >= 80) return "stroke-emerald-500"
    if (score >= 60) return "stroke-yellow-500"
    return "stroke-red-500"
  }

  const circumference = 2 * Math.PI * 40
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle
          cx="32"
          cy="32"
          r="26"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx="32"
          cy="32"
          r="26"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          className={cn("transition-all duration-1000", getCircleColor())}
          style={{
            strokeDasharray: circumference * 0.625,
            strokeDashoffset: offset * 0.625,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-lg font-bold", getScoreColor())}>{score}</span>
      </div>
    </div>
  )
}
