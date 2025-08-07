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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, IndianRupee, Loader2, Star, TrendingUp, Clock, Users, Sparkles, Gift, X } from "lucide-react"
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
  // Service flags
  isTrendingNearYou?: boolean
  isBestSeller?: boolean
  isLastMinuteAddon?: boolean
  isPeopleAlsoAvailed?: boolean
  isSpaRetreatForWomen?: boolean
  isWhatsNew?: boolean
  // Additional comprehensive fields
  keyIngredients?: Array<{
    name: string
    description: string
    imageUrl: string
  }>
  benefits?: string[]
  procedure?: Array<{
    title: string
    description: string
    imageUrl: string
  }>
  precautionsAndAftercare?: string[]
  thingsToKnow?: string[]
  faqs?: Array<{
    question: string
    answer: string
  }>
  isDiscounted?: boolean
  discountPrice?: number
  originalPrice?: number
  offerTags?: string[]
  duration?: string
  includedItems?: string[]
  popularity?: string
  isNewLaunch?: boolean
  categoryTags?: string[]
  brand?: string
  professionalTypes?: string[]
  serviceCharge?: number
  productCost?: number
  disposableCost?: number
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
    // Additional comprehensive fields
    keyIngredients: [] as Array<{ name: string; description: string; imageUrl: string }>,
    benefits: [] as string[],
    procedure: [] as Array<{ title: string; description: string; imageUrl: string }>,
    precautionsAndAftercare: [] as string[],
    thingsToKnow: [] as string[],
    faqs: [] as Array<{ question: string; answer: string }>,
    isDiscounted: false,
    discountPrice: "",
    originalPrice: "",
    offerTags: [] as string[],
    duration: "",
    includedItems: [] as string[],
    popularity: "",
    isNewLaunch: false,
    categoryTags: [] as string[],
    brand: "",
    professionalTypes: [] as string[],
    serviceCharge: "",
    productCost: "",
    disposableCost: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [flagLoading, setFlagLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")

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
      setError("Please fill all required fields")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const serviceData = {
        ...formData,
        price: Number.parseInt(formData.price),
        discountPrice: formData.discountPrice ? Number.parseInt(formData.discountPrice) : undefined,
        originalPrice: formData.originalPrice ? Number.parseInt(formData.originalPrice) : undefined,
        serviceCharge: formData.serviceCharge ? Number.parseInt(formData.serviceCharge) : undefined,
        productCost: formData.productCost ? Number.parseInt(formData.productCost) : undefined,
        disposableCost: formData.disposableCost ? Number.parseInt(formData.disposableCost) : undefined,
      }

      if (editingService) {
        await servicesApi.update(editingService._id, serviceData)
      } else {
        await servicesApi.create(serviceData)
      }

      await fetchData()
      setIsDialogOpen(false)
      setEditingService(null)
      resetFormData()
    } catch (error: any) {
      setError(error.message || "Failed to save service")
      console.error("Save service error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetFormData = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      imageUrl: "",
      subCategoryId: "",
      keyIngredients: [],
      benefits: [],
      procedure: [],
      precautionsAndAftercare: [],
      thingsToKnow: [],
      faqs: [],
      isDiscounted: false,
      discountPrice: "",
      originalPrice: "",
      offerTags: [],
      duration: "",
      includedItems: [],
      popularity: "",
      isNewLaunch: false,
      categoryTags: [],
      brand: "",
      professionalTypes: [],
      serviceCharge: "",
      productCost: "",
      disposableCost: "",
    })
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      price: service.price.toString(),
      description: service.description,
      imageUrl: service.imageUrl,
      subCategoryId: service.subCategoryId?._id || "",
      keyIngredients: service.keyIngredients || [],
      benefits: service.benefits || [],
      procedure: service.procedure || [],
      precautionsAndAftercare: service.precautionsAndAftercare || [],
      thingsToKnow: service.thingsToKnow || [],
      faqs: service.faqs || [],
      isDiscounted: service.isDiscounted || false,
      discountPrice: service.discountPrice?.toString() || "",
      originalPrice: service.originalPrice?.toString() || "",
      offerTags: service.offerTags || [],
      duration: service.duration || "",
      includedItems: service.includedItems || [],
      popularity: service.popularity || "",
      isNewLaunch: service.isNewLaunch || false,
      categoryTags: service.categoryTags || [],
      brand: service.brand || "",
      professionalTypes: service.professionalTypes || [],
      serviceCharge: service.serviceCharge?.toString() || "",
      productCost: service.productCost?.toString() || "",
      disposableCost: service.disposableCost?.toString() || "",
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
    resetFormData()
    setError("")
    setIsDialogOpen(true)
  }

  const addArrayItem = (field: string, item: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as any[]), item]
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).filter((_: any, i: number) => i !== index)
    }))
  }

  const updateArrayItem = (field: string, index: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as any[]).map((item: any, i: number) => i === index ? value : item)
    }))
  }

  const getFlagBadge = (service: Service, flagType: string, label: string, icon: any, color: string) => {
    const isActive = service[`is${flagType.charAt(0).toUpperCase() + flagType.slice(1)}` as keyof Service] as boolean
    return (
      <Badge
        variant={isActive ? "default" : "secondary"}
        className={`cursor-pointer ${isActive ? color : 'hover:bg-gray-100'}`}
        onClick={() => handleFlagToggle(service._id, flagType, !isActive)}
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading services...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage your beauty services and flags</p>
        </div>
        <Button onClick={openAddDialog} className="bg-gradient-to-r from-pink-500 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services Table */}
      <Card className="bg-white/90 backdrop-blur-sm">
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
                          {service.isDiscounted ? (
                            <div>
                              <span className="line-through text-gray-400">{service.originalPrice}</span>
                              <span className="text-red-600 font-bold ml-2">{service.discountPrice}</span>
                            </div>
                          ) : (
                            service.price
                          )}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>
              {editingService ? "Update the service details below." : "Enter the details for the new service."}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}

          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b">
            {["basic", "pricing", "details", "ingredients", "procedure", "faqs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === tab
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="py-4">
            {/* Basic Information Tab */}
            {activeTab === "basic" && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Korean Glow Facial"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="1249"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subCategory">Sub Category *</Label>
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
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="9 Steps Facial | Includes Free Silicone Facial Brush"
                    rows={3}
                  />
                </div>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                  onUploadError={(error) => setError(error)}
                  label="Service Image *"
                  placeholder="Upload a service image"
                />
                <div className="grid gap-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                    placeholder="e.g., ORGANICA DA ROMA"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 1 hr 15 mins"
                  />
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === "pricing" && (
              <div className="grid gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDiscounted"
                    checked={formData.isDiscounted}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isDiscounted: checked as boolean }))}
                  />
                  <Label htmlFor="isDiscounted">This service has a discount</Label>
                </div>
                {formData.isDiscounted && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="originalPrice">Original Price (₹)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))}
                        placeholder="1499"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="discountPrice">Discount Price (₹)</Label>
                      <Input
                        id="discountPrice"
                        type="number"
                        value={formData.discountPrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, discountPrice: e.target.value }))}
                        placeholder="999"
                      />
                    </div>
                  </>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="serviceCharge">Service Charge (₹)</Label>
                  <Input
                    id="serviceCharge"
                    type="number"
                    value={formData.serviceCharge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, serviceCharge: e.target.value }))}
                    placeholder="100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="productCost">Product Cost (₹)</Label>
                  <Input
                    id="productCost"
                    type="number"
                    value={formData.productCost}
                    onChange={(e) => setFormData((prev) => ({ ...prev, productCost: e.target.value }))}
                    placeholder="200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="disposableCost">Disposable Cost (₹)</Label>
                  <Input
                    id="disposableCost"
                    type="number"
                    value={formData.disposableCost}
                    onChange={(e) => setFormData((prev) => ({ ...prev, disposableCost: e.target.value }))}
                    placeholder="50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="popularity">Popularity Text</Label>
                  <Input
                    id="popularity"
                    value={formData.popularity}
                    onChange={(e) => setFormData((prev) => ({ ...prev, popularity: e.target.value }))}
                    placeholder="25K+ people booked this in last 30 days"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isNewLaunch"
                    checked={formData.isNewLaunch}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isNewLaunch: checked as boolean }))}
                  />
                  <Label htmlFor="isNewLaunch">This is a new launch</Label>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Offer Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.offerTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeArrayItem('offerTags', index)}
                        />
                      </Badge>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const tag = prompt("Enter offer tag:")
                        if (tag) addArrayItem('offerTags', tag)
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Tag
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Category Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.categoryTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeArrayItem('categoryTags', index)}
                        />
                      </Badge>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const tag = prompt("Enter category tag:")
                        if (tag) addArrayItem('categoryTags', tag)
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Tag
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Benefits</Label>
                  <div className="space-y-2">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={benefit}
                          onChange={(e) => updateArrayItem('benefits', index, e.target.value)}
                          placeholder="e.g., Deep hydration"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('benefits', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('benefits', '')}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Benefit
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Included Items</Label>
                  <div className="space-y-2">
                    {formData.includedItems.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem('includedItems', index, e.target.value)}
                          placeholder="e.g., Free Silicone Facial Brush"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('includedItems', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('includedItems', '')}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Item
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Professional Types</Label>
                  <div className="space-y-2">
                    {formData.professionalTypes.map((type, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={type}
                          onChange={(e) => updateArrayItem('professionalTypes', index, e.target.value)}
                          placeholder="e.g., Standard"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('professionalTypes', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('professionalTypes', '')}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Type
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Precautions & Aftercare</Label>
                  <div className="space-y-2">
                    {formData.precautionsAndAftercare.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem('precautionsAndAftercare', index, e.target.value)}
                          placeholder="e.g., Avoid sun exposure for 24 hours"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('precautionsAndAftercare', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('precautionsAndAftercare', '')}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Item
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Things to Know</Label>
                  <div className="space-y-2">
                    {formData.thingsToKnow.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem('thingsToKnow', index, e.target.value)}
                          placeholder="e.g., Duration: 1 hour"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('thingsToKnow', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('thingsToKnow', '')}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Ingredients Tab */}
            {activeTab === "ingredients" && (
              <div className="grid gap-4">
                <Label>Key Ingredients</Label>
                <div className="space-y-4">
                  {formData.keyIngredients.map((ingredient, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Ingredient {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('keyIngredients', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        <Input
                          placeholder="Ingredient name"
                          value={ingredient.name}
                          onChange={(e) => updateArrayItem('keyIngredients', index, { ...ingredient, name: e.target.value })}
                        />
                        <Textarea
                          placeholder="Description"
                          value={ingredient.description}
                          onChange={(e) => updateArrayItem('keyIngredients', index, { ...ingredient, description: e.target.value })}
                          rows={2}
                        />
                        <Input
                          placeholder="Image URL"
                          value={ingredient.imageUrl}
                          onChange={(e) => updateArrayItem('keyIngredients', index, { ...ingredient, imageUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('keyIngredients', { name: '', description: '', imageUrl: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>
              </div>
            )}

            {/* Procedure Tab */}
            {activeTab === "procedure" && (
              <div className="grid gap-4">
                <Label>Procedure Steps</Label>
                <div className="space-y-4">
                  {formData.procedure.map((step, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Step {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('procedure', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        <Input
                          placeholder="Step title"
                          value={step.title}
                          onChange={(e) => updateArrayItem('procedure', index, { ...step, title: e.target.value })}
                        />
                        <Textarea
                          placeholder="Step description"
                          value={step.description}
                          onChange={(e) => updateArrayItem('procedure', index, { ...step, description: e.target.value })}
                          rows={2}
                        />
                        <Input
                          placeholder="Image URL"
                          value={step.imageUrl}
                          onChange={(e) => updateArrayItem('procedure', index, { ...step, imageUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('procedure', { title: '', description: '', imageUrl: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              </div>
            )}

            {/* FAQs Tab */}
            {activeTab === "faqs" && (
              <div className="grid gap-4">
                <Label>Frequently Asked Questions</Label>
                <div className="space-y-4">
                  {formData.faqs.map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">FAQ {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('faqs', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        <Input
                          placeholder="Question"
                          value={faq.question}
                          onChange={(e) => updateArrayItem('faqs', index, { ...faq, question: e.target.value })}
                        />
                        <Textarea
                          placeholder="Answer"
                          value={faq.answer}
                          onChange={(e) => updateArrayItem('faqs', index, { ...faq, answer: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('faqs', { question: '', answer: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>
              </div>
            )}
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
  )
}
