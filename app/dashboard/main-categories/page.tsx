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
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { mainCategoriesApi } from "@/lib/api"

interface MainCategory {
  _id: string
  name: string
  imageUrl: string
  createdAt: string
}

export default function MainCategoriesPage() {
  const [categories, setCategories] = useState<MainCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MainCategory | null>(null)
  const [formData, setFormData] = useState({ name: "", imageUrl: "" })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await mainCategoriesApi.getAll()
      setCategories(data)
    } catch (error: any) {
      setError(error.message || "Failed to fetch categories")
      console.error("Fetch categories error:", error)
    } finally {
      setLoading(false)
    }
  }

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

      await fetchCategories()
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
      await fetchCategories()
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading categories...</span>
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
              <h1 className="text-3xl font-bold">Main Categories</h1>
              <p className="text-gray-600">Manage your main service categories</p>
            </div>
          </div>
          <Button onClick={openAddDialog} className="bg-gradient-to-r from-pink-500 to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Main Categories ({categories.length})</CardTitle>
            <CardDescription>View and manage all main categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No categories found. Create your first category to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        <Image
                          src={category.imageUrl || "/placeholder.svg"}
                          alt={category.name}
                          width={50}
                          height={50}
                          className="rounded-lg object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category._id)}
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
              <DialogTitle>{editingCategory ? "Edit Main Category" : "Add New Main Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Update the category details below." : "Enter the details for the new category."}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
            )}

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Salon at Home"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
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
    </div>
  )
}
