"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Mail, Phone, MapPin, Globe, FileText, CheckCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const BUSINESS_CATEGORIES = [
  "Technology & Software",
  "Healthcare & Medical",
  "Finance & Banking",
  "Education & Learning",
  "Manufacturing & Industrial",
  "Retail & E-commerce",
  "Consulting & Professional Services",
  "Marketing & Advertising",
  "Real Estate & Construction",
  "Transportation & Logistics",
  "Food & Beverage",
  "Entertainment & Media",
  "Non-Profit & NGO",
  "Government & Public Sector",
  "Other"
];

const ORGANIZATION_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees"
];

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "UAE",
  "Other"
];

const STATES_INDIA = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh"
];

export default function BusinessRegistrationForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Basic Information
    organizationName: "",
    email: "",
    businessCategory: "",
    organizationSize: "",
    contactName: "",
    contactPhone: "",
    website: "",

    // Address
    address: "",
    city: "",
    state: "",
    country: "India",
    zipCode: "",

    // Business Details
    description: "",
    linkedinUrl: "",
    twitterUrl: "",

    // Logo and Cover
    businessLogo: null as File | null,
    coverImage: null as File | null,

    // Agreements
    agreeTerms: false,
    subscribeNewsletter: false,
    contactViaEmail: false,
    contactViaPhone: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState({ logo: false, cover: false });

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = (files: FileList | null, type: 'logo' | 'cover') => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [type]: "Please upload only JPG, PNG, or GIF files" }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [type]: "File size must be less than 5MB" }));
      return;
    }

    handleInputChange(type === 'logo' ? 'businessLogo' : 'coverImage', file);
  };

  const handleDrag = (e: React.DragEvent, type: 'logo' | 'cover') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'logo' | 'cover') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files, type);
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.organizationName) newErrors.organizationName = "Business name is required";
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.businessCategory) newErrors.businessCategory = "Business category is required";
      if (!formData.organizationSize) newErrors.organizationSize = "Organization size is required";
      if (!formData.contactName) newErrors.contactName = "Contact name is required";
      if (!formData.contactPhone) newErrors.contactPhone = "Contact phone is required";
    }

    if (stepNumber === 2) {
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.country) newErrors.country = "Country is required";
      if (!formData.zipCode) newErrors.zipCode = "ZIP code is required";
      if (!formData.description) newErrors.description = "Business description is required";
    }

    if (stepNumber === 3) {
      if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.organizationName) newErrors.organizationName = "Business name is required";
    if (!formData.businessCategory) newErrors.businessCategory = "Business category is required";
    if (!formData.organizationSize) newErrors.organizationSize = "Organization size is required";
    if (!formData.contactName) newErrors.contactName = "Contact name is required";
    if (!formData.contactPhone) newErrors.contactPhone = "Contact phone is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to terms and conditions";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/registration/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/registration/success?type=business');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
          <Building className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
        <p className="text-gray-600">Tell us about your business</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Name of your Business / Institution / Profession *</Label>
          <Input
            id="organizationName"
            placeholder="Enter business name"
            value={formData.organizationName}
            onChange={(e) => handleInputChange('organizationName', e.target.value)}
            className={errors.organizationName ? 'border-red-500' : ''}
          />
          {errors.organizationName && <p className="text-sm text-red-600">{errors.organizationName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessCategory">Category of Business / Institute / Profession *</Label>
            <Select value={formData.businessCategory} onValueChange={(value) => handleInputChange('businessCategory', value)}>
              <SelectTrigger className={errors.businessCategory ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.businessCategory && <p className="text-sm text-red-600">{errors.businessCategory}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationSize">Select Organization Size *</Label>
            <Select value={formData.organizationSize} onValueChange={(value) => handleInputChange('organizationSize', value)}>
              <SelectTrigger className={errors.organizationSize ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {ORGANIZATION_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.organizationSize && <p className="text-sm text-red-600">{errors.organizationSize}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input
              id="contactName"
              placeholder="Enter contact person name"
              value={formData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              className={errors.contactName ? 'border-red-500' : ''}
            />
            {errors.contactName && <p className="text-sm text-red-600">{errors.contactName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone *</Label>
            <Input
              id="contactPhone"
              placeholder="Enter phone number"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              className={errors.contactPhone ? 'border-red-500' : ''}
            />
            {errors.contactPhone && <p className="text-sm text-red-600">{errors.contactPhone}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://www.yourbusiness.com"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
          <MapPin className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Address & Details</h2>
        <p className="text-gray-600">Provide your business location and additional information</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Business Address *</Label>
          <Textarea
            id="address"
            placeholder="Enter complete business address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={errors.address ? 'border-red-500' : ''}
            rows={3}
          />
          {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
              <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
              <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {(formData.country === 'India' ? STATES_INDIA : ['Other']).map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="Enter city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={errors.city ? 'border-red-500' : ''}
            />
            {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code *</Label>
            <Input
              id="zipCode"
              placeholder="Enter ZIP code"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className={errors.zipCode ? 'border-red-500' : ''}
            />
            {errors.zipCode && <p className="text-sm text-red-600">{errors.zipCode}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">About Business *</Label>
          <Textarea
            id="description"
            placeholder="Brief description about your business"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={errors.description ? 'border-red-500' : ''}
            rows={4}
          />
          {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          <p className="text-xs text-gray-500">{formData.description.length}/500</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/company/yourcompany"
              value={formData.linkedinUrl}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterUrl">Twitter URL</Label>
            <Input
              id="twitterUrl"
              type="url"
              placeholder="https://twitter.com/yourcompany"
              value={formData.twitterUrl}
              onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
          <Upload className="h-6 w-6 text-orange-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Branding & Final Steps</h2>
        <p className="text-gray-600">Upload your logo and complete registration</p>
      </div>

      <div className="space-y-6">
        {/* Business Logo Upload */}
        <div className="space-y-2">
          <Label>Business Logo</Label>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              dragActive.logo
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400'
            )}
            onDragEnter={(e) => handleDrag(e, 'logo')}
            onDragLeave={(e) => handleDrag(e, 'logo')}
            onDragOver={(e) => handleDrag(e, 'logo')}
            onDrop={(e) => handleDrop(e, 'logo')}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              {formData.businessLogo ? formData.businessLogo.name : "Drop your logo here, or click to select"}
            </p>
            <p className="text-xs text-gray-500 mb-2">PNG, JPG, GIF up to 5MB</p>
            <input
              type="file"
              id="logo-upload"
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
              onChange={(e) => handleFileUpload(e.target.files, 'logo')}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              Choose File
            </Button>
          </div>
          {errors.logo && <p className="text-sm text-red-600">{errors.logo}</p>}
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <Label>Cover Image</Label>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              dragActive.cover
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400'
            )}
            onDragEnter={(e) => handleDrag(e, 'cover')}
            onDragLeave={(e) => handleDrag(e, 'cover')}
            onDragOver={(e) => handleDrag(e, 'cover')}
            onDrop={(e) => handleDrop(e, 'cover')}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              {formData.coverImage ? formData.coverImage.name : "Drop your cover image here, or click to select"}
            </p>
            <p className="text-xs text-gray-500 mb-2">PNG, JPG, GIF up to 5MB</p>
            <input
              type="file"
              id="cover-upload"
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
              onChange={(e) => handleFileUpload(e.target.files, 'cover')}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('cover-upload')?.click()}
            >
              Choose File
            </Button>
          </div>
          {errors.cover && <p className="text-sm text-red-600">{errors.cover}</p>}
        </div>

        {/* Agreements */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="contactViaEmail"
              checked={formData.contactViaEmail}
              onCheckedChange={(checked) => handleInputChange('contactViaEmail', checked as boolean)}
            />
            <Label htmlFor="contactViaEmail">Contact me via email</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="contactViaPhone"
              checked={formData.contactViaPhone}
              onCheckedChange={(checked) => handleInputChange('contactViaPhone', checked as boolean)}
            />
            <Label htmlFor="contactViaPhone">Contact me via phone</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="subscribeNewsletter"
              checked={formData.subscribeNewsletter}
              onCheckedChange={(checked) => handleInputChange('subscribeNewsletter', checked as boolean)}
            />
            <Label htmlFor="subscribeNewsletter">Subscribe to Newsletter</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="agreeTerms"
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
              className={errors.agreeTerms ? 'border-red-500' : ''}
            />
            <Label htmlFor="agreeTerms">I accept the terms and conditions</Label>
          </div>
          {errors.agreeTerms && <p className="text-sm text-red-600">{errors.agreeTerms}</p>}

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - LinkedIn Style */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-purple-800 relative">
        <div className="flex flex-col justify-center px-12 text-white">
          <Building className="h-16 w-16 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Join CareerBox</h1>
          <p className="text-xl text-purple-100 mb-8">Connect with talent and grow your business</p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5" />
              <span>Find qualified candidates</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5" />
              <span>Post job opportunities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Compact Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border border-gray-200">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="organizationName" className="text-sm font-medium">Business Name *</Label>
                  <Input
                    id="organizationName"
                    placeholder="Enter business name"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Category *</Label>
                    <Select value={formData.businessCategory} onValueChange={(value) => handleInputChange('businessCategory', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUSINESS_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Size *</Label>
                    <Select value={formData.organizationSize} onValueChange={(value) => handleInputChange('organizationSize', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORGANIZATION_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Contact Name *</Label>
                    <Input
                      placeholder="Contact person"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone *</Label>
                    <Input
                      placeholder="Phone number"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Address *</Label>
                  <Input
                    placeholder="Complete address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-sm font-medium">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.country === 'India' ? STATES_INDIA : ['Other']).map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">City *</Label>
                    <Input
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
                  />
                  <Label htmlFor="agreeTerms" className="text-sm">I agree to terms and conditions</Label>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
                  {loading ? "Registering..." : "Register Business"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
