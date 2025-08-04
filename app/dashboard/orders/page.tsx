"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShoppingCart, Package, Calendar, MapPin, Loader2, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { cartApi } from "@/lib/api"
import { Logo } from "@/components/ui/logo"

interface CartItem {
  _id: string
  serviceId: {
    _id: string
    name: string
    price: number
    imageUrl: string
  }
  quantity: number
  totalPrice: number
}

interface Booking {
  _id: string
  userId: string
  checkoutId: string
  professionalType: string
  date: string
  time: string
  address: string
  status: string
  createdAt: string
  services: CartItem[]
  totalAmount: number
}

export default function OrdersPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await cartApi.getBookingDetails()
      setBookings(data)
    } catch (error: any) {
      console.error("Fetch bookings error:", error)
      // Don't show error if it's just that no bookings exist
      if (error.message && !error.message.includes("Endpoint not available")) {
        setError(error.message || "Failed to fetch bookings")
      } else {
        setBookings([])
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", text: "Pending" },
      confirmed: { color: "bg-green-500", text: "Confirmed" },
      completed: { color: "bg-blue-500", text: "Completed" },
      cancelled: { color: "bg-red-500", text: "Cancelled" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-500", text: status }
    return <Badge className={config.color}>{config.text}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-pink-500 mr-3" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Loading Orders
            </h1>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
            <span className="text-gray-600">Loading your orders...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders & Bookings</h1>
                <p className="text-gray-600">Manage customer orders and bookings</p>
              </div>
            </div>
            <div className="hidden md:block">
              <Logo size="sm" variant="simple" />
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-pink-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Orders</CardTitle>
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
              <p className="text-xs text-gray-500">All time orders</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-yellow-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-2 rounded-lg">
                <Package className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'pending').length}
              </div>
              <p className="text-xs text-gray-500">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Confirmed</CardTitle>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </div>
              <p className="text-xs text-gray-500">Scheduled bookings</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-2 rounded-lg">
                <Package className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'completed').length}
              </div>
              <p className="text-xs text-gray-500">Finished services</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-pink-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">All Orders ({bookings.length})</CardTitle>
            <CardDescription>View and manage all customer orders and bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-4">
                  Orders will appear here when customers make bookings through your platform.
                </p>
                <div className="text-sm text-gray-400">
                  <p>• Customer bookings will show up automatically</p>
                  <p>• You can track order status and manage bookings</p>
                  <p>• Real-time updates when new orders come in</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Professional</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell className="font-mono text-sm">{booking.checkoutId}</TableCell>
                        <TableCell>{booking.userId}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {booking.services?.map((item, index) => (
                              <div key={index} className="text-sm">
                                {item.serviceId.name} x{item.quantity}
                              </div>
                            )) || "No services"}
                          </div>
                        </TableCell>
                        <TableCell>{booking.professionalType}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(booking.date).toLocaleDateString()}</div>
                            <div className="text-gray-500">{booking.time}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {booking.address}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{booking.totalAmount || booking.services?.reduce((sum, item) => sum + item.totalPrice, 0) || 0}
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
