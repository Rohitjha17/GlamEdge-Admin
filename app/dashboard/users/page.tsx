"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Phone, Mail, MapPin, Loader2, Eye, Edit, Trash2 } from "lucide-react"
import { authApi } from "@/lib/api"

interface User {
  _id: string
  name: string
  phoneNumber: string
  email?: string
  role: string
  isVerified: boolean
  addresses?: string[]
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Note: This would need a proper users API endpoint
      // For now, we'll use mock data since the API collection doesn't show a users endpoint
      const mockUsers: User[] = [
        {
          _id: "1",
          name: "John Doe",
          phoneNumber: "9876543210",
          email: "john@example.com",
          role: "user",
          isVerified: true,
          addresses: ["1821/41, Pocket 25, Jorbagh, Tri Nagar, New Delhi"],
          createdAt: "2024-01-15T10:30:00Z"
        },
        {
          _id: "2",
          name: "Jane Smith",
          phoneNumber: "9876543211",
          email: "jane@example.com",
          role: "user",
          isVerified: true,
          addresses: ["123 Main Street, Delhi"],
          createdAt: "2024-01-16T14:20:00Z"
        },
        {
          _id: "3",
          name: "Admin User",
          phoneNumber: "9876543212",
          email: "admin@glamedge.com",
          role: "admin",
          isVerified: true,
          addresses: [],
          createdAt: "2024-01-10T09:00:00Z"
        }
      ]
      setUsers(mockUsers)
    } catch (error: any) {
      setError(error.message || "Failed to fetch users")
      console.error("Fetch users error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: "bg-red-500", text: "Admin" },
      user: { color: "bg-blue-500", text: "User" },
    }
    const config = roleConfig[role as keyof typeof roleConfig] || { color: "bg-gray-500", text: role }
    return <Badge className={config.color}>{config.text}</Badge>
  }

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge className="bg-green-500">Verified</Badge>
    ) : (
      <Badge variant="secondary">Unverified</Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600">Manage customer accounts and profiles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.isVerified).length}
            </div>
            <p className="text-xs text-muted-foreground">Phone verified</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'user').length}
            </div>
            <p className="text-xs text-muted-foreground">Customer accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">Administrator accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
          <CardDescription>View and manage all registered users</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Addresses</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.email ? (
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getVerificationBadge(user.isVerified)}</TableCell>
                      <TableCell>
                        {user.addresses && user.addresses.length > 0 ? (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="text-sm">{user.addresses.length} address(es)</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No addresses</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
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

      {/* View User Dialog */}
      {selectedUser && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isViewDialogOpen ? '' : 'hidden'}`}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <Button variant="outline" size="sm" onClick={() => setIsViewDialogOpen(false)}>
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-sm">{selectedUser.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                <p className="text-sm">{selectedUser.phoneNumber}</p>
              </div>
              
              {selectedUser.email && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Verification Status</label>
                <div className="mt-1">{getVerificationBadge(selectedUser.isVerified)}</div>
              </div>
              
              {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Addresses</label>
                  <div className="mt-1 space-y-1">
                    {selectedUser.addresses.map((address, index) => (
                      <p key={index} className="text-sm text-gray-700">{address}</p>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-600">Joined</label>
                <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}
