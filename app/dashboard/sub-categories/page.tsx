"use client"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"
import { subCategoriesApi, mainCategoriesApi } from "@/lib/api"
import { ImageUpload } from "@/components/ui/image-upload"

interface SubCategory {
  _id: string
  name: string
  imageUrl: string
  mainCategoryId: {
    _id: string
    name: string
  }
  createdAt: string
}

interface MainCategory {
  _id: string
  name: string
}

export default function SubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
    mainCategoryId: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [subCategoriesData, mainCategoriesData] = await Promise.all([
        subCategoriesApi.getAll(),
        mainCategoriesApi.getAll(),
      ])
      setSubCategories(subCategoriesData)
      setMainCategories(mainCategoriesData)
    } catch (error: any) {
      setError(error.message || "Failed to fetch data")
      console.error("Fetch data error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.imageUrl || !formData.mainCategoryId) {
      setError("Please fill all fields")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      if (editingSubCategory) {
        await subCategoriesApi.update(editingSubCategory._id, formData)
      } else {
        await subCategoriesApi.create(formData)
      }

      await fetchData()
      setIsDialogOpen(false)
      setEditingSubCategory(null)
      setFormData({ name: "", imageUrl: "", mainCategoryId: "" })
    } catch (error: any) {
      setError(error.message || "Failed to save subcategory")
      console.error("Save subcategory error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory)
    setFormData({
      name: subCategory.name,
      imageUrl: subCategory.imageUrl,
      mainCategoryId: subCategory.mainCategoryId._id,
    })
    setError("")
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return

    try {
      await subCategoriesApi.delete(id)
      await fetchData()
    } catch (error: any) {
      alert(error.message || "Failed to delete subcategory")
      console.error("Delete subcategory error:", error)
    }
  }

  const openAddDialog = () => {
    setEditingSubCategory(null)
    setFormData({ name: "", imageUrl: "", mainCategoryId: "" })
    setError("")
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading subcategories...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sub Categories</h1>
          <p className="text-gray-600">Manage your service subcategories</p>
        </div>
        <Button onClick={openAddDialog} className="bg-gradient-to-r from-pink-500 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Sub Category
        </Button>
      </div>

      {/* Sub Categories Table */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>All Sub Categories ({subCategories.length})</CardTitle>
          <CardDescription>View and manage all subcategories</CardDescription>
        </CardHeader>
        <CardContent>
          {subCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No subcategories found. Create your first subcategory to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Main Category</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subCategories.map((subCategory) => (
                  <TableRow key={subCategory._id}>
                    <TableCell>
                      <Image
                        src={subCategory.imageUrl || "/placeholder.svg"}
                        alt={subCategory.name}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{subCategory.name}</TableCell>
                    <TableCell>{subCategory.mainCategoryId.name}</TableCell>
                    <TableCell>{new Date(subCategory.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(subCategory)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(subCategory._id)}
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
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubCategory ? "Edit Sub Category" : "Add New Sub Category"}</DialogTitle>
            <DialogDescription>
              {editingSubCategory
                ? "Update the subcategory details below."
                : "Enter the details for the new subcategory."}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Sub Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Facial"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mainCategory">Main Category</Label>
              <Select
                value={formData.mainCategoryId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, mainCategoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              onUploadError={(error) => setError(error)}
              label="Sub Category Image"
              placeholder="Upload a sub category image"
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
                  {editingSubCategory ? "Updating..." : "Adding..."}
                </>
              ) : (
                `${editingSubCategory ? "Update" : "Add"} Sub Category`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
