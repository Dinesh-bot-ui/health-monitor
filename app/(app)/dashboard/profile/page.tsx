"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Heart,
  Shield,
  Bell,
  Moon,
  Sun,
  Save,
  Edit2,
  Activity,
  Target
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function ProfilePage() {
  const { user } = useAuth()
  const [healthData, setHealthData] = useState<{
    fullName: string
    age: number | null
    gender: string | null
    height: number | null
    weight: number | null
    existingConditions: string[]
  } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem('healthpulse_health_data')
    if (stored) {
      const data = JSON.parse(stored)
      setHealthData(data)
      setEditedName(data.fullName || user?.fullName || '')
    }
  }, [user])

  const handleSaveProfile = () => {
    if (healthData) {
      const updated = { ...healthData, fullName: editedName }
      localStorage.setItem('healthpulse_health_data', JSON.stringify(updated))
      setHealthData(updated)
    }
    setIsEditing(false)
  }

  const bmi = healthData?.height && healthData?.weight 
    ? (healthData.weight / Math.pow(healthData.height / 100, 2)).toFixed(1)
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="health">Health Info</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    {(healthData?.fullName || user?.fullName || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {healthData?.fullName || user?.fullName || 'User'}
                  </h3>
                  <p className="text-muted-foreground">{user?.email || 'user@example.com'}</p>
                  <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">
                    Premium Member
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={isEditing ? editedName : (healthData?.fullName || user?.fullName || '')}
                    onChange={(e) => setEditedName(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" value={healthData?.age || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input id="gender" value={healthData?.gender || ''} disabled className="capitalize" />
                </div>
              </div>

              {isEditing && (
                <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-primary to-primary/80">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Profile
              </CardTitle>
              <CardDescription>Your physical measurements and health conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="text-2xl font-bold text-foreground">{healthData?.height || '-'}</p>
                  <p className="text-xs text-muted-foreground">cm</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="text-2xl font-bold text-foreground">{healthData?.weight || '-'}</p>
                  <p className="text-xs text-muted-foreground">kg</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">BMI</p>
                  <p className="text-2xl font-bold text-foreground">{bmi || '-'}</p>
                  <p className="text-xs text-muted-foreground">kg/m²</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="text-2xl font-bold text-foreground">{healthData?.age || '-'}</p>
                  <p className="text-xs text-muted-foreground">years</p>
                </div>
              </div>

              {healthData?.existingConditions && healthData.existingConditions.length > 0 && (
                <div className="mt-6">
                  <p className="font-medium text-foreground mb-3">Medical Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {healthData.existingConditions.map((condition) => (
                      <Badge key={condition} variant="secondary">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="outline" className="mt-6">
                <Edit2 className="h-4 w-4 mr-2" />
                Update Health Form
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Daily Goals
              </CardTitle>
              <CardDescription>Customize your health targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Daily Steps", value: "10,000", unit: "steps" },
                { label: "Calories Burned", value: "2,000", unit: "kcal" },
                { label: "Sleep Duration", value: "8", unit: "hours" },
                { label: "Water Intake", value: "8", unit: "glasses" },
                { label: "Active Minutes", value: "60", unit: "min" },
              ].map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{goal.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      className="w-24 text-right" 
                      defaultValue={goal.value}
                    />
                    <span className="text-sm text-muted-foreground w-16">{goal.unit}</span>
                  </div>
                </div>
              ))}
              <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
                <Save className="h-4 w-4 mr-2" />
                Save Goals
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">App Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Use dark theme</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive app notifications</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Email Reports</p>
                    <p className="text-sm text-muted-foreground">Receive weekly email summaries</p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">Units & Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <p className="font-medium text-foreground">Temperature</p>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm">°C</Button>
                  <Button variant="ghost" size="sm">°F</Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <p className="font-medium text-foreground">Weight</p>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm">kg</Button>
                  <Button variant="ghost" size="sm">lb</Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <p className="font-medium text-foreground">Height</p>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm">cm</Button>
                  <Button variant="ghost" size="sm">ft/in</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
