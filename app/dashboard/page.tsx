"use client"

import { useEffect, useState, useCallback } from "react"
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
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { mainCategoriesApi, subCategoriesApi, servicesApi, clearCache } from "@/lib/api"

interface DashboardStats {
  totalMainCategories: number
  totalSubCategories: number
  totalServices: number
  loading: boolean
  lastUpdated: Date | null
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMainCategories: 0,
    totalSubCategories: 0,
    totalServices: 0,
    loading: true,
    lastUpdated: null,
  })
  const [apiError, setApiError] = useState<string>("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setStats(prev => ({ ...prev, loading: true }))
    }
    setApiError("")

    try {
      console.log("🔄 Fetching dashboard data...")

      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled([
        mainCategoriesApi.getAll(),
        subCategoriesApi.getAll(),
        servicesApi.getAll(),
      ])

      const [mainCategoriesResult, subCategoriesResult, servicesResult] = results

      const mainCategories = mainCategoriesResult.status === 'fulfilled' ? mainCategoriesResult.value : []
      const subCategories = subCategoriesResult.status === 'fulfilled' ? subCategoriesResult.value : []
      const services = servicesResult.status === 'fulfilled' ? servicesResult.value : []

      // Log results for debugging
      console.log("📊 Dashboard data loaded:", {
        mainCategories: mainCategories.length,
        subCategories: subCategories.length,
        services: services.length,
      })

      setStats({
        totalMainCategories: mainCategories.length,
        totalSubCategories: subCategories.length,
        totalServices: services.length,
        loading: false,
        lastUpdated: new Date(),
      })

      // Show warning if all API calls failed
      const successCount = results.filter(r => r.status === 'fulfilled').length
      if (successCount === 0) {
        setApiError("Unable to load data. Please check your connection and try again.")
      } else if (successCount < results.length) {
        setApiError("Some data may be outdated. Please refresh to get the latest information.")
      }

    } catch (error: any) {
      console.error("❌ Dashboard data fetch error:", error)
      setStats(prev => ({ ...prev, loading: false }))
      setApiError("Failed to load dashboard data. Please try again.")
    }
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    clearCache() // Clear all cache for fresh data
    await fetchDashboardData(false)
    setIsRefreshing(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const menuItems = [
    { 
      title: "Main Categories", 
      icon: Grid3X3, 
      href: "/dashboard/main-categories", 
      color: "from-pink-500 to-purple-600",
      description: "Manage service categories"
    },
    { 
      title: "Sub Categories", 
      icon: Layers, 
      href: "/dashboard/sub-categories", 
      color: "from-purple-500 to-indigo-600",
      description: "Organize sub-categories"
    },
    { 
      title: "Services", 
      icon: Package, 
      href: "/dashboard/services", 
      color: "from-indigo-500 to-blue-600",
      description: "Manage service offerings"
    },
    { 
      title: "Users", 
      icon: Users, 
      href: "/dashboard/users", 
      color: "from-blue-500 to-cyan-600",
      description: "Customer management"
    },
    { 
      title: "Orders", 
      icon: ShoppingCart, 
      href: "/dashboard/orders", 
      color: "from-cyan-500 to-teal-600",
      description: "Order tracking & management"
    },
    { 
      title: "Settings", 
      icon: Settings, 
      href: "/dashboard/settings", 
      color: "from-teal-500 to-green-600",
      description: "System configuration"
    },
  ]

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
            <span className="text-gray-600">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Error Display */}
      {apiError && (
        <Card className="border-red-200 bg-red-50/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm sm:text-base text-red-700">{apiError}</p>
              </div>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={isRefreshing}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-pink-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Main Categories</CardTitle>
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg">
              <Grid3X3 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalMainCategories}</div>
            <p className="text-xs text-gray-500">Total main categories</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Sub Categories</CardTitle>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg">
              <Layers className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalSubCategories}</div>
            <p className="text-xs text-gray-500">Total sub categories</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-indigo-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Services</CardTitle>
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-2 rounded-lg">
              <Package className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalServices}</div>
            <p className="text-xs text-gray-500">Total services</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Status</CardTitle>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-gray-500">System operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Quick Actions</h2>
          {stats.lastUpdated && (
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              Last updated: {stats.lastUpdated?.toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map((item) => (
            <Link key={item.title} href={item.href}>
              <Card className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg text-gray-900 group-hover:text-pink-600 transition-colors duration-300">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* System Info */}
      <Card className="bg-white/90 backdrop-blur-sm border-pink-100">
        <CardHeader>
          <CardTitle className="text-gray-900">System Information</CardTitle>
          <CardDescription>Current system status and information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">API Status</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Database</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Cache Status</span>
              <span className="text-sm text-blue-600">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Last Updated</span>
              <span className="text-sm text-gray-500">
                {stats.lastUpdated ? stats.lastUpdated?.toLocaleString() : 'Never'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
