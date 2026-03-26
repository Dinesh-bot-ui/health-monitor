"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Apple,
  Droplets,
  UtensilsCrossed,
  Plus,
  Coffee,
  Cookie,
  Sparkles,
  Leaf,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Flame,
  Heart,
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

// ─── Food Log Data ────────────────────────────────────────────────────────────
const foodLog = [
  { time: "8:00 AM", meal: "Breakfast", items: "Oatmeal, Banana, Coffee", calories: 380, protein: 12, carbs: 62, fat: 8, fiber: 5 },
  { time: "10:30 AM", meal: "Snack", items: "Greek Yogurt, Almonds", calories: 200, protein: 15, carbs: 12, fat: 10, fiber: 2 },
  { time: "1:00 PM", meal: "Lunch", items: "Grilled Chicken Salad", calories: 450, protein: 35, carbs: 20, fat: 18, fiber: 6 },
  { time: "4:00 PM", meal: "Snack", items: "Apple, Peanut Butter", calories: 220, protein: 6, carbs: 28, fat: 12, fiber: 4 },
  { time: "7:30 PM", meal: "Dinner", items: "Salmon, Rice, Vegetables", calories: 580, protein: 32, carbs: 55, fat: 18, fiber: 7 },
]

const macros = [
  { name: "Carbs", value: 245, goal: 300, color: "#3b82f6" },
  { name: "Protein", value: 85, goal: 120, color: "#10b981" },
  { name: "Fat", value: 55, goal: 65, color: "#f97316" },
]

const getMealIcon = (meal: string) => {
  switch (meal) {
    case "Breakfast": return Coffee
    case "Snack": return Cookie
    default: return UtensilsCrossed
  }
}

// ─── Diet Plan Generator Based on Food Log Analysis ───────────────────────────
function analyzeFoodLog(log: typeof foodLog) {
  const totalCalories = log.reduce((a, b) => a + b.calories, 0)
  const totalProtein = log.reduce((a, b) => a + b.protein, 0)
  const totalCarbs = log.reduce((a, b) => a + b.carbs, 0)
  const totalFat = log.reduce((a, b) => a + b.fat, 0)
  const totalFiber = log.reduce((a, b) => a + b.fiber, 0)

  const issues: string[] = []
  const strengths: string[] = []

  // Analyze protein
  if (totalProtein < 100) issues.push("Protein intake is low (below 100g)")
  else strengths.push("Good protein intake")

  // Analyze fiber
  if (totalFiber < 25) issues.push("Fiber intake is below recommended 25g/day")
  else strengths.push("Adequate fiber intake")

  // Analyze calories
  if (totalCalories > 2500) issues.push("Calorie intake is above healthy range")
  else if (totalCalories < 1500) issues.push("Calorie intake is too low for sustained energy")
  else strengths.push("Calorie intake is in healthy range")

  // Analyze fat ratio
  const fatCalPct = (totalFat * 9 / totalCalories) * 100
  if (fatCalPct > 35) issues.push("Fat accounts for over 35% of calories")
  else strengths.push("Fat ratio is balanced")

  // Check meal spread
  const mealCount = log.filter(m => m.meal !== "Snack").length
  if (mealCount < 3) issues.push("Less than 3 main meals — consider balanced meal timing")

  return {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    fatCalPct,
    issues,
    strengths,
  }
}

