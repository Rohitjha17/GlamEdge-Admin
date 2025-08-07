"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  TrendingUp, 
  Star, 
  Clock, 
  Users, 
  Sparkles, 
  Gift, 
  Loader2, 
  Search,
  Plus,
  X,
  AlertCircle
} from "lucide-react"
import { servicesApi } from "@/lib/api"

interface Service {
  _id: string
  name: string
  price: number
  imageUrl: string
  subCategoryId?: {
    name: string
  }
  // Service flags
  isTrendingNearYou?: boolean
  isBestSeller?: boolean
  isLastMinuteAddon?: boolean
  isPeopleAlsoAvailed?: boolean
  isSpaRetreatForWomen?: boolean
  isWhatsNew?: boolean
}

interface FlagCategory {
  id: string
  name: string
  description: string
  icon: any
  color: string
  markEndpoint: string
  removeEndpoint: string
}

export default function ServiceFlagsPage() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [flagLoading, setFlagLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedService, setSelectedService] = useState<string>("")
  const [error, setError] = useState("")

  const flagCategories: FlagCategory[] = [
    {
      id: "trending",
      name: "Trending Near You",
      description: "Services that appear in trending section",
      icon: TrendingUp,
      color: "bg-orange-500",
      markEndpoint: "trending-near-you",
      removeEndpoint: "remove-trending-near-you"
    },
    {
      id: "bestseller",
      name: "Best Seller",
      description: "Services marked as best sellers",
      icon: Star,
      color: "bg-yellow-500",
      markEndpoint: "best-seller",
      removeEndpoint: "remove-best-seller"
    },
    {
      id: "lastminute",
      name: "Last Minute Addon",
      description: "Services available for last minute booking",
      icon: Clock,
      color: "bg-red-500",
      markEndpoint: "last-minute-addon",
      removeEndpoint: "remove-last-minute-addon"
    },
    {
      id: "people",
      name: "People Also Availed",
      description: "Services that customers also booked",
      icon: Users,
      color: "bg-blue-500",
      markEndpoint: "people-also-availed",
      removeEndpoint: "remove-people-also-availed"
    },
    {
      id: "spa",
      name: "Spa Retreat for Women",
      description: "Services specifically for spa retreat",
      icon: Sparkles,
      color: "bg-purple-500",
      markEndpoint: "spa-retreat-for-women",
      removeEndpoint: "remove-spa-retreat-for-women"
    },
    {
      id: "whatsnew",
      name: "What's New",
      description: "Newly launched services",
      icon: Gift,
      color: "bg-green-500",
      markEndpoint: "whats-new",
      removeEndpoint: "remove-whats-new"
    }
  ]

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [services, searchTerm, selectedCategory])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const data = await servicesApi.getAll()
      setServices(data)
    } catch (error: any) {
      setError(error.message || "Failed to fetch services")
      console.error("Fetch services error:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = services

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      const flagKey = `is${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}` as keyof Service
      filtered = filtered.filter(service => service[flagKey] as boolean)
    }

    setFilteredServices(filtered)
  }

  const handleFlagToggle = async (serviceId: string, category: FlagCategory, isAdding: boolean) => {
    setFlagLoading(`${serviceId}-${category.id}`)
    try {
      if (isAdding) {
        await servicesApi[`markAs${category.name.replace(/\s+/g, '')}` as keyof typeof servicesApi](serviceId)
      } else {
        await servicesApi[`removeFrom${category.name.replace(/\s+/g, '')}` as keyof typeof servicesApi](serviceId)
      }
      await fetchServices()
    } catch (error: any) {
      setError(error.message || `Failed to ${isAdding ? 'add' : 'remove'} flag`)
      console.error("Flag toggle error:", error)
    } finally {
      setFlagLoading(null)
    }
  }

  const getFlagStatus = (service: Service, categoryId: string) => {
    const flagKey = `is${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}` as keyof Service
    return service[flagKey] as boolean
  }

  const getServicesWithFlag = (categoryId: string) => {
    const flagKey = `is${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}` as keyof Service
    return services.filter(service => service[flagKey] as boolean)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading service flags...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Flags Management</h1>
        <p className="text-gray-600">Manage service marketing flags and categories</p>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="search">Search Services</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="category">Filter by Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {flagCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="service">Select Service</Label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service._id} value={service._id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Flag Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flagCategories.map((category) => (
          <Card key={category.id} className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                <Badge className={category.color}>
                  {getServicesWithFlag(category.id).length}
                </Badge>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Services with this flag: {getServicesWithFlag(category.id).length}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className={category.color}
                    onClick={() => {
                      if (selectedService) {
                        const service = services.find(s => s._id === selectedService)
                        if (service) {
                          handleFlagToggle(selectedService, category, !getFlagStatus(service, category.id))
                        }
                      }
                    }}
                    disabled={!selectedService || flagLoading === `${selectedService}-${category.id}`}
                  >
                    {flagLoading === `${selectedService}-${category.id}` ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Plus className="h-3 w-3 mr-1" />
                    )}
                    {selectedService && getFlagStatus(services.find(s => s._id === selectedService)!, category.id) 
                      ? "Remove Flag" 
                      : "Add Flag"
                    }
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Services Table with Flags */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Services with Flags ({filteredServices.length})</CardTitle>
          <CardDescription>View and manage service flags</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedCategory !== "all" 
                ? "No services match your filters." 
                : "No services found."
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={service.imageUrl || "/placeholder.svg"}
                            alt={service.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium">{service.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>₹{service.price}</TableCell>
                      <TableCell>{service.subCategoryId?.name || "Not assigned"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {flagCategories.map((category) => {
                            const isActive = getFlagStatus(service, category.id)
                            return (
                              <Badge
                                key={category.id}
                                variant={isActive ? "default" : "secondary"}
                                className={`cursor-pointer ${isActive ? category.color : 'hover:bg-gray-100'}`}
                                onClick={() => handleFlagToggle(service._id, category, !isActive)}
                              >
                                {flagLoading === `${service._id}-${category.id}` ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <category.icon className="h-3 w-3 mr-1" />
                                )}
                                {category.name}
                              </Badge>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {flagCategories.map((category) => {
                            const isActive = getFlagStatus(service, category.id)
                            return (
                              <Button
                                key={category.id}
                                variant="outline"
                                size="sm"
                                className={isActive ? category.color.replace('bg-', 'border-').replace('-500', '-300') : ''}
                                onClick={() => handleFlagToggle(service._id, category, !isActive)}
                                disabled={flagLoading === `${service._id}-${category.id}`}
                              >
                                {flagLoading === `${service._id}-${category.id}` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : isActive ? (
                                  <X className="h-3 w-3" />
                                ) : (
                                  <Plus className="h-3 w-3" />
                                )}
                              </Button>
                            )
                          })}
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

      {/* API Endpoints Reference */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>API Endpoints Reference</CardTitle>
          <CardDescription>Available POST endpoints for service flag management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flagCategories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`p-1 rounded ${category.color}`}>
                    <category.icon className="h-3 w-3 text-white" />
                  </div>
                  <h4 className="font-medium">{category.name}</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-600 font-mono">POST</span>
                    <span className="text-gray-600">/api/services/{category.markEndpoint}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-600 font-mono">POST</span>
                    <span className="text-gray-600">/api/services/{category.removeEndpoint}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 