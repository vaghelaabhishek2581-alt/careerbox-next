"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import {
  fetchUserInstitutes,
  uploadInstituteImage,
} from "@/lib/redux/slices/instituteSlice";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  BookOpen,
  Award,
  Camera,
  Save,
  Edit,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function InstituteProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { selectedInstitute, isUploadingImage, loading, error } = useSelector(
    (state: RootState) => state.institute
  );

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Image upload refs and state
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);

  // Form data state
  const [instituteData, setInstituteData] = useState<any>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    establishmentYear: "",
    accreditation: [] as any[],
    specializations: [] as string[],
    facilities: [] as string[],
  });

  // Load institute data when selectedInstitute changes
  useEffect(() => {
    if (selectedInstitute) {
      setInstituteData({
        name: selectedInstitute.name || "",
        description: selectedInstitute.description || "",
        address: `${selectedInstitute.address?.street || ""}, ${
          selectedInstitute.address?.city || ""
        }, ${selectedInstitute.address?.state || ""}, ${
          selectedInstitute.address?.country || ""
        } ${selectedInstitute.address?.zipCode || ""}`.trim(),
        phone: selectedInstitute.phone || "",
        email: selectedInstitute.email || "",
        website: selectedInstitute.website || "",
        establishmentYear:
          selectedInstitute.establishmentYear?.toString() || "",
        accreditation: selectedInstitute.accreditation || [],
        specializations: [], // Will be populated from API
        facilities: [], // Will be populated from API
      });
    }
  }, [selectedInstitute]);

  // Fetch institutes on mount
  useEffect(() => {
    if (session?.user?.id) {
      dispatch(fetchUserInstitutes());
    }
  }, [session?.user?.id, dispatch]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (!session.user?.roles?.includes("institute")) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Handle logo image selection
  const handleLogoImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setSelectedLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cover image selection
  const handleCoverImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setSelectedCoverFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload logo image
  const handleUploadLogoImage = async () => {
    if (selectedLogoFile && selectedInstitute) {
      try {
        await dispatch(
          uploadInstituteImage({
            instituteId: selectedInstitute._id,
            type: "logo",
            file: selectedLogoFile,
          })
        ).unwrap();
        // Clear preview after successful upload
        setLogoPreview(null);
        setSelectedLogoFile(null);
        if (logoInputRef.current) {
          logoInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Logo upload failed:", error);
        alert("Failed to upload logo. Please try again.");
      }
    }
  };

  // Upload cover image
  const handleUploadCoverImage = async () => {
    if (selectedCoverFile && selectedInstitute) {
      try {
        await dispatch(
          uploadInstituteImage({
            instituteId: selectedInstitute._id,
            type: "cover",
            file: selectedCoverFile,
          })
        ).unwrap();
        // Clear preview after successful upload
        setCoverPreview(null);
        setSelectedCoverFile(null);
        if (coverInputRef.current) {
          coverInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Cover upload failed:", error);
        alert("Failed to upload cover image. Please try again.");
      }
    }
  };

  // Cancel logo preview
  const cancelLogoPreview = () => {
    setLogoPreview(null);
    setSelectedLogoFile(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  // Cancel cover preview
  const cancelCoverPreview = () => {
    setCoverPreview(null);
    setSelectedCoverFile(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save institute data
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save institute data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setInstituteData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!session?.user?.roles?.includes("institute")) {
    return null;
  }

  if (!selectedInstitute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No institute selected
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select an institute from the dashboard to manage its profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={logoInputRef}
        onChange={handleLogoImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={coverInputRef}
        onChange={handleCoverImageUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Institute Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your institute information and settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Cover Image and Logo */}
        <Card>
          <CardContent className="p-0">
            <div
              className="relative h-48 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-lg bg-cover bg-center"
              style={{
                backgroundImage: selectedInstitute?.coverImage
                  ? `url(${selectedInstitute.coverImage})`
                  : undefined,
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg"></div>
              <Button
                size="sm"
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700"
                onClick={() => coverInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                Change Cover
              </Button>
            </div>
            <div className="relative px-6 pb-6">
              <div className="flex items-end gap-6 -mt-16">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={selectedInstitute?.logo} />
                    <AvatarFallback className="bg-orange-600 text-white text-2xl font-bold">
                      {selectedInstitute?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-white shadow-md"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 mt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedInstitute?.name}
                    </h2>
                    <Badge className="bg-orange-100 text-orange-700">
                      <Building2 className="w-3 h-3 mr-1" />
                      Institute
                    </Badge>
                    {selectedInstitute?.isVerified && (
                      <Badge className="bg-green-100 text-green-700">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">
                    {selectedInstitute?.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedInstitute?.address?.city},{" "}
                      {selectedInstitute?.address?.state}
                    </span>
                    {selectedInstitute?.establishmentYear && (
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        Est. {selectedInstitute.establishmentYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your institute's basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Institute Name</Label>
                <Input
                  id="name"
                  value={instituteData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={instituteData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="establishmentYear">Established Year</Label>
                <Input
                  id="establishmentYear"
                  value={instituteData.establishmentYear}
                  onChange={(e) =>
                    handleInputChange("establishmentYear", e.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Manage contact details and location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={instituteData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={instituteData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={instituteData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={instituteData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {selectedInstitute?.studentCount || 0}
              </p>
              <p className="text-sm text-gray-600">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {selectedInstitute?.courseCount || 0}
              </p>
              <p className="text-sm text-gray-600">Active Courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {selectedInstitute?.facultyCount || 0}
              </p>
              <p className="text-sm text-gray-600">Faculty Members</p>
            </CardContent>
          </Card>
        </div>

        {/* Logo Image Preview Modal */}
        {logoPreview && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Preview Institute Logo
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelLogoPreview}
                  disabled={isUploadingImage}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Preview Image */}
              <div className="flex justify-center mb-4">
                <div
                  className="h-32 w-32 rounded-full bg-cover bg-center border-4 border-gray-200"
                  style={{ backgroundImage: `url(${logoPreview})` }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleUploadLogoImage}
                  disabled={isUploadingImage}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isUploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload
                </Button>
                <Button
                  variant="secondary"
                  onClick={cancelLogoPreview}
                  disabled={isUploadingImage}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cover Image Preview Modal */}
        {coverPreview && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Preview Cover Image
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelCoverPreview}
                  disabled={isUploadingImage}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Preview Image */}
              <div className="flex justify-center mb-4">
                <div
                  className="w-full h-48 bg-cover bg-center border-4 border-gray-200 rounded-lg"
                  style={{ backgroundImage: `url(${coverPreview})` }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleUploadCoverImage}
                  disabled={isUploadingImage}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isUploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload
                </Button>
                <Button
                  variant="secondary"
                  onClick={cancelCoverPreview}
                  disabled={isUploadingImage}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
