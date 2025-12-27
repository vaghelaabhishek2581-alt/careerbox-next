"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Mail, Phone, MapPin, Globe, FileText, CheckCircle, Calendar, Search, Check, ChevronsUpDown, User, ArrowLeft } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  
  // State for duplicate registration alert
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicateAlertMessage, setDuplicateAlertMessage] = useState("");
  const [redirectTimer, setRedirectTimer] = useState(60);

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

  // Handle redirect timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showDuplicateAlert && redirectTimer > 0) {
      interval = setInterval(() => {
        setRedirectTimer((prev) => prev - 1);
      }, 1000);
    } else if (showDuplicateAlert && redirectTimer === 0) {
      router.push('/user/registration-status');
    }
    return () => clearInterval(interval);
  }, [showDuplicateAlert, redirectTimer, router]);

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
    if (formData.website && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/i.test(formData.website)) {
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
      // Normalize website URL - add https if missing
      let websiteUrl = formData.website;
      if (websiteUrl && !/^https?:\/\//i.test(websiteUrl)) {
        websiteUrl = `https://${websiteUrl}`;
      }

      // Prepare data for submission
      const submissionData = {
        ...formData,
        website: websiteUrl,
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
        
        // Handle duplicate application error (Check for both specific message and generic 'active' keyword)
        if (
          errorData.message === 'You already have an active institute registration application' ||
          (errorData.message && errorData.message.toLowerCase().includes('active') && errorData.message.toLowerCase().includes('registration'))
        ) {
          setDuplicateAlertMessage(errorData.message || 'You already have an active registration application.');
          setShowDuplicateAlert(true);
          return;
        }

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
    <div className="min-h-screen bg-white pb-20 px-4">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Duplicate Registration Alert Dialog */}
        <AlertDialog open={showDuplicateAlert} onOpenChange={setShowDuplicateAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                <CheckCircle className="h-5 w-5" />
                Active Registration Found
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p className="text-base text-gray-700 font-medium">
                  {duplicateAlertMessage}
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting you to the status page in <span className="font-bold text-blue-600">{redirectTimer}</span> seconds...
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction 
                onClick={() => router.push('/user/registration-status')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Status Page Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="bg-white">
          <div className="mb-4">
            <Link 
              href="/user/create-page" 
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Selection
            </Link>
          </div>
          <div className="text-center pb-6 border-b border-gray-100 mb-6">
            <div className="mx-auto w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <Building2 className="h-7 w-7 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Institute Registration</h1>
            <p className="text-base text-gray-500 mt-1">
              Join CareerBox and connect with thousands of students
            </p>
          </div>

          <div className="px-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* LEFT SIDE: Registration Form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Institute Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <div className="p-2.5 bg-blue-50 rounded-xl">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Institute Details</h3>
                        <p className="text-sm text-gray-500">Basic information about your organization</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* Institute Select */}
                      <div className="space-y-2">
                        <Label htmlFor="instituteSelect" className="text-slate-700 font-semibold ml-1">Institute Name *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between h-12 text-left font-normal bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl hover:bg-slate-100",
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
                                {/* <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" /> */}
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
                                
                                {/* Quick 'Other' Option at Top */}
                                <CommandItem 
                                  value="other"
                                  onSelect={() => handleInstituteSelect('other')}
                                  className="cursor-pointer font-medium text-blue-600 bg-blue-50/50 mb-1 border-b border-blue-100"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedInstituteId === 'other' ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  Other (Not Listed)
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
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        
                        {/* Input field for 'Other' institute name */}
                        {selectedInstituteId === 'other' && (
                          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <Label htmlFor="otherInstituteName" className="text-slate-700 font-medium ml-1">Enter Institute Name *</Label>
                            <Input
                              id="otherInstituteName"
                              type="text"
                              placeholder="Enter full institute name"
                              value={otherInstituteName}
                              onChange={(e) => {
                                const value = e.target.value;
                                setOtherInstituteName(value);
                                setFormData(prev => ({ ...prev, organizationName: value }));
                                if (errors.organizationName) setErrors(prev => ({ ...prev, organizationName: '' }));
                              }}
                              className={cn(
                                "mt-2 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl",
                                errors.organizationName ? "border-red-500" : ""
                              )}
                            />
                          </div>
                        )}
                        {errors.organizationName && (
                          <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><span className="inline-block h-1 w-1 bg-red-500 rounded-full"/>{errors.organizationName}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="instituteType" className="text-slate-700 font-semibold ml-1">Type *</Label>
                          <Select value={formData.instituteType} onValueChange={(value) => handleInputChange('instituteType', value)}>
                            <SelectTrigger className={cn("h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.instituteType && 'border-red-500')}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {INSTITUTE_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.instituteType && <p className="text-sm text-red-600 mt-1">{errors.instituteType}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="instituteCategory" className="text-slate-700 font-semibold ml-1">Category *</Label>
                          <Select value={formData.instituteCategory} onValueChange={(value) => handleInputChange('instituteCategory', value)}>
                            <SelectTrigger className={cn("h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.instituteCategory && 'border-red-500')}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {INSTITUTE_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.instituteCategory && <p className="text-sm text-red-600 mt-1">{errors.instituteCategory}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="establishmentYear" className="text-slate-700 font-semibold ml-1">Establishment Year *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            id="establishmentYear"
                            type="number"
                            placeholder="YYYY"
                            value={formData.establishmentYear}
                            onChange={(e) => handleInputChange('establishmentYear', e.target.value)}
                            className={cn("pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.establishmentYear && 'border-red-500')}
                            min="1800"
                            max={currentYear}
                          />
                        </div>
                        {errors.establishmentYear && <p className="text-sm text-red-600 mt-1">{errors.establishmentYear}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-6 pt-4 border-t border-dashed border-gray-200">
                    <div className="flex items-center gap-3 pb-2">
                      <div className="p-2.5 bg-indigo-50 rounded-xl">
                        <User className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Contact Person</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="contactName" className="text-slate-700 font-semibold ml-1">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            id="contactName"
                            placeholder="Authorised Person"
                            value={formData.contactName}
                            onChange={(e) => handleInputChange('contactName', e.target.value)}
                            className={cn("pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.contactName && 'border-red-500')}
                          />
                        </div>
                        {errors.contactName && <p className="text-sm text-red-600 mt-1">{errors.contactName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPhone" className="text-slate-700 font-semibold ml-1">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            id="contactPhone"
                            placeholder="+91 9876543210"
                            value={formData.contactPhone}
                            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                            className={cn("pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.contactPhone && 'border-red-500')}
                          />
                        </div>
                        {errors.contactPhone && <p className="text-sm text-red-600 mt-1">{errors.contactPhone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Web Presence */}
                  <div className="space-y-6 pt-4 border-t border-dashed border-gray-200">
                    <div className="flex items-center gap-3 pb-2">
                      <div className="p-2.5 bg-purple-50 rounded-xl">
                        <Globe className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Web Presence</h3>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-slate-700 font-semibold ml-1">Official Website *</Label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://www.example.com"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className={cn("pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.website && 'border-red-500')}
                        />
                      </div>
                      {errors.website && <p className="text-sm text-red-600 mt-1">{errors.website}</p>}
                    </div>
                  </div>

                  {/* Location Details */}
                  <div className="space-y-6 pt-4 border-t border-dashed border-gray-200">
                    <div className="flex items-center gap-3 pb-2">
                      <div className="p-2.5 bg-green-50 rounded-xl">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Location</h3>
                        <p className="text-sm text-gray-500">Where can students find you?</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-slate-700 font-semibold ml-1">Complete Address *</Label>
                        <Textarea
                          id="address"
                          placeholder="Street address, landmarks, etc."
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className={cn("min-h-[100px] bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.address && 'border-red-500')}
                          rows={3}
                        />
                        {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-slate-700 font-semibold ml-1">State *</Label>
                          <Select 
                            value={formData.state} 
                            onValueChange={(value) => handleInputChange('state', value)}
                            disabled={loadingStates}
                          >
                            <SelectTrigger className={cn("h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.state && 'border-red-500')}>
                              <SelectValue placeholder={loadingStates ? "Loading..." : "Select state"} />
                            </SelectTrigger>
                            <SelectContent>
                              {states.map((state) => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-slate-700 font-semibold ml-1">City *</Label>
                          <Select
                            value={formData.city}
                            onValueChange={(value) => handleInputChange('city', value)}
                            disabled={!formData.state || loadingCities}
                          >
                            <SelectTrigger className={cn("h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.city && 'border-red-500')}>
                              <SelectValue placeholder={
                                loadingCities ? "Loading..." : 
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
                          {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipCode" className="text-slate-700 font-semibold ml-1">PIN Code *</Label>
                        <Input
                          id="zipCode"
                          placeholder="e.g. 400001"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          className={cn("h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.zipCode && 'border-red-500')}
                          maxLength={6}
                        />
                        {errors.zipCode && <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Terms & Submit */}
                  <div className="space-y-6 pt-4 border-t border-dashed border-gray-200">
                     <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                        <div className="flex items-start space-x-3 mb-4">
                          <Checkbox
                            id="agreeTerms"
                            checked={formData.agreeTerms}
                            onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
                            className={cn("mt-1", errors.agreeTerms ? 'border-red-500' : '')}
                          />
                          <div className="flex-1">
                            <Label htmlFor="agreeTerms" className="text-sm text-gray-700 font-medium cursor-pointer">
                              I agree to the Terms of Service and Privacy Policy *
                            </Label>
                            {errors.agreeTerms && <p className="text-sm text-red-600 mt-1">{errors.agreeTerms}</p>}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-3 pl-7">
                           <div className="flex items-center space-x-3">
                            <Checkbox
                              id="contactViaEmail"
                              checked={formData.contactViaEmail}
                              onCheckedChange={(checked) => handleInputChange('contactViaEmail', checked as boolean)}
                            />
                            <Label htmlFor="contactViaEmail" className="text-sm text-gray-600 cursor-pointer">
                              Receive updates via email
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="contactViaPhone"
                              checked={formData.contactViaPhone}
                              onCheckedChange={(checked) => handleInputChange('contactViaPhone', checked as boolean)}
                            />
                            <Label htmlFor="contactViaPhone" className="text-sm text-gray-600 cursor-pointer">
                              Receive updates via phone
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="subscribeNewsletter"
                              checked={formData.subscribeNewsletter}
                              onCheckedChange={(checked) => handleInputChange('subscribeNewsletter', checked as boolean)}
                            />
                            <Label htmlFor="subscribeNewsletter" className="text-sm text-gray-600 cursor-pointer">
                              Subscribe to newsletter
                            </Label>
                          </div>
                        </div>
                     </div>

                    {errors.submit && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                         <div className="h-2 w-2 bg-red-500 rounded-full" />
                         <p className="text-sm font-medium">{errors.submit}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading || !formData.agreeTerms}
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Profile...
                        </>
                      ) : (
                        <>
                          Complete Registration <CheckCircle className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* RIGHT SIDE: Profile Preview */}
              <div className="hidden lg:block sticky top-24">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                   {/* Cover Image Area */}
                   <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                   </div>
                   
                   {/* Profile Content */}
                   <div className="px-6 pb-6 relative">
                      {/* Logo - Positioned to overlap cover and content */}
                      <div className="w-24 h-24 bg-white rounded-xl shadow-md border-4 border-white absolute -top-28 left-6 flex items-center justify-center overflow-hidden z-10">
                         {/* Placeholder for Logo */}
                         <Building2 className="h-10 w-10 text-gray-300" />
                      </div>
                      
                      {/* Institute Name & Details - Added padding-top to clear the logo */}
                      <div className="mt-10 mb-6">
                         <h2 className="text-2xl font-bold text-gray-900 break-words leading-tight min-h-[2rem]">
                            {formData.organizationName || "Institute Name"}
                         </h2>
                         <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-gray-600">
                            {formData.instituteType && (
                               <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium border border-blue-100 text-xs">
                                  {formData.instituteType}
                               </span>
                            )}
                            {formData.establishmentYear && (
                               <span className="text-gray-500 flex items-center gap-1 text-xs">
                                  • Est. {formData.establishmentYear}
                               </span>
                            )}
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-start gap-3 text-sm">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                            <span className="text-gray-600">
                               {formData.address || formData.city || formData.state ? (
                                  <>
                                     {formData.address && <span>{formData.address}, </span>}
                                     {formData.city && <span>{formData.city}, </span>}
                                     {formData.state && <span>{formData.state}</span>}
                                     {formData.zipCode && <span> - {formData.zipCode}</span>}
                                  </>
                               ) : (
                                  "Address will appear here..."
                               )}
                            </span>
                         </div>

                         <div className="flex items-center gap-3 text-sm">
                            <Globe className="h-5 w-5 text-gray-400 shrink-0" />
                            <span className="text-blue-600 truncate">
                               {formData.website || "www.website.com"}
                            </span>
                         </div>
                         
                         <div className="flex items-center gap-3 text-sm">
                            <User className="h-5 w-5 text-gray-400 shrink-0" />
                            <div className="flex flex-col">
                               <span className="text-gray-900 font-medium">{formData.contactName || "Contact Person"}</span>
                               <span className="text-gray-500 text-xs">{formData.contactPhone || "+91 XXXXX XXXXX"}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-gray-100">
                         <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                            <p className="text-xs text-gray-500 mb-2">Registration Status</p>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold">
                               <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                               Drafting
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
                
                <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100 flex gap-3">
                   <div className="p-2 bg-blue-100 rounded-lg h-fit">
                      <CheckCircle className="h-5 w-5 text-blue-700" />
                   </div>
                   <div>
                      <h4 className="font-semibold text-blue-900 text-sm">Why Register?</h4>
                      <ul className="mt-2 space-y-1 text-xs text-blue-800">
                         <li>• Verified badge on your profile</li>
                         <li>• Access to student lead database</li>
                         <li>• Post courses and events</li>
                         <li>• Analytics dashboard</li>
                      </ul>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

