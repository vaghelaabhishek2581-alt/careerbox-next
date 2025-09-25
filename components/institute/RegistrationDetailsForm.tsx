"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { updateRegistrationDetails, RegistrationDetails } from "@/lib/redux/slices/instituteSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, FileText, Building2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function RegistrationDetailsForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { registrationDetails, loading } = useSelector((state: RootState) => state.institute);
  
  const [formData, setFormData] = useState<RegistrationDetails>({
    panNumber: registrationDetails?.panNumber || "",
    gstNumber: registrationDetails?.gstNumber || "",
    cinNumber: registrationDetails?.cinNumber || "",
    tanNumber: registrationDetails?.tanNumber || "",
    tradeLicenseNumber: registrationDetails?.tradeLicenseNumber || "",
    licenseExpiryDate: registrationDetails?.licenseExpiryDate || "",
    msmeRegistrationNumber: registrationDetails?.msmeRegistrationNumber || "",
    importExportCode: registrationDetails?.importExportCode || "",
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.licenseExpiryDate ? new Date(formData.licenseExpiryDate) : undefined
  );

  const handleInputChange = (field: keyof RegistrationDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        licenseExpiryDate: date.toISOString()
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateRegistrationDetails(formData)).unwrap();
      // Show success message
    } catch (error) {
      console.error("Failed to update registration details:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registration Details</h2>
          <p className="text-gray-600">Manage your institute's legal registration information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Registration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Registration
              </CardTitle>
              <CardDescription>
                Essential registration numbers and identifiers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number *</Label>
                <Input
                  id="panNumber"
                  placeholder="Enter PAN number"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value)}
                  className="uppercase"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500">10-character Permanent Account Number</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  placeholder="Enter GST number"
                  value={formData.gstNumber}
                  onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                  maxLength={15}
                />
                <p className="text-xs text-gray-500">15-digit GST identification number</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cinNumber">CIN / Organization Registration Number</Label>
                <Input
                  id="cinNumber"
                  placeholder="Enter CIN or registration number"
                  value={formData.cinNumber}
                  onChange={(e) => handleInputChange('cinNumber', e.target.value)}
                />
                <p className="text-xs text-gray-500">21-digit Corporate Identity Number</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanNumber">TAN Number</Label>
                <Input
                  id="tanNumber"
                  placeholder="Enter TAN number"
                  value={formData.tanNumber}
                  onChange={(e) => handleInputChange('tanNumber', e.target.value)}
                  className="uppercase"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500">Tax Deduction Account Number</p>
              </div>
            </CardContent>
          </Card>

          {/* License Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                License Information
              </CardTitle>
              <CardDescription>
                Trade licenses and regulatory approvals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tradeLicenseNumber">Trade License Number</Label>
                <Input
                  id="tradeLicenseNumber"
                  placeholder="Enter trade license number"
                  value={formData.tradeLicenseNumber}
                  onChange={(e) => handleInputChange('tradeLicenseNumber', e.target.value)}
                />
                <p className="text-xs text-gray-500">Valid trade license number</p>
              </div>

              <div className="space-y-2">
                <Label>License Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select expiry date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500">Date when current license expires</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="msmeRegistrationNumber">MSME Registration Number</Label>
                <Input
                  id="msmeRegistrationNumber"
                  placeholder="Enter MSME registration number"
                  value={formData.msmeRegistrationNumber}
                  onChange={(e) => handleInputChange('msmeRegistrationNumber', e.target.value)}
                />
                <p className="text-xs text-gray-500">MSME registration number</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="importExportCode">Import Export Code</Label>
                <Input
                  id="importExportCode"
                  placeholder="Enter import export code"
                  value={formData.importExportCode}
                  onChange={(e) => handleInputChange('importExportCode', e.target.value)}
                />
                <p className="text-xs text-gray-500">IEC for international trade</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Registration Details"}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            Reset Form
          </Button>
        </div>
      </form>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Important Notes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• PAN Number is mandatory for all educational institutions</li>
                <li>• GST registration is required if annual turnover exceeds ₹20 lakhs</li>
                <li>• Ensure all registration numbers are accurate and up-to-date</li>
                <li>• Keep digital copies of all registration certificates ready for upload</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
