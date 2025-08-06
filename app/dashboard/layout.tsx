"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { 
  LogOut, 
  RefreshCw, 
  AlertCircle,
  Loader2
} from "lucide-react"
import { authApi, clearCache } from "@/lib/api"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [apiError, setApiError] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/")
      return
    }

    fetchUserProfile()
  }, [router])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const profile = await authApi.getProfile()
      setUserProfile(profile)
      setApiError("")
    } catch (error: any) {
      console.error("Failed to fetch user profile:", error)
      setApiError("Failed to load user profile")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    clearCache()
    await fetchUserProfile()
    setIsRefreshing(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userPhone")
    localStorage.removeItem("userId")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Logo size="xl" variant="full" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
            <span className="text-gray-600">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-pink-100 sticky top-0 z-30">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6">
          <div className="flex items-center">
            <Logo size="md" />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {userProfile && (
              <div className="hidden sm:block text-sm text-gray-600">
                Welcome, {userProfile.name || userProfile.phoneNumber}
              </div>
            )}
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={isRefreshing}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <RefreshCw className={`h-4 w-4 mr-1 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 mx-4 sm:mx-6 mt-4 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm sm:text-base">{apiError}</p>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={isRefreshing}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Retry</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Sidebar - Fixed */}
        <Sidebar className="hidden md:block" />
        
        {/* Main Content Area - Scrollable with proper margin */}
        <main className="flex-1 overflow-y-auto w-full md:ml-80">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 