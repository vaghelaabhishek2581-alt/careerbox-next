"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, MapPin, Phone, Mail, Globe, Users, BookOpen, Award, Camera, Save, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function InstituteProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [instituteData, setInstituteData] = useState({
    name: "CareerBox Institute of Technology",
    description: "Leading institute in technology education with over 20 years of experience in shaping future professionals.",
    address: "123 Education Street, Tech City, TC 12345",
    phone: "+1 (555) 123-4567",
    email: "info@careerboxtech.edu",
    website: "https://www.careerboxtech.edu",
    established: "2003",
    accreditation: "NAAC A+ Grade",
    logo: "",
    coverImage: "",
    specializations: ["Computer Science", "Engineering", "Business Administration", "Data Science"],
    facilities: ["Modern Labs", "Library", "Sports Complex", "Hostel", "Cafeteria", "Auditorium"]
  });

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

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save institute data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save institute data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setInstituteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!session?.user?.roles?.includes("institute")) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Institute Profile</h1>
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
          <div className="relative h-48 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-lg">
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg"></div>
            {isEditing && (
              <Button 
                size="sm" 
                className="absolute top-4 right-4 bg-white text-gray-900 hover:bg-gray-100"
              >
                <Camera className="w-4 h-4 mr-2" />
                Change Cover
              </Button>
            )}
          </div>
          <div className="relative px-6 pb-6">
            <div className="flex items-end gap-6 -mt-16">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={instituteData.logo} />
                  <AvatarFallback className="bg-orange-600 text-white text-2xl font-bold">
                    {instituteData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button 
                    size="sm" 
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex-1 mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{instituteData.name}</h2>
                  <Badge className="bg-orange-100 text-orange-700">
                    <Building2 className="w-3 h-3 mr-1" />
                    Institute
                  </Badge>
                </div>
                <p className="text-gray-600 mb-3">{instituteData.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {instituteData.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Est. {instituteData.established}
                  </span>
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
            <CardDescription>Update your institute's basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Institute Name</Label>
              <Input
                id="name"
                value={instituteData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={instituteData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!isEditing}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="established">Established Year</Label>
              <Input
                id="established"
                value={instituteData.established}
                onChange={(e) => handleInputChange('established', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="accreditation">Accreditation</Label>
              <Input
                id="accreditation"
                value={instituteData.accreditation}
                onChange={(e) => handleInputChange('accreditation', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Manage contact details and location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={instituteData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={instituteData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={instituteData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={instituteData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Specializations */}
        <Card>
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
            <CardDescription>Areas of expertise and programs offered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {instituteData.specializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {spec}
                </Badge>
              ))}
              {isEditing && (
                <Button variant="outline" size="sm" className="h-6">
                  + Add Specialization
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Facilities</CardTitle>
            <CardDescription>Available facilities and amenities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {instituteData.facilities.map((facility, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                  <Building2 className="w-3 h-3 mr-1" />
                  {facility}
                </Badge>
              ))}
              {isEditing && (
                <Button variant="outline" size="sm" className="h-6">
                  + Add Facility
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">1,234</p>
            <p className="text-sm text-gray-600">Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">45</p>
            <p className="text-sm text-gray-600">Active Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">89</p>
            <p className="text-sm text-gray-600">Faculty Members</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
