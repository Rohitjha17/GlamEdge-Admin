"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, Shield, Bell, Globe, Database, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { authApi } from "@/lib/api"

interface Profile {
  _id: string
  name: string
  phoneNumber: string
  email?: string
  role: string
  isVerified: boolean
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await authApi.getProfile()
      setProfile(data)
      setFormData({
        name: data.name || "",
        email: data.email || "",
      })
    } catch (error: any) {
      setError(error.message || "Failed to fetch profile")
      console.error("Fetch profile error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!formData.name.trim()) {
      setError("Name is required")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      await authApi.updateProfile(formData)
      setSuccess("Profile updated successfully!")
      await fetchProfile()
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
      console.error("Update profile error:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-gray-600">Manage your account and system preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={profile?.phoneNumber || ""}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Phone number cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={profile?.role || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <CardTitle>System Information</CardTitle>
              </div>
              <CardDescription>Current system status and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Status</span>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Backend URL</span>
                  <span className="text-sm text-gray-500">https://yes-madem-backened.onrender.com</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <span className="text-sm text-green-600">Online</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Environment</span>
                  <span className="text-sm text-blue-600">Production</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span className="text-sm text-gray-500">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Two-Factor Authentication</span>
                  <span className="text-sm text-gray-500">Not enabled</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Session Timeout</span>
                  <span className="text-sm text-gray-500">24 hours</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Login History</span>
                  <span className="text-sm text-blue-600">View</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Security Settings
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Notifications</span>
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SMS Notifications</span>
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Order Updates</span>
                  <span className="text-sm text-green-600">Enabled</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Alerts</span>
                  <span className="text-sm text-gray-500">Disabled</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Notification Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* API Configuration */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <CardTitle>API Configuration</CardTitle>
            </div>
            <CardDescription>Backend API settings and endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input
                  value="https://yes-madem-backened.onrender.com"
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label>API Prefix</Label>
                <Input
                  value="/api"
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Authentication</Label>
                <Input
                  value="JWT Bearer Token"
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Input
                  value="application/json"
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
