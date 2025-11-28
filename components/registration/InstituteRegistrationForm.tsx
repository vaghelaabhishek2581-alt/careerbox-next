"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Mail, Phone, MapPin, Globe, FileText, CheckCircle, Calendar, Search, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getStateNames, getCityNames } from "@/lib/utils/indian-locations";

const INSTITUTE_TYPES = [
  "University",
  "College",
  "School",
  "Training Institute",
  "Vocational Institute",
  "Research Institute",
  "Online Academy",
  "Coaching Center"
];

const INSTITUTE_CATEGORIES = [
  "Engineering & Technology",
  "Medical & Health Sciences",
  "Business & Management",
  "Arts & Humanities",
  "Science & Mathematics",
  "Law & Legal Studies",
  "Education & Teaching",
  "Agriculture & Life Sciences",
  "Architecture & Design",
  "Computer Science & IT",
  "Other"
];

// Get current year for validation
const currentYear = new Date().getFullYear();

export default function InstituteRegistrationForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [institutes, setInstitutes] = useState<Array<{
    _id: string;
    name: string;
    type?: string;
    website?: string;
    establishedYear?: number;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    contact?: {
      phone?: string[];
      email?: string;
    };
  }>>([]);
  const [loadingInstitutes, setLoadingInstitutes] = useState(false);

  // State and city data
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const loadingCitiesRef = useRef(false);

  const [formData, setFormData] = useState({
    // Institute Information
    organizationName: "",
    instituteId: "", // Will store the selected institute ID
    instituteType: "",
    instituteCategory: "",
    establishmentYear: "",
    contactName: "",
    contactPhone: "",

    // Address (India only)
    address: "",
    city: "",
    state: "",
    zipCode: "",

    // Additional Information
    description: "",
    website: "",

    // Agreements
    agreeTerms: false,
    subscribeNewsletter: false,
    contactViaEmail: false,
    contactViaPhone: false
  });
  
  // State for handling 'Other' institute name input
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherInstituteName, setOtherInstituteName] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load institutes on component mount
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        setLoadingInstitutes(true);
        const response = await fetch('/api/admin-institutes');
        if (response.ok) {
          const data = await response.json();
          setInstitutes(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching institutes:', error);
      } finally {
        setLoadingInstitutes(false);
      }
    };

    fetchInstitutes();
  }, []);

  // Handle institute selection
  const [selectedInstituteId, setSelectedInstituteId] = useState<string>('none');
  
  const handleInstituteSelect = (value: string) => {
    setSelectedInstituteId(value);
    
    if (value === 'none') {
      // Reset form when 'Select an institute' is chosen
      setFormData(prev => ({
        ...prev,
        organizationName: '',
        instituteId: '',
        instituteType: '',
        website: '',
        establishmentYear: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        contactPhone: ''
      }));
      setShowOtherInput(false);
    } else if (value === 'other') {
      // For 'Other' option, show input field
      setFormData(prev => ({
        ...prev,
        organizationName: otherInstituteName || '',
        instituteId: 'other',
        // Clear other fields
        instituteType: '',
        website: '',
        establishmentYear: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        contactPhone: ''
      }));
      setShowOtherInput(true);
    } else {
      // For regular institute selection
      const selectedInstitute = institutes.find(inst => inst._id === value);
      if (selectedInstitute) {
        setFormData(prev => ({
          ...prev,
          organizationName: selectedInstitute.name || '',
          instituteId: selectedInstitute._id || '',
          instituteType: selectedInstitute.type || '',
          website: selectedInstitute.website || '',
          establishmentYear: selectedInstitute.establishedYear?.toString() || '',
          address: selectedInstitute.location?.address || '',
          city: selectedInstitute.location?.city || '',
          state: selectedInstitute.location?.state || '',
          zipCode: selectedInstitute.location?.pincode || '',
          contactPhone: selectedInstitute.contact?.phone?.[0] || '',
        }));
        setShowOtherInput(false);
      }
    }
  };

  // Load states on component mount
  useEffect(() => {
    if (loadingStates || states.length > 0) return; // Prevent duplicate calls
    
    setLoadingStates(true);
    
    getStateNames()
      .then((stateNames) => {
        console.log('States loaded from CSV:', stateNames.length);
        setStates(stateNames);
        setLoadingStates(false);
      })
      .catch((error) => {
        console.error('Error loading states:', error);
        setStates([]);
        setLoadingStates(false);
      });
  }, [loadingStates, states.length]);

  // Load cities when state changes (optimized)
  useEffect(() => {
    if (!formData.state) {
      setCities([]);
      return;
    }

    if (loadingCitiesRef.current) return; // Prevent duplicate calls
    
    loadingCitiesRef.current = true;
    setLoadingCities(true);
    console.log('Loading cities for state:', formData.state);
    
    getCityNames(formData.state)
      .then((cityNames) => {
        console.log('Cities loaded from CSV:', cityNames.length);
        
        if (cityNames && cityNames.length > 0) {
          setCities(cityNames);
        } else {
          setCities(["Other"]);
        }
      })
      .catch((error) => {
        console.error('Error loading cities:', error);
        setCities(["Other"]);
      })
      .finally(() => {
        setLoadingCities(false);
        loadingCitiesRef.current = false;
      });
  }, [formData.state]);

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear city when state changes
      if (field === 'state' && value !== prev.state) {
        newData.city = "";
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Institute Information validation
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Institute name is required";
    }
    if (!formData.instituteType) {
      newErrors.instituteType = "Institute type is required";
    }
    if (!formData.instituteCategory) {
      newErrors.instituteCategory = "Institute category is required";
    }
    if (!formData.website) {
      newErrors.website = "Website is required";
    }
    if (!formData.establishmentYear) {
      newErrors.establishmentYear = "Establishment year is required";
    } else {
      const year = parseInt(formData.establishmentYear);
      if (isNaN(year) || year < 1800 || year > currentYear) {
        newErrors.establishmentYear = `Year must be between 1800 and ${currentYear}`;
      }
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact name is required";
    }
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = "Contact phone is required";
    } else if (!/^[\+]?[\d\s\-\(\)]{10,15}$/.test(formData.contactPhone.trim())) {
      newErrors.contactPhone = "Please enter a valid phone number";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.state) {
      newErrors.state = "State is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!/^\d{6}$/.test(formData.zipCode.trim())) {
      newErrors.zipCode = "Please enter a valid 6-digit PIN code";
    }

    // Website validation (optional but if provided should be valid)
    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
    }

    // Terms validation
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If 'Other' is selected, ensure a name is provided
    if (selectedInstituteId === 'other' && !otherInstituteName.trim()) {
      setErrors(prev => ({ ...prev, organizationName: 'Please enter institute name' }));
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission
      const submissionData = {
        ...formData,
        // Use the entered name if 'Other' is selected
        organizationName: selectedInstituteId === 'other' ? otherInstituteName : formData.organizationName,
        // Only include instituteId if an actual institute is selected (not 'Other' or 'none')
        instituteId: selectedInstituteId !== 'other' && selectedInstituteId !== 'none' ? selectedInstituteId : undefined,
        country: "India", // Hardcoded to India
        establishmentYear: parseInt(formData.establishmentYear)
      };

      const response = await fetch('/api/registration/institute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        router.push('/registration/success?type=institute');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="w-full max-w-7xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Institute Registration</CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              Join CareerBox and connect with thousands of students
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 lg:px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN */}
                <div className="space-y-6">
                  {/* Institute Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Institute Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="instituteSelect">Institute/College/University Name *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between h-12 text-left font-normal",
                              !selectedInstituteId && "text-muted-foreground",
                              errors.organizationName && "border-red-500"
                            )}
                          >
                            {selectedInstituteId === 'other' 
                              ? 'Other (Not Listed)'
                              : selectedInstituteId && selectedInstituteId !== 'none'
                                ? institutes.find((institute) => institute._id === selectedInstituteId)?.name
                                : 'Select an institute'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <div className="flex items-center border-b px-3">
                              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                              <CommandInput 
                                placeholder="Search institutes..." 
                                className="h-11 border-0 focus:ring-0"
                              />
                            </div>
                            <CommandEmpty>No institute found.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                              <CommandItem 
                                value="none"
                                onSelect={() => handleInstituteSelect('none')}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedInstituteId === 'none' ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                -- Select an institute --
                              </CommandItem>
                              {institutes.map((institute) => (
                                <CommandItem
                                  key={institute._id}
                                  value={institute.name}
                                  onSelect={() => handleInstituteSelect(institute._id)}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedInstituteId === institute._id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {institute.name} {institute.location?.city ? `(${institute.location.city})` : ''}
                                </CommandItem>
                              ))}
                              <CommandItem 
                                value="other"
                                onSelect={() => handleInstituteSelect('other')}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedInstituteId === 'other' ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                Other (Not Listed)
                              </CommandItem>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {/* Input field for 'Other' institute name */}
                      {selectedInstituteId === 'other' && (
                        <div className="mt-4">
                          <Label htmlFor="otherInstituteName">Enter Institute Name *</Label>
                          <Input
                            id="otherInstituteName"
                            type="text"
                            placeholder="Enter institute name"
                            value={otherInstituteName}
                            onChange={(e) => {
                              const value = e.target.value;
                              setOtherInstituteName(value);
                              setFormData(prev => ({
                                ...prev,
                                organizationName: value
                              }));
                              // Clear error when user starts typing
                              if (errors.organizationName) {
                                setErrors(prev => ({
                                  ...prev,
                                  organizationName: ''
                                }));
                              }
                            }}
                            className={errors.organizationName ? "border-red-500 mt-2" : "mt-2"}
                          />
                        </div>
                      )}
                      {errors.organizationName && (
                        <p className="text-sm text-red-500 mt-1">{errors.organizationName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="instituteType" className="text-sm font-medium text-gray-700">
                          Institute Type *
                        </Label>
                        <Select value={formData.instituteType} onValueChange={(value) => handleInputChange('instituteType', value)}>
                          <SelectTrigger className={cn("mt-2 h-12", errors.instituteType && 'border-red-500')}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {INSTITUTE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.instituteType && (
                          <p className="text-sm text-red-600 mt-1">{errors.instituteType}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="instituteCategory" className="text-sm font-medium text-gray-700">
                          Category *
                        </Label>
                        <Select value={formData.instituteCategory} onValueChange={(value) => handleInputChange('instituteCategory', value)}>
                          <SelectTrigger className={cn("mt-2 h-12", errors.instituteCategory && 'border-red-500')}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {INSTITUTE_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.instituteCategory && (
                          <p className="text-sm text-red-600 mt-1">{errors.instituteCategory}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="establishmentYear" className="text-sm font-medium text-gray-700">
                        Establishment Year *
                      </Label>
                      <div className="relative mt-2">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="establishmentYear"
                          type="number"
                          placeholder="e.g. 1995"
                          value={formData.establishmentYear}
                          onChange={(e) => handleInputChange('establishmentYear', e.target.value)}
                          className={cn("pl-10 h-12", errors.establishmentYear && 'border-red-500')}
                          min="1800"
                          max={currentYear}
                        />
                      </div>
                      {errors.establishmentYear && (
                        <p className="text-sm text-red-600 mt-1">{errors.establishmentYear}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
                          Contact Person Name *
                        </Label>
                        <Input
                          id="contactName"
                          placeholder="Enter contact person name"
                          value={formData.contactName}
                          onChange={(e) => handleInputChange('contactName', e.target.value)}
                          className={cn("mt-2 h-12", errors.contactName && 'border-red-500')}
                        />
                        {errors.contactName && (
                          <p className="text-sm text-red-600 mt-1">{errors.contactName}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="contactPhone" className="text-sm font-medium text-gray-700">
                          Contact Phone Number *
                        </Label>
                        <div className="relative mt-2">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="contactPhone"
                            placeholder="+91 9876543210"
                            value={formData.contactPhone}
                            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                            className={cn("pl-10 h-12", errors.contactPhone && 'border-red-500')}
                          />
                        </div>
                        {errors.contactPhone && (
                          <p className="text-sm text-red-600 mt-1">{errors.contactPhone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
                    </div>


                    <div>
                      <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                        Website*
                      </Label>
                      <div className="relative mt-2">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://www.yourinstitute.com"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className={cn("pl-10 h-12", errors.website && 'border-red-500')}
                        />
                      </div>
                      {errors.website && (
                        <p className="text-sm text-red-600 mt-1">{errors.website}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                  {/* Address Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Address Details</h3>
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                        Complete Address *
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your institute's complete address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={cn("mt-2 min-h-[100px]", errors.address && 'border-red-500')}
                        rows={3}
                      />
                      {errors.address && (
                        <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                          State *
                        </Label>
                        <Select 
                          value={formData.state} 
                          onValueChange={(value) => handleInputChange('state', value)}
                          disabled={loadingStates}
                        >
                          <SelectTrigger className={cn("mt-2 h-12", errors.state && 'border-red-500')}>
                            <SelectValue placeholder={loadingStates ? "Loading states..." : "Select state"} />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.state && (
                          <p className="text-sm text-red-600 mt-1">{errors.state}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                          City *
                        </Label>
                        <Select
                          value={formData.city}
                          onValueChange={(value) => handleInputChange('city', value)}
                          disabled={!formData.state || loadingCities}
                        >
                          <SelectTrigger className={cn("mt-2 h-12", errors.city && 'border-red-500')}>
                            <SelectValue placeholder={
                              loadingCities ? "Loading cities..." : 
                              formData.state ? "Select city" : 
                              "Select state first"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.length > 0 ? (
                              cities.map((city, index) => (
                                <SelectItem key={`${city}-${index}`} value={city}>{city}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="other">Other</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {errors.city && (
                          <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                        PIN Code *
                      </Label>
                      <Input
                        id="zipCode"
                        placeholder="e.g. 400001"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className={cn("mt-2 h-12", errors.zipCode && 'border-red-500')}
                        maxLength={6}
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
                      )}
                    </div>
                  </div>

                  {/* Preferences and Terms Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Preferences & Terms</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="contactViaEmail"
                          checked={formData.contactViaEmail}
                          onCheckedChange={(checked) => handleInputChange('contactViaEmail', checked as boolean)}
                        />
                        <Label htmlFor="contactViaEmail" className="text-sm text-gray-700">
                          Contact me via email for updates
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="contactViaPhone"
                          checked={formData.contactViaPhone}
                          onCheckedChange={(checked) => handleInputChange('contactViaPhone', checked as boolean)}
                        />
                        <Label htmlFor="contactViaPhone" className="text-sm text-gray-700">
                          Contact me via phone for support
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="subscribeNewsletter"
                          checked={formData.subscribeNewsletter}
                          onCheckedChange={(checked) => handleInputChange('subscribeNewsletter', checked as boolean)}
                        />
                        <Label htmlFor="subscribeNewsletter" className="text-sm text-gray-700">
                          Subscribe to CareerBox newsletter for industry insights
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Checkbox
                          id="agreeTerms"
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
                          className={errors.agreeTerms ? 'border-red-500' : ''}
                        />
                        <div className="flex-1">
                          <Label htmlFor="agreeTerms" className="text-sm text-gray-700 font-medium">
                            I agree to the Terms and Conditions *
                          </Label>
                          <p className="text-xs text-gray-600 mt-1">
                            By checking this box, you agree to our terms of service and privacy policy.
                          </p>
                          {errors.agreeTerms && (
                            <p className="text-sm text-red-600 mt-1">{errors.agreeTerms}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button - Full Width */}
              <div className="col-span-1 lg:col-span-2 pt-6">
                {errors.submit && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Registering Institute...
                    </>
                  ) : (
                    <>
                      <Building2 className="h-5 w-5 mr-2" />
                      Register Institute
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