function generateDietPlan(
  analysis: ReturnType<typeof analyzeFoodLog>,
  dietType: string
) {
  const { totalProtein, totalFiber, totalCalories, fatCalPct, issues } = analysis

  const meals: {
    time: string
    meal: string
    items: string[]
    calories: number
    benefit: string
    icon: string
  }[] = []

  const isVeg = dietType.toLowerCase().includes("veg")
  const isVegan = dietType.toLowerCase().includes("vegan")

  // Breakfast — focus on energy & fiber
  if (totalFiber < 25) {
    meals.push({
      time: "7:30 AM",
      meal: "Breakfast",
      items: isVegan
        ? ["Chia Seed Pudding with Berries", "Whole Grain Toast with Avocado", "Green Smoothie"]
        : isVeg
        ? ["Oats with Flaxseeds & Berries", "Boiled Eggs (2)", "Green Tea"]
        : ["Steel-Cut Oats with Walnuts", "Scrambled Eggs (2) with Spinach", "Green Tea"],
      calories: 420,
      benefit: "High fiber to address your low daily fiber intake",
      icon: "🌅",
    })
  } else {
    meals.push({
      time: "7:30 AM",
      meal: "Breakfast",
      items: isVegan
        ? ["Smoothie Bowl (Banana, Berries, Granola)", "Almond Butter Toast", "Herbal Tea"]
        : isVeg
        ? ["Multigrain Paratha with Yogurt", "Fresh Fruit Bowl", "Masala Chai"]
        : ["Whole Wheat Pancakes with Berries", "Turkey Sausage (2)", "Black Coffee"],
      calories: 400,
      benefit: "Balanced start with sustained energy release",
      icon: "🌅",
    })
  }

  // Mid-morning Snack — protein boost if needed
  if (totalProtein < 100) {
    meals.push({
      time: "10:00 AM",
      meal: "Snack",
      items: isVegan
        ? ["Roasted Chickpeas (1 cup)", "Protein Shake (Pea Protein)"]
        : isVeg
        ? ["Paneer Tikka (100g)", "Handful of Mixed Nuts"]
        : ["Greek Yogurt with Almonds", "Protein Bar"],
      calories: 220,
      benefit: "Protein boost — your intake is below 100g/day target",
      icon: "💪",
    })
  } else {
    meals.push({
      time: "10:00 AM",
      meal: "Snack",
      items: ["Seasonal Fruit", "Handful of Mixed Nuts (15-20)"],
      calories: 180,
      benefit: "Light snack for sustained energy between meals",
      icon: "🍎",
    })
  }

  // Lunch — balance macros
  meals.push({
    time: "1:00 PM",
    meal: "Lunch",
    items: isVegan
      ? ["Quinoa Buddha Bowl with Roasted Vegetables", "Lentil Soup", "Mixed Green Salad with Tahini"]
      : isVeg
      ? ["Brown Rice with Dal & Vegetables", "Raita", "Green Salad with Lemon Dressing"]
      : ["Grilled Chicken Breast (150g) with Brown Rice", "Steamed Broccoli & Carrots", "Mixed Salad"],
    calories: 520,
    benefit: "Balanced macros with complex carbs for afternoon energy",
    icon: "🥗",
  })

  // Afternoon Snack
  meals.push({
    time: "4:00 PM",
    meal: "Snack",
    items: fatCalPct > 30
      ? ["Carrot & Cucumber Sticks with Hummus", "Green Tea"]
      : ["Trail Mix (30g)", "Apple with Cinnamon"],
    calories: 160,
    benefit: fatCalPct > 30
      ? "Low-fat snack to balance your daily fat ratio"
      : "Healthy fats and antioxidants for heart health",
    icon: "🥕",
  })

  // Dinner — lighter, nutrient-dense
  meals.push({
    time: "7:00 PM",
    meal: "Dinner",
    items: isVegan
      ? ["Stir-fried Tofu with Vegetables", "Sweet Potato Mash", "Spinach & Mushroom Soup"]
      : isVeg
      ? ["Palak Paneer with Roti (2)", "Cucumber Raita", "Vegetable Clear Soup"]
      : ["Baked Salmon (150g) with Lemon Herb", "Quinoa Pilaf", "Steamed Asparagus"],
    calories: 480,
    benefit: "Light dinner with omega-3s and micronutrients for recovery",
    icon: "🌙",
  })

  // Evening (optional)
  meals.push({
    time: "9:00 PM",
    meal: "Before Bed",
    items: isVegan
      ? ["Chamomile Tea", "Handful of Pumpkin Seeds"]
      : ["Warm Turmeric Milk", "5 Soaked Almonds"],
    calories: 80,
    benefit: "Promotes better sleep quality and anti-inflammatory benefits",
    icon: "🌜",
  })

  const totalPlanCalories = meals.reduce((a, b) => a + b.calories, 0)

  // Weekly focus areas
  const weeklyTips: string[] = []
  if (totalProtein < 100) weeklyTips.push("Increase protein sources — aim for 25-30g per main meal")
  if (totalFiber < 25) weeklyTips.push("Add more vegetables and whole grains — target 25-30g fiber/day")
  if (fatCalPct > 35) weeklyTips.push("Reduce cooking oils and fried foods — keep fat under 30% of calories")
  if (totalCalories > 2200) weeklyTips.push("Consider portion control — your intake is above maintenance")
  weeklyTips.push("Drink at least 8 glasses of water throughout the day")
  weeklyTips.push("Eat slowly and mindfully — meals should take at least 20 minutes")
  weeklyTips.push("Include a variety of colorful vegetables for micronutrients")

  return { meals, totalPlanCalories, weeklyTips }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NutritionPage() {
  const [healthData, setHealthData] = useState<{ dietType: string | null; waterIntake: number | null } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('healthpulse_health_data')
    if (stored) {
      setHealthData(JSON.parse(stored))
    }
  }, [])

  const totalCalories = foodLog.reduce((acc, item) => acc + item.calories, 0)
  const calorieGoal = 2200
  const waterIntake = healthData?.waterIntake || 6
  const waterGoal = 8
  const dietType = healthData?.dietType || "Mixed"

  const pieData = macros.map(m => ({ name: m.name, value: m.value }))

  // AI analysis
  const analysis = useMemo(() => analyzeFoodLog(foodLog), [])
  const dietPlan = useMemo(() => generateDietPlan(analysis, dietType), [analysis, dietType])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nutrition</h1>
          <p className="text-muted-foreground">Track your intake & get AI-powered diet recommendations</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary/80">
          <Plus className="h-4 w-4 mr-2" />
          Log Food
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Apple className="h-5 w-5 text-orange-500" />
              </div>
              <Badge variant={totalCalories > calorieGoal ? 'destructive' : 'default'}>
                {((totalCalories / calorieGoal) * 100).toFixed(0)}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Calories Consumed</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-foreground">{totalCalories}</span>
              <span className="text-sm text-muted-foreground">/ {calorieGoal} kcal</span>
            </div>
            <Progress value={(totalCalories / calorieGoal) * 100} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {calorieGoal - totalCalories > 0
                ? `${calorieGoal - totalCalories} kcal remaining`
                : `${totalCalories - calorieGoal} kcal over goal`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Droplets className="h-5 w-5 text-cyan-500" />
              </div>
              <Badge>{waterIntake} / {waterGoal}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Water Intake</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-foreground">{waterIntake}</span>
              <span className="text-sm text-muted-foreground">glasses</span>
            </div>
            <div className="flex gap-1 mt-3">
              {Array.from({ length: waterGoal }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-6 rounded ${i < waterIntake ? 'bg-cyan-500' : 'bg-muted'}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-4">Diet Type</p>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/20">
                <UtensilsCrossed className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground capitalize">
                  {dietType}
                </p>
                <p className="text-sm text-muted-foreground">Balanced nutrition plan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── AI Diet Analysis ── */}
      <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 via-card/80 to-cyan-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-500/20">
              <Brain className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Nutrition Analysis
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription>Analysis of your food log with improvement areas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nutrient Breakdown */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Calories", value: `${analysis.totalCalories}`, unit: "kcal", color: "text-orange-400", icon: Flame },
                { label: "Protein", value: `${analysis.totalProtein}g`, unit: "/ 120g", color: "text-emerald-400", icon: TrendingUp },
                { label: "Carbs", value: `${analysis.totalCarbs}g`, unit: "/ 300g", color: "text-blue-400", icon: Sparkles },
                { label: "Fat", value: `${analysis.totalFat}g`, unit: "/ 65g", color: "text-amber-400", icon: Heart },
                { label: "Fiber", value: `${analysis.totalFiber}g`, unit: "/ 25g", color: "text-lime-400", icon: Leaf },
                { label: "Fat %", value: `${analysis.fatCalPct.toFixed(0)}%`, unit: "of calories", color: "text-rose-400", icon: TrendingDown },
              ].map((n, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <n.icon className={`h-3.5 w-3.5 ${n.color}`} />
                    <span className="text-[10px] text-muted-foreground">{n.label}</span>
                  </div>
                  <p className={`text-lg font-bold ${n.color}`}>{n.value}</p>
                  <p className="text-[10px] text-muted-foreground">{n.unit}</p>
                </div>
              ))}
            </div>

            {/* Issues & Strengths */}
            <div className="space-y-3">
              {analysis.issues.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Areas to Improve
                  </p>
                  <div className="space-y-1.5">
                    {analysis.issues.map((issue, i) => (
                      <div key={i} className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analysis.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    What You&apos;re Doing Right
                  </p>
                  <div className="space-y-1.5">
                    {analysis.strengths.map((s, i) => (
                      <div key={i} className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg flex items-start gap-2">
                        <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── AI Recommended Diet Plan ── */}
      <Card className="border-border/50 bg-gradient-to-br from-green-500/10 via-card/80 to-emerald-500/10 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/20">
                <Sparkles className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Recommended Diet Plan
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px]">
                    Personalized
                  </Badge>
                </CardTitle>
                <CardDescription>Based on your food log analysis ({dietType} diet)</CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Flame className="h-5 w-5 text-green-400 mb-1" />
              <span className="text-sm font-bold text-green-400">{dietPlan.totalPlanCalories}</span>
              <span className="text-[9px] text-muted-foreground">kcal/day</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {dietPlan.meals.map((meal, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors"
            >
              <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 shrink-0">
                {meal.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground text-sm">{meal.meal}</p>
                  <span className="text-[10px] text-muted-foreground">{meal.time}</span>
                  <Badge variant="outline" className="text-[9px] ml-auto">{meal.calories} kcal</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {meal.items.map((item, j) => (
                    <span
                      key={j}
                      className="text-[11px] text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  {meal.benefit}
                </p>
              </div>
            </div>
          ))}

          {/* Weekly Focus Tips */}
          <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20 mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-green-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Weekly Nutrition Tips
            </p>
            <div className="space-y-1.5">
              {dietPlan.weeklyTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3 mt-0.5 text-green-400 shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Macros & Food Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Macronutrients */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">Macronutrients</CardTitle>
            <CardDescription>Daily macro breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={macros[index].color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {macros.map((macro) => (
                <div key={macro.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{macro.name}</span>
                    <span className="font-medium text-foreground">{macro.value}g / {macro.goal}g</span>
                  </div>
                  <Progress
                    value={(macro.value / macro.goal) * 100}
                    className="h-1.5"
                    style={{ '--progress-background': macro.color } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Food Log */}
        <Card className="lg:col-span-2 border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg">{"Today's Food Log"}</CardTitle>
            <CardDescription>What you ate today — used to generate your diet plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {foodLog.map((item, index) => {
                const MealIcon = getMealIcon(item.meal)
                return (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <MealIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{item.meal}</p>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{item.items}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-emerald-400">P: {item.protein}g</span>
                        <span className="text-[10px] text-blue-400">C: {item.carbs}g</span>
                        <span className="text-[10px] text-orange-400">F: {item.fat}g</span>
                        <span className="text-[10px] text-lime-400">Fi: {item.fiber}g</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{item.calories}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
