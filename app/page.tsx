"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { HeartPulse, Activity, Moon, Brain, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const features = [
  {
    icon: HeartPulse,
    title: "Heart Health",
    description: "Monitor heart rate, blood pressure, and cardiovascular metrics in real-time",
  },
  {
    icon: Activity,
    title: "Fitness Tracking",
    description: "Track steps, calories, workouts, and achieve your daily activity goals",
  },
  {
    icon: Moon,
    title: "Sleep Analysis",
    description: "Analyze sleep patterns, cycles, and quality for better rest",
  },
  {
    icon: Brain,
    title: "Mental Wellness",
    description: "Monitor stress levels, mood, and anxiety with personalized insights",
  },
  {
    icon: TrendingUp,
    title: "Progress Reports",
    description: "Weekly and monthly reports with trends and actionable insights",
  },
  {
    icon: Shield,
    title: "Health Alerts",
    description: "Smart notifications when your metrics need attention",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
                <HeartPulse className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight">
              <span className="text-balance">Your Health,</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Monitored in Real-Time
              </span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              HealthPulse is your comprehensive health monitoring dashboard. 
              Track vital signs, fitness goals, sleep patterns, and mental wellness all in one place.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/80 px-8">
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground">
            Everything You Need for Better Health
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Comprehensive health monitoring with powerful features
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-border/50 bg-card/30">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Start Monitoring Your Health Today
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users who are taking control of their health with HealthPulse.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/80 px-8">
            <Link href="/register">Create Free Account</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">HealthPulse</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 HealthPulse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
