"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { uploadImage, UploadResult } from "@/lib/cloudinary"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onUploadStart?: () => void
  onUploadComplete?: (result: UploadResult) => void
  onUploadError?: (error: string) => void
  className?: string
  label?: string
  placeholder?: string
  accept?: string
  maxSize?: number // in MB
}

export function ImageUpload({
  value,
  onChange,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  className = "",
  label = "Image",
  placeholder = "Upload an image",
  accept = "image/*",
  maxSize = 5, // 5MB default
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      onUploadError?.(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Please select a valid image file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Cloudinary
    try {
      setIsUploading(true)
      onUploadStart?.()

      const result = await uploadImage(file)
      onChange(result.secure_url)
      onUploadComplete?.(result)
    } catch (error: any) {
      console.error('Upload error:', error)
      onUploadError?.(error.message || 'Upload failed')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>{label}</Label>
      
      <div className="space-y-4">
        {/* File Input */}
        <div className="flex items-center space-x-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={isUploading}
            className="flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Choose File</span>
              </>
            )}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={isUploading}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div className="relative">
            <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Image uploaded successfully
            </p>
          </div>
        )}

        {/* URL Input (for manual entry as fallback) */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL (or upload above)</Label>
          <Input
            id="imageUrl"
            type="url"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={isUploading}
          />
        </div>

        {/* Upload Info */}
        <div className="text-xs text-gray-500">
          <p>• Supported formats: JPG, PNG, GIF, WebP</p>
          <p>• Maximum file size: {maxSize}MB</p>
          <p>• Images will be optimized automatically</p>
        </div>
      </div>
    </div>
  )
} 