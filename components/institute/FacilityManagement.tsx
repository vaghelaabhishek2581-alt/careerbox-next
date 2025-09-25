"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { addFacility, removeFacility, updateFacility, Facility } from "@/lib/redux/slices/instituteSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Building2, 
  Edit, 
  Trash2, 
  Camera,
  Users,
  Wifi,
  Car,
  Coffee,
  BookOpen
} from "lucide-react";

const AMENITY_OPTIONS = [
  "Wi-Fi",
  "Air Conditioning", 
  "Projector",
  "Whiteboard",
  "Audio System",
  "Video Conferencing",
  "Parking",
  "Cafeteria",
  "Library Access",
  "Computer Lab",
  "Laboratory Equipment",
  "Sports Equipment",
  "Medical Facility",
  "Security System",
  "Elevator Access",
  "Wheelchair Accessible"
];

export default function FacilityManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { facilities, loading } = useSelector((state: RootState) => state.institute);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    amenities: [] as string[],
    status: "active" as "active" | "inactive",
  });
  const [newAmenity, setNewAmenity] = useState("");

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      capacity: "",
      amenities: [],
      status: "active",
    });
    setNewAmenity("");
    setEditingFacility(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const facilityData = {
        ...formData,
        images: [], // Will be handled separately
      };

      if (editingFacility) {
        await dispatch(updateFacility({
          ...editingFacility,
          ...facilityData
        })).unwrap();
      } else {
        await dispatch(addFacility(facilityData)).unwrap();
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save facility:", error);
    }
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      description: facility.description,
      capacity: facility.capacity,
      amenities: facility.amenities,
      status: facility.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (facilityId: string) => {
    if (confirm("Are you sure you want to delete this facility?")) {
      dispatch(removeFacility(facilityId));
    }
  };

  const addAmenity = (amenity: string) => {
    if (amenity && !formData.amenities.includes(amenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    }
    setNewAmenity("");
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const getFacilityIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('library') || lowerName.includes('book')) return BookOpen;
    if (lowerName.includes('parking') || lowerName.includes('car')) return Car;
    if (lowerName.includes('cafeteria') || lowerName.includes('food')) return Coffee;
    if (lowerName.includes('wifi') || lowerName.includes('internet')) return Wifi;
    if (lowerName.includes('auditorium') || lowerName.includes('hall')) return Users;
    return Building2;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Building2 className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Facility Infrastructure</h2>
            <p className="text-gray-600">Detail your facility and infrastructure here</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Facility
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFacility ? "Edit Facility" : "Add New Facility"}
              </DialogTitle>
              <DialogDescription>
                Add facility details including capacity and amenities
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Facility Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter facility name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter facility description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  required
                />
                <div className="text-xs text-gray-500">
                  {formData.description.length}/500
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  placeholder="e.g., 100 people, 50 seats"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload images or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  <Button type="button" variant="outline" className="mt-2">
                    <Camera className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="flex gap-2 mb-2">
                  <Select value={newAmenity} onValueChange={setNewAmenity}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select amenity" />
                    </SelectTrigger>
                    <SelectContent>
                      {AMENITY_OPTIONS.filter(amenity => !formData.amenities.includes(amenity)).map((amenity) => (
                        <SelectItem key={amenity} value={amenity}>
                          {amenity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    onClick={() => addAmenity(newAmenity)}
                    disabled={!newAmenity}
                  >
                    Add
                  </Button>
                </div>
                
                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity) => (
                      <Badge 
                        key={amenity} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeAmenity(amenity)}
                      >
                        {amenity} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: "active" | "inactive") => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingFacility ? "Update" : "Add"} Facility
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Facilities Grid */}
      {facilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => {
            const IconComponent = getFacilityIcon(facility.name);
            return (
              <Card key={facility.id} className="relative group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={facility.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {facility.status}
                      </Badge>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(facility)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(facility.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{facility.name}</CardTitle>
                  {facility.capacity && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {facility.capacity}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {facility.description}
                  </p>
                  
                  {facility.amenities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {facility.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {facility.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{facility.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities added yet</h3>
            <p className="text-gray-600 text-center mb-4 max-w-md">
              Add your institute's facilities and infrastructure to showcase your capabilities.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Facility
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Facilities Overview */}
      {facilities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900">Facilities Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-700">Total Facilities:</span>
                  <span className="font-semibold text-purple-900">{facilities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Active:</span>
                  <span className="font-semibold text-purple-900">
                    {facilities.filter(f => f.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Inactive:</span>
                  <span className="font-semibold text-purple-900">
                    {facilities.filter(f => f.status === 'inactive').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Popular Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {AMENITY_OPTIONS.slice(0, 6).map((amenity) => {
                  const count = facilities.reduce((acc, facility) => 
                    acc + (facility.amenities.includes(amenity) ? 1 : 0), 0
                  );
                  return (
                    <div key={amenity} className="flex justify-between">
                      <span className="text-blue-700">{amenity}:</span>
                      <span className="font-semibold text-blue-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
