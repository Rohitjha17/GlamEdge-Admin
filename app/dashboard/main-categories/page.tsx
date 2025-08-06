"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Loader2, Search, Filter } from "lucide-react"
import Image from "next/image"
import { mainCategoriesApi } from "@/lib/api"
import { ImageUpload } from "@/components/ui/image-upload"
import { TableSkeleton } from "@/components/ui/loading-skeleton"

interface MainCategory {
  _id: string
  name: string
  imageUrl: string
  createdAt: string
}

export default function MainCategoriesPage() {
  const [categories, setCategories] = useState<MainCategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<MainCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MainCategory | null>(null)
  const [formData, setFormData] = useState({ name: "", imageUrl: "" })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Memoized fetch function
  const fetchCategories = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
    }
    setError("")

    try {
      const data = await mainCategoriesApi.getAll()
      setCategories(data)
      setFilteredCategories(data)
    } catch (error: any) {
      setError(error.message || "Failed to fetch categories")
      console.error("Fetch categories error:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Search and filter functionality
  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCategories(filtered)
  }, [categories, searchTerm])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSubmit = async () => {
    if (!formData.name || !formData.imageUrl) {
      setError("Please fill all fields")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      if (editingCategory) {
        await mainCategoriesApi.update(editingCategory._id, formData)
      } else {
        await mainCategoriesApi.create(formData)
      }

      await fetchCategories(false)
      setIsDialogOpen(false)
      setEditingCategory(null)
      setFormData({ name: "", imageUrl: "" })
    } catch (error: any) {
      setError(error.message || "Failed to save category")
      console.error("Save category error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category: MainCategory) => {
    setEditingCategory(category)
    setFormData({ name: category.name, imageUrl: category.imageUrl })
    setError("")
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      await mainCategoriesApi.delete(id)
      await fetchCategories(false)
    } catch (error: any) {
      alert(error.message || "Failed to delete category")
      console.error("Delete category error:", error)
    }
  }

  const openAddDialog = () => {
    setEditingCategory(null)
    setFormData({ name: "", imageUrl: "" })
    setError("")
    setIsDialogOpen(true)
  }

  if (loading) {
    return <TableSkeleton />
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Main Categories</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your main service categories</p>
        </div>
        <Button onClick={openAddDialog} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search and Filter */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
          />
        </div>
      </div>

      {/* Categories Table */}
      <Card className="bg-white/90 backdrop-blur-sm border-pink-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900">All Main Categories ({filteredCategories.length})</CardTitle>
          <CardDescription>View and manage all main categories</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No categories found' : 'No categories yet'}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">
                {searchTerm 
                  ? `No categories match "${searchTerm}"` 
                  : 'Create your first category to get started.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={openAddDialog} className="bg-gradient-to-r from-pink-500 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Category
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-pink-100">
                    <TableHead className="text-gray-700 font-semibold">Image</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Name</TableHead>
                    <TableHead className="text-gray-700 font-semibold hidden sm:table-cell">Created Date</TableHead>
                    <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category._id} className="hover:bg-pink-50/50 transition-colors">
                      <TableCell>
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 border-pink-100">
                          <Image
                            src={category.imageUrl || "/placeholder.svg"}
                            alt={category.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        <div>
                          <div className="text-sm sm:text-base">{category.name}</div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 hidden sm:table-cell">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1 sm:space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(category)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category._id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {editingCategory ? "Edit Main Category" : "Add New Main Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? "Update the category details below." 
                : "Enter the details for the new category."
              }
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-700">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Salon at Home"
                className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              />
            </div>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              onUploadError={(error) => setError(error)}
              label="Category Image"
              placeholder="Upload a category image"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)} 
              disabled={submitting}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingCategory ? "Updating..." : "Adding..."}
                </>
              ) : (
                `${editingCategory ? "Update" : "Add"} Category`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
