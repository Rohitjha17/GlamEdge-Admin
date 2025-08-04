"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft, IndianRupee, Loader2, Star, TrendingUp, Clock, Users, Sparkles, Gift } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { servicesApi, subCategoriesApi } from "@/lib/api"
import { ImageUpload } from "@/components/ui/image-upload"

interface Service {
  _id: string
  name: string
  price: number
  description: string
  imageUrl: string
  subCategoryId?: {
    _id: string
    name: string
  }
  createdAt: string
  isTrendingNearYou?: boolean
  isBestSeller?: boolean
  isLastMinuteAddon?: boolean
  isPeopleAlsoAvailed?: boolean
  isSpaRetreatForWomen?: boolean
  isWhatsNew?: boolean
}

interface SubCategory {
  _id: string
  name: string
  mainCategoryId: {
    name: string
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    subCategoryId: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [flagLoading, setFlagLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [servicesData, subCategoriesData] = await Promise.all([servicesApi.getAll(), subCategoriesApi.getAll()])
      setServices(servicesData)
      setSubCategories(subCategoriesData)
    } catch (error: any) {
      setError(error.message || "Failed to fetch data")
      console.error("Fetch data error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.description || !formData.imageUrl || !formData.subCategoryId) {
      setError("Please fill all fields")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const serviceData = {
        ...formData,
        price: Number.parseInt(formData.price),
      }

      if (editingService) {
        await servicesApi.update(editingService._id, serviceData)
      } else {
        await servicesApi.create(serviceData)
      }

      await fetchData()
      setIsDialogOpen(false)
      setEditingService(null)
      setFormData({ name: "", price: "", description: "", imageUrl: "", subCategoryId: "" })
    } catch (error: any) {
      setError(error.message || "Failed to save service")
      console.error("Save service error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      price: service.price.toString(),
      description: service.description,
      imageUrl: service.imageUrl,
      subCategoryId: service.subCategoryId?._id || "",
    })
    setError("")
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      await servicesApi.delete(id)
      await fetchData()
    } catch (error: any) {
      alert(error.message || "Failed to delete service")
      console.error("Delete service error:", error)
    }
  }

  const handleFlagToggle = async (serviceId: string, flagType: string, isAdding: boolean) => {
    setFlagLoading(serviceId)
    try {
      if (isAdding) {
        switch (flagType) {
          case 'trending':
            await servicesApi.markAsTrendingNearYou(serviceId)
            break
          case 'bestseller':
            await servicesApi.markAsBestSeller(serviceId)
            break
          case 'lastminute':
            await servicesApi.markAsLastMinuteAddon(serviceId)
            break
          case 'people':
            await servicesApi.markAsPeopleAlsoAvailed(serviceId)
            break
          case 'spa':
            await servicesApi.markAsSpaRetreatForWomen(serviceId)
            break
          case 'whatsnew':
            await servicesApi.markAsWhatsNew(serviceId)
            break
        }
      } else {
        switch (flagType) {
          case 'trending':
            await servicesApi.removeFromTrendingNearYou(serviceId)
            break
          case 'bestseller':
            await servicesApi.removeFromBestSeller(serviceId)
            break
          case 'lastminute':
            await servicesApi.removeFromLastMinuteAddon(serviceId)
            break
          case 'people':
            await servicesApi.removeFromPeopleAlsoAvailed(serviceId)
            break
          case 'spa':
            await servicesApi.removeFromSpaRetreatForWomen(serviceId)
            break
          case 'whatsnew':
            await servicesApi.removeFromWhatsNew(serviceId)
            break
        }
      }
      await fetchData()
    } catch (error: any) {
      alert(error.message || `Failed to ${isAdding ? 'add' : 'remove'} flag`)
      console.error("Flag toggle error:", error)
    } finally {
      setFlagLoading(null)
    }
  }

  const openAddDialog = () => {
    setEditingService(null)
    setFormData({ name: "", price: "", description: "", imageUrl: "", subCategoryId: "" })
    setError("")
    setIsDialogOpen(true)
  }

  const getFlagBadge = (service: Service, flagType: string, label: string, icon: any, color: string) => {
    const isActive = service[`is${flagType.charAt(0).toUpperCase() + flagType.slice(1)}` as keyof Service] as boolean
    return (
      <Badge
        variant={isActive ? "default" : "secondary"}
        className={`cursor-pointer ${isActive ? color : 'hover:bg-gray-100'}`}
        onClick={() => handleFlagToggle(service._id, flagType, !isActive)}
        disabled={flagLoading === service._id}
      >
        {flagLoading === service._id ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : (
          icon
        )}
        {label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading services...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold">Services</h1>
              <p className="text-gray-600">Manage your beauty services and flags</p>
            </div>
          </div>
          <Button onClick={openAddDialog} className="bg-gradient-to-r from-pink-500 to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Services ({services.length})</CardTitle>
            <CardDescription>View and manage all your services and their flags</CardDescription>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No services found. Create your first service to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Sub Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service._id}>
                        <TableCell>
                          <Image
                            src={service.imageUrl || "/placeholder.svg"}
                            alt={service.name}
                            width={50}
                            height={50}
                            className="rounded-lg object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4" />
                            {service.price}
                          </div>
                        </TableCell>
                        <TableCell>{service.subCategoryId?.name || "Not assigned"}</TableCell>
                        <TableCell className="max-w-xs truncate">{service.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {getFlagBadge(service, 'trending', 'Trending', <TrendingUp className="h-3 w-3 mr-1" />, 'bg-orange-500')}
                            {getFlagBadge(service, 'bestseller', 'Best Seller', <Star className="h-3 w-3 mr-1" />, 'bg-yellow-500')}
                            {getFlagBadge(service, 'lastminute', 'Last Minute', <Clock className="h-3 w-3 mr-1" />, 'bg-red-500')}
                            {getFlagBadge(service, 'people', 'People Also', <Users className="h-3 w-3 mr-1" />, 'bg-blue-500')}
                            {getFlagBadge(service, 'spa', 'Spa Retreat', <Sparkles className="h-3 w-3 mr-1" />, 'bg-purple-500')}
                            {getFlagBadge(service, 'whatsnew', 'What\'s New', <Gift className="h-3 w-3 mr-1" />, 'bg-green-500')}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(service.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(service._id)}
                              className="text-red-600 hover:text-red-700"
                            >
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

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
              <DialogDescription>
                {editingService ? "Update the service details below." : "Enter the details for the new service."}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
            )}

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premium Facial"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="1299"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subCategory">Sub Category</Label>
                <Select
                  value={formData.subCategoryId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, subCategoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub category" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((subCategory) => (
                      <SelectItem key={subCategory._id} value={subCategory._id}>
                        {subCategory.name} ({subCategory.mainCategoryId.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Service description..."
                  rows={3}
                />
              </div>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                onUploadError={(error) => setError(error)}
                label="Service Image"
                placeholder="Upload a service image"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-pink-500 to-purple-600"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingService ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  `${editingService ? "Update" : "Add"} Service`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
