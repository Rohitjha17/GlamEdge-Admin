import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="ml-3 w-32 h-6" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="w-24 h-8" />
              <Skeleton className="w-20 h-8" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-16 h-8 mb-2" />
                <Skeleton className="w-32 h-3" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="w-32 h-8" />
            <Skeleton className="w-40 h-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                  <Skeleton className="w-32 h-6 mb-2" />
                  <Skeleton className="w-48 h-4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* System Info Skeleton */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="w-40 h-6 mb-2" />
            <Skeleton className="w-64 h-4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-20 h-4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-32 h-10" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="w-64 h-6 mb-2" />
          <Skeleton className="w-96 h-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-24 h-3" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="w-8 h-8" />
                  <Skeleton className="w-8 h-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function DialogSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-full h-10" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-full h-10" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-full h-20" />
      </div>
      <div className="flex justify-end space-x-2">
        <Skeleton className="w-20 h-10" />
        <Skeleton className="w-24 h-10" />
      </div>
    </div>
  )
} 