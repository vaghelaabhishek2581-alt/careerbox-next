"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  type: "profile" | "cover";
  currentImage?: string;
  className?: string;
  onUpload: (url: string) => void;
}

export function ImageUpload({
  type,
  currentImage,
  className,
  onUpload,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Get upload URL
      const response = await fetch("/api/user/profile/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          contentType: file.type,
        }),
      });

      if (!response.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, fileUrl } = await response.json();

      // Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      onUpload(fileUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("relative group", className)}>
      {currentImage || preview ? (
        <div className="relative">
          <img
            src={preview || currentImage}
            alt={`${type} image`}
            className={cn(
              "w-full object-cover",
              type === "profile"
                ? "aspect-square rounded-full"
                : "aspect-[3/1] rounded-lg"
            )}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              setPreview(null);
              onUpload("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer",
            type === "profile"
              ? "aspect-square rounded-full"
              : "aspect-[3/1] rounded-lg",
            isUploading && "opacity-50 pointer-events-none"
          )}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            {isUploading ? "Uploading..." : `Click to upload ${type} image`}
          </p>
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        disabled={isUploading}
      />
    </div>
  );
}
