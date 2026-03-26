"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  LayoutDashboard, 
  HeartPulse, 
  Brain, 
  Dumbbell, 
  Apple, 
  Moon,
  FileText,
  Bell,
  User,
  LogOut,
  Settings
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Health Metrics", href: "/dashboard/health", icon: HeartPulse },
  { title: "Mental Wellness", href: "/dashboard/mental", icon: Brain },
  { title: "Fitness Tracking", href: "/dashboard/fitness", icon: Dumbbell },
  { title: "Nutrition", href: "/dashboard/nutrition", icon: Apple },
  { title: "Sleep Analysis", href: "/dashboard/sleep", icon: Moon },
  { title: "Reports", href: "/dashboard/reports", icon: FileText },
  { title: "Alerts", href: "/dashboard/alerts", icon: Bell },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [hovered, setHovered] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <SidebarProvider>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Sidebar
          variant="sidebar"
          className={`transition-all duration-300 ${hovered ? "w-56" : "w-16"}`}
        >
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            {hovered && (
              <span className="text-lg font-bold text-foreground">
                HealthPulse
              </span>
            )}
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        {hovered && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/profile"} tooltip="Profile">
                    <Link href="/dashboard/profile">
                      <User className="h-4 w-4" />
                      <span>Profile & Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-sm">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {hovered && (
              <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${!hovered && "hidden"}`}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border/50 px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger />
          <div className="flex-1" />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
