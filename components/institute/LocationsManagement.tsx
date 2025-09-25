"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { addLocation, removeLocation, updateLocation, Location } from "@/lib/redux/slices/instituteSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  MapPin, 
  Edit, 
  Trash2, 
  Building2,
  Home,
  Factory
} from "lucide-react";

export default function LocationsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { locations, loading } = useSelector((state: RootState) => state.institute);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    isPrimary: false,
  });

  const resetForm = () => {
    setFormData({
      type: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
      isPrimary: false,
    });
    setEditingLocation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLocation) {
        await dispatch(updateLocation({
          ...editingLocation,
          ...formData
        })).unwrap();
      } else {
        await dispatch(addLocation(formData)).unwrap();
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save location:", error);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      type: location.type,
      address: location.address,
      city: location.city,
      state: location.state,
      country: location.country,
      zipCode: location.zipCode,
      isPrimary: location.isPrimary,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (locationId: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      dispatch(removeLocation(locationId));
    }
  };

  const getLocationIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('office') || lowerType.includes('head')) return Building2;
    if (lowerType.includes('warehouse') || lowerType.includes('factory')) return Factory;
    return Home;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <MapPin className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Locations</h2>
            <p className="text-gray-600">Manage your organization locations here</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Edit Address" : "Add New Address"}
              </DialogTitle>
              <DialogDescription>
                Click to add a new organization location
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Address Type</Label>
                <Input
                  id="type"
                  placeholder="e.g., Office, Warehouse, Branch"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City/Area</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country/Region</Label>
                  <Input
                    id="country"
                    placeholder="Enter country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="Enter ZIP code"
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isPrimary: checked as boolean }))
                  }
                />
                <Label htmlFor="isPrimary">Set as primary address</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingLocation ? "Update" : "Add"} Address
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Locations List */}
      {locations.length > 0 ? (
        <div className="space-y-4">
          {locations.map((location) => {
            const IconComponent = getLocationIcon(location.type);
            return (
              <Card key={location.id} className="relative group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {location.type}
                          </h3>
                          {location.isPrimary && (
                            <Badge className="bg-green-100 text-green-700">
                              Primary
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-gray-600">
                          <p>{location.address}</p>
                          <p>
                            {location.city}, {location.state} {location.zipCode}
                          </p>
                          <p>{location.country}</p>
                        </div>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(location)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(location.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations added yet</h3>
            <p className="text-gray-600 text-center mb-4 max-w-md">
              Add your organization locations to help students and partners find you easily.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Address
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Primary Location Display */}
      {locations.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Primary Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {locations.find(loc => loc.isPrimary) ? (
              <div className="text-blue-800">
                {(() => {
                  const primary = locations.find(loc => loc.isPrimary)!;
                  return (
                    <div>
                      <p className="font-medium">{primary.type}</p>
                      <p>{primary.address}</p>
                      <p>{primary.city}, {primary.state} {primary.zipCode}</p>
                      <p>{primary.country}</p>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-blue-700">No primary location set. Please mark one location as primary.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
