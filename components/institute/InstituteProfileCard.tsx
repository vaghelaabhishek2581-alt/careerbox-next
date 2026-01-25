"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Camera } from "lucide-react";
import { ImageCropperDialog } from "@/components/ui/ImageCropperDialog";
import { useEffect, useState } from "react";

export function InstituteProfileCard() {
  const { selectedInstitute, currentInstitute } = useSelector(
    (state: RootState) => state.institute as any
  );
  const institute = selectedInstitute || currentInstitute;

  const coverImage = institute?.coverImage || "";
  const logo = institute?.logo || "";
  const name = institute?.name || institute?.instituteName || "Institute";
  const slug = institute?.slug || institute?._id || "";
  const getInitials = (n: string) => {
    if (!n) return "IN";
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Local preview + cropper
  const [logoUrl, setLogoUrl] = useState<string>(logo);
  const [coverUrl, setCoverUrl] = useState<string>(coverImage);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropType, setCropType] = useState<"profile" | "cover">("cover");
  const [initialUrl, setInitialUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setLogoUrl(logo);
    setCoverUrl(coverImage);
  }, [logo, coverImage]);

  async function handleCropped(file: File) {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", cropType === "cover" ? "cover" : "logo");

      const res = await fetch("/api/institute/profile/upload-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }
      const data = await res.json();
      if (data?.success && data?.imageUrl) {
        if (cropType === "cover") {
          setCoverUrl(data.imageUrl);
        } else {
          setLogoUrl(data.imageUrl);
        }
      }
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setIsUploading(false);
      setCropOpen(false);
    }
  }

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="relative h-24 bg-gradient-to-r from-indigo-500 to-purple-600">
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
        )}
        {/* Cover edit button */}
        <div className="absolute top-2 right-2">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/80 hover:bg-white"
            onClick={() => {
              setCropType("cover");
              setInitialUrl(coverUrl || undefined);
              setCropOpen(true);
            }}
            disabled={isUploading}
          >
            {isUploading && cropType === "cover" ? "Uploading..." : "Edit Cover"}
          </Button>
        </div>
      </div>
      <div className="px-6 pb-6 relative">
        <div className="flex items-end -mt-10 mb-4">
          <div
            className="group h-20 w-20 rounded-xl bg-white border-2 border-white shadow-lg overflow-hidden relative cursor-pointer"
            onClick={() => {
              setCropType("profile");
              setInitialUrl(logoUrl || undefined);
              setCropOpen(true);
            }}
            role="button"
            aria-label="Edit profile photo"
            title="Edit profile photo"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Profile logo" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl font-semibold">
                {getInitials(name)}
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/30 text-white">
              <div className="flex items-center gap-1 text-xs font-medium">
                <Camera className="h-3.5 w-3.5" />
                Edit
              </div>
            </div>
            {/* Logo edit button (kept for explicit action) */}
            <div className="absolute -bottom-2 right-0 translate-y-1/2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setCropType("profile");
                  setInitialUrl(logoUrl || undefined);
                  setCropOpen(true);
                }}
                disabled={isUploading}
              >
                {isUploading && cropType === "profile" ? "Uploading..." : "Edit Logo"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{name}</h2>
        </div>

        <div className="flex gap-2">
          {institute?.subscriptionId && (
            <Link
              href={
                slug
                  ? `/recommendation-collections/${slug}`
                  : "/recommendation-collections"
              }
            >
              <Button
                variant="outline"
                className="flex-1 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 h-9 text-xs font-medium"
              >
                Public View
              </Button>
            </Link>
          )}
          <Link href="/institute/courses">
            <Button className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 h-9 text-xs font-medium">
              <Plus className="h-3 w-3 mr-1" /> Create
            </Button>
          </Link>
        </div>

        {/* Cropper Dialog */}
        <ImageCropperDialog
          key={cropType}
          open={cropOpen}
          onOpenChange={setCropOpen}
          type={cropType}
          targetWidth={cropType === "cover" ? 1600 : 512}
          targetHeight={cropType === "cover" ? 400 : 512}
          initialImageUrl={initialUrl}
          onCropped={handleCropped}
        />
      </div>
    </Card>
  );
}
