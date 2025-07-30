"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Grid3X3,
  Layers,
  Settings,
  LogOut,
  Sparkles,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { mainCategoriesApi, subCategoriesApi, servicesApi, authApi } from "@/lib/api"

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalMainCategories: 0,
    totalSubCategories: 0,
    totalServices: 0,
    loading: true,
  })
  const [userProfile, setUserProfile] = useState<any>(null)
  const [apiError, setApiError] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/")
      return
    }

    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setApiError("")
      console.log("🔄 Fetching dashboard data...")

      // Add delay between requests to avoid rate limiting
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

      // Fetch data sequentially with delays instead of parallel
      let mainCategories = []
      let subCategories = []
      let services = []
      let profile = null

      try {
        mainCategories = await mainCategoriesApi.getAll()
        console.log("✅ Main categories loaded:", mainCategories.length)
        await delay(1000) // Wait 1 second between requests
      } catch (err: any) {
        console.error("❌ Main categories fetch failed:", err)
        if (err.status === 429) {
          console.warn("⚠️ Rate limited for main categories, will retry later")
        }
      }

      try {
        subCategories = await subCategoriesApi.getAll()
        console.log("✅ Sub categories loaded:", subCategories.length)
        await delay(1000) // Wait 1 second between requests
      } catch (err: any) {
        console.error("❌ Sub categories fetch failed:", err)
        if (err.status === 429) {
          console.warn("⚠️ Rate limited for sub categories, will retry later")
        }
      }

      try {
        services = await servicesApi.getAll()
        console.log("✅ Services loaded:", services.length)
        await delay(1000) // Wait 1 second between requests
      } catch (err: any) {
        console.error("❌ Services fetch failed:", err)
        if (err.status === 429) {
          console.warn("⚠️ Rate limited for services, will retry later")
        }
      }

      try {
        profile = await authApi.getProfile()
        console.log("✅ Profile loaded:", profile?.name || profile?.phoneNumber || "Unknown")
      } catch (err: any) {
        console.error("❌ Profile fetch failed:", err)
        if (err.status === 429) {
          console.warn("⚠️ Rate limited for profile, will retry later")
        }
      }

      console.log("📊 Dashboard data loaded:", {
        mainCategories: mainCategories.length,
        subCategories: subCategories.length,
        services: services.length,
        profile: profile?.name || profile?.phoneNumber || "Unknown",
      })

      setStats({
        totalMainCategories: mainCategories.length,
        totalSubCategories: subCategories.length,
        totalServices: services.length,
        loading: false,
      })

      setUserProfile(profile)

      // If we got rate limited, show a warning
      if (mainCategories.length === 0 && subCategories.length === 0 && services.length === 0) {
        console.warn("⚠️ All API calls failed - you may be rate limited. Please wait a few minutes and refresh.")
        setApiError("Unable to load data. You may be rate limited. Please wait a few minutes and try again.")
      }

    } catch (error) {
      console.error("❌ Dashboard data fetch error:", error)
      setStats((prev) => ({ ...prev, loading: false }))
      setApiError("Failed to load dashboard data. Please try again.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userPhone")
    localStorage.removeItem("userId")
    router.push("/")
  }

  const menuItems = [
    { title: "Main Categories", icon: Grid3X3, href: "/dashboard/main-categories", color: "from-blue-500 to-blue-600" },
    { title: "Sub Categories", icon: Layers, href: "/dashboard/sub-categories", color: "from-green-500 to-green-600" },
    { title: "Services", icon: Package, href: "/dashboard/services", color: "from-purple-500 to-purple-600" },
    { title: "Users", icon: Users, href: "/dashboard/users", color: "from-orange-500 to-orange-600" },
    { title: "Orders", icon: ShoppingCart, href: "/dashboard/orders", color: "from-pink-500 to-pink-600" },
    { title: "Settings", icon: Settings, href: "/dashboard/settings", color: "from-gray-500 to-gray-600" },
  ]

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Glamedge Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {userProfile && (
                <div className="text-sm text-gray-600">Welcome, {userProfile.name || userProfile.phoneNumber}</div>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Main Categories</CardTitle>
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMainCategories}</div>
              <p className="text-xs text-muted-foreground">Total main categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sub Categories</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubCategories}</div>
              <p className="text-xs text-muted-foreground">Total sub categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServices}</div>
              <p className="text-xs text-muted-foreground">Total services</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">System operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {apiError && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="text-red-600">⚠️</div>
                  <p className="text-red-700">{apiError}</p>
                </div>
                <Button 
                  onClick={fetchDashboardData} 
                  variant="outline" 
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Link key={item.title} href={item.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center mb-4`}
                    >
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>Manage {item.title.toLowerCase()} and their settings</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system status and information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Status</span>
                <span className="text-sm text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <span className="text-sm text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-sm text-gray-500">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
