import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X, Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadPreviewProps {
  currentImage?: string
  onUpload: (file: File) => Promise<void>
  type: 'profile' | 'cover'
  className?: string
  isUploading?: boolean
  userInitials?: string
}

export const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  currentImage,
  onUpload,
  type,
  className,
  isUploading = false,
  userInitials
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        await onUpload(selectedFile)
        // Clear preview after successful upload
        setPreviewImage(null)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
  }

  const handleCancel = () => {
    setPreviewImage(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImage = previewImage || currentImage

  if (type === 'cover') {
    return (
      <div className={cn("relative w-full", className)}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
        
        <div
          className="h-48 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-r from-blue-600 to-purple-600 bg-cover bg-center relative rounded-lg overflow-hidden"
          style={{ backgroundImage: displayImage ? `url(${displayImage})` : undefined }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          {/* Upload/Edit Button */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Edit Cover</span>
            <span className="sm:hidden">Edit</span>
          </Button>

          {/* Preview Actions */}
          {previewImage && (
            <div className="absolute bottom-3 right-3 flex gap-2">
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Upload className="h-3 w-3 mr-1" />
                )}
                Upload
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCancel}
                disabled={isUploading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Preview Badge */}
          {previewImage && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs">
              Preview
            </div>
          )}
        </div>
      </div>
    )
  }

  // Profile image - show the actual profile image with camera button
  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      {/* Profile Image Display */}
      <div className="relative">
        <div 
          className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full border-2 sm:border-4 border-white shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-cover bg-center overflow-hidden flex items-center justify-center"
          style={{ backgroundImage: displayImage ? `url(${displayImage})` : undefined }}
        >
          {!displayImage && (
            <div className="text-white text-lg sm:text-xl md:text-2xl font-bold">
              {userInitials || '?'}
            </div>
          )}
        </div>
        
        {/* Upload/Edit Button */}
        <Button
          size="sm"
          variant="secondary"
          className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 h-6 w-6 sm:h-8 sm:w-8 rounded-full p-0 bg-white shadow-md"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Preview Modal/Overlay */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Preview Profile Image</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isUploading}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Preview Image */}
            <div className="flex justify-center mb-4">
              <div 
                className="h-32 w-32 rounded-full bg-cover bg-center border-4 border-gray-200"
                style={{ backgroundImage: `url(${previewImage})` }}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
