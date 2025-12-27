"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  CheckCircle, 
  ArrowLeft, 
  User, 
  LayoutGrid, 
  Users,
  Upload,
  Plus,
  Quote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStateNames, getCityNames } from "@/lib/utils/indian-locations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

const ORGANIZATION_TYPES = [
  "Private Limited",
  "Public Limited",
  "Sole Proprietorship",
  "Partnership",
  "Limited Liability Partnership (LLP)",
  "One Person Company (OPC)",
  "NGO/Trust",
  "Government",
  "Other"
];

export default function BusinessRegistrationForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  
  // Location State
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const loadingCitiesRef = useRef(false);

  const [formData, setFormData] = useState({
    // Basic Information
    organizationName: "",
    uniquePageId: "",
    organizationType: "",
    businessCategory: "",
    organizationSize: "",
    tagline: "",
    
    // Contact
    contactName: "",
    contactPhone: "",
    email: "", 
    
    // Web Presence
    website: "",
    linkedinUrl: "",
    twitterUrl: "",

    // Address
    address: "",
    city: "",
    state: "",
    country: "India",
    zipCode: "",
    
    // Details
    description: "",

    // Agreements
    agreeTerms: false,
    subscribeNewsletter: false,
    contactViaEmail: false,
    contactViaPhone: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Alert State
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicateAlertMessage, setDuplicateAlertMessage] = useState("");
  const [redirectTimer, setRedirectTimer] = useState(60);

  // Load states on component mount
  useEffect(() => {
    if (loadingStates || states.length > 0) return;
    
    setLoadingStates(true);
    getStateNames()
      .then((stateNames) => {
        setStates(stateNames);
        setLoadingStates(false);
      })
      .catch((error) => {
        console.error('Error loading states:', error);
        setStates([]);
        setLoadingStates(false);
      });
  }, [loadingStates, states.length]);

  // Load cities when state changes
  useEffect(() => {
    if (!formData.state) {
      setCities([]);
      return;
    }

    if (loadingCitiesRef.current) return;
    
    loadingCitiesRef.current = true;
    setLoadingCities(true);
    
    getCityNames(formData.state)
      .then((cityNames) => {
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

    // Business Information
    if (!formData.organizationName.trim()) newErrors.organizationName = "Business name is required";
    if (!formData.uniquePageId.trim()) {
      newErrors.uniquePageId = "Unique Page ID is required";
    } else if (formData.uniquePageId.length < 8) {
      newErrors.uniquePageId = "Minimum 8 characters required";
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.uniquePageId)) {
      newErrors.uniquePageId = "Only letters, numbers, dots, underscores, and dashes allowed";
    }

    if (!formData.organizationType) newErrors.organizationType = "Organization type is required";
    if (!formData.businessCategory) newErrors.businessCategory = "Category is required";
    if (!formData.organizationSize) newErrors.organizationSize = "Size is required";
    if (!formData.tagline.trim()) newErrors.tagline = "Tagline is required"; // As per user request "required fields are... 3) Add Tagline"
    if (!formData.description.trim()) newErrors.description = "Description is required";

    // Contact
    if (!formData.contactName.trim()) newErrors.contactName = "Contact name is required";
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = "Contact phone is required";
    } else if (!/^[\+]?[\d\s\-\(\)]{10,15}$/.test(formData.contactPhone.trim())) {
      newErrors.contactPhone = "Please enter a valid phone number";
    }

    // Address
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!/^\d{6}$/.test(formData.zipCode.trim())) {
      newErrors.zipCode = "Please enter a valid 6-digit PIN code";
    }

    // Website validation
    if (formData.website && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/i.test(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
    }

    // Terms
    if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Normalize URLs
      let websiteUrl = formData.website;
      if (websiteUrl && !/^https?:\/\//i.test(websiteUrl)) {
        websiteUrl = `https://${websiteUrl}`;
      }

      const submissionData = {
        ...formData,
        website: websiteUrl,
        country: "India",
      };

      const response = await fetch('/api/registration/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        router.push('/registration/success?type=business');
      } else {
        const errorData = await response.json();
        
        if (
          errorData.message === 'You already have an active business registration application' ||
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

  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange('uniquePageId', suggestion);
  };

  // Generate suggestions based on org name
  const getSuggestions = () => {
    // Determine the base seed for suggestions:
    // If the user has typed at least 3 characters in the unique ID field, use that as the seed.
    // Otherwise, fallback to the organization name.
    let seed = formData.uniquePageId && formData.uniquePageId.length >= 3 
      ? formData.uniquePageId 
      : formData.organizationName;

    if (!seed) return ["careerbox", "careerbox.in", "careerbox123"];

    // Clean the seed: lowercase and remove non-alphanumeric chars
    const base = seed.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (base.length < 3) return ["careerbox", "careerbox.in", "careerbox123"];

    // Random suffixes and patterns to generate variety
    const suffixes = ["official", "biz", "hq", "india", "global", "co", "inc", "ltd", "group"];
    const separators = ["", ".", "_", "-"];
    
    const generated: string[] = [];

    // 1. Base + Random Number
    generated.push(`${base}${Math.floor(Math.random() * 900) + 100}`);

    // 2. Base + Separator + Suffix (Try 2 random combinations)
    for (let i = 0; i < 2; i++) {
      const sep = separators[Math.floor(Math.random() * separators.length)];
      const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
      generated.push(`${base}${sep}${suf}`);
    }

    // 3. Prefix + Base (e.g., "join.careerbox" or "the.careerbox")
    const prefixes = ["join", "get", "weare", "the"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    generated.push(`${prefix}.${base}`);

    // 4. Pure Base (if not taken logic was here, but for now just suggest it if valid length)
    if (base.length >= 8) {
      generated.push(base);
    }

    // Shuffle and pick 3 unique ones
    const unique = Array.from(new Set(generated));
    // Simple shuffle
    unique.sort(() => Math.random() - 0.5);
    
    return unique.slice(0, 3);
  };

  const suggestions = getSuggestions();

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
            <div className="mx-auto w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-3">
              <Briefcase className="h-7 w-7 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Business Registration</h1>
            <p className="text-base text-gray-500 mt-1">
              Create your company profile and start hiring talent
            </p>
          </div>

          <div className="px-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* LEFT SIDE: Registration Form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Business Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <div className="p-2.5 bg-purple-50 rounded-xl">
                        <Briefcase className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Business Details</h3>
                        <p className="text-sm text-gray-500">Basic information about your company</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* Business Name */}
                      <div className="space-y-2">
                        <Label htmlFor="organizationName" className="text-slate-700 font-semibold ml-1">Business Name *</Label>
                        <div className="relative">
                           <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                           <Input
                             id="organizationName"
                             placeholder="Enter registered business name"
                             value={formData.organizationName}
                             onChange={(e) => handleInputChange('organizationName', e.target.value)}
                             className={cn("pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl", errors.organizationName && 'border-red-500')}
                           />
                        </div>
                        {errors.organizationName && <p className="text-sm text-red-600 mt-1">{errors.organizationName}</p>}
                      </div>

                      {/* Unique Page ID */}
                      <div className="space-y-2">
                         <Label htmlFor="uniquePageId" className="text-slate-700 font-semibold ml-1">
                            careerbox.in/business/ Add your Unique Page ID <span className="text-red-500">*</span>
                         </Label>
                         <div className="relative flex items-center">
                            <div className="absolute left-0 top-1 bottom-1 left-1 px-4 rounded-l-xl flex items-center text-slate-500 text-sm font-medium">
                               careerbox.in/business/
                            </div>
                            <Input
                               id="uniquePageId"
                               placeholder="your-business-id"
                               value={formData.uniquePageId}
                               onChange={(e) => handleInputChange('uniquePageId', e.target.value)}
                               className={cn(
                                  "pl-[175px] h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl",
                                  errors.uniquePageId && 'border-red-500'
                               )}
                            />
                            {formData.uniquePageId.length >= 8 && !errors.uniquePageId && (
                               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                                  <CheckCircle className="h-5 w-5" />
                               </div>
                            )}
                         </div>
                         <p className="text-xs text-slate-500 ml-1">
                            Somewhat related to like your brand or business name (minimum 8 letters)
                         </p>
                         {errors.uniquePageId && <p className="text-sm text-red-600 mt-1">{errors.uniquePageId}</p>}
                         
                         <div className="flex flex-wrap items-center gap-2 mt-2 ml-1">
                            <span className="text-sm text-slate-600 font-medium">Suggested ids:</span>
                            {suggestions.map((suggestion) => (
                               <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded-full border border-green-100 transition-colors"
                               >
                                  {suggestion}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Organization Type */}
                        <div className="space-y-2">
                           <Label htmlFor="organizationType" className="text-slate-700 font-semibold ml-1">Organization Type *</Label>
                           <Select value={formData.organizationType} onValueChange={(value) => handleInputChange('organizationType', value)}>
                              <SelectTrigger className={cn("h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.organizationType && 'border-red-500')}>
                                 <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                 {ORGANIZATION_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           {errors.organizationType && <p className="text-sm text-red-600 mt-1">{errors.organizationType}</p>}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                          <Label htmlFor="businessCategory" className="text-slate-700 font-semibold ml-1">Category *</Label>
                          <Select value={formData.businessCategory} onValueChange={(value) => handleInputChange('businessCategory', value)}>
                            <SelectTrigger className={cn("h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.businessCategory && 'border-red-500')}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {BUSINESS_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.businessCategory && <p className="text-sm text-red-600 mt-1">{errors.businessCategory}</p>}
                        </div>
                      </div>

                      {/* Organization Size */}
                      <div className="space-y-2">
                          <Label htmlFor="organizationSize" className="text-slate-700 font-semibold ml-1">Company Size *</Label>
                          <Select value={formData.organizationSize} onValueChange={(value) => handleInputChange('organizationSize', value)}>
                            <SelectTrigger className={cn("h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl", errors.organizationSize && 'border-red-500')}>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {ORGANIZATION_SIZES.map((size) => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.organizationSize && <p className="text-sm text-red-600 mt-1">{errors.organizationSize}</p>}
                      </div>

                      {/* Tagline */}
                      <div className="space-y-2">
                        <Label htmlFor="tagline" className="text-slate-700 font-semibold ml-1">Tagline <span className="text-xs font-normal text-slate-500">(e.g. An award-winning EdTech initiative)</span> *</Label>
                        <div className="relative">
                           <Quote className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                           <Input
                             id="tagline"
                             placeholder="Enter your business tagline"
                             value={formData.tagline}
                             onChange={(e) => handleInputChange('tagline', e.target.value)}
                             className={cn("pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all rounded-xl", errors.tagline && 'border-red-500')}
                           />
                        </div>
                        <p className="text-xs text-slate-500 ml-1">
                           Use your tagline to briefly describe what your organization does. This can be changed later.
                        </p>
                        {errors.tagline && <p className="text-sm text-red-600 mt-1">{errors.tagline}</p>}
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-700 font-semibold ml-1">About Business *</Label>
                        <Textarea
                          id="description"
                          placeholder="Brief description of what your business does..."
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className={cn("min-h-[100px] bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all rounded-xl", errors.description && 'border-red-500')}
                          rows={3}
                        />
                        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                        <p className="text-xs text-gray-500 text-right">{formData.description.length} chars</p>
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
                            className={cn("pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all rounded-xl", errors.contactName && 'border-red-500')}
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
                            className={cn("pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all rounded-xl", errors.contactPhone && 'border-red-500')}
                          />
                        </div>
                        {errors.contactPhone && <p className="text-sm text-red-600 mt-1">{errors.contactPhone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Web Presence */}
                  <div className="space-y-6 pt-4 border-t border-dashed border-gray-200">
                    <div className="flex items-center gap-3 pb-2">
                      <div className="p-2.5 bg-blue-50 rounded-xl">
                        <Globe className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Web Presence</h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-slate-700 font-semibold ml-1">Official Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            id="website"
                            type="url"
                            placeholder="https://www.example.com"
                            value={formData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            className={cn("pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all rounded-xl", errors.website && 'border-red-500')}
                          />
                        </div>
                        {errors.website && <p className="text-sm text-red-600 mt-1">{errors.website}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                         <div className="space-y-2">
                          <Label htmlFor="linkedinUrl" className="text-slate-700 font-semibold ml-1">LinkedIn URL</Label>
                          <Input
                            id="linkedinUrl"
                            placeholder="https://linkedin.com/company/..."
                            value={formData.linkedinUrl}
                            onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                            className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all rounded-xl"
                          />
                         </div>
                         <div className="space-y-2">
                          <Label htmlFor="twitterUrl" className="text-slate-700 font-semibold ml-1">Twitter URL</Label>
                          <Input
                            id="twitterUrl"
                            placeholder="https://twitter.com/..."
                            value={formData.twitterUrl}
                            onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                            className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all rounded-xl"
                          />
                         </div>
                      </div>
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
                        <p className="text-sm text-gray-500">Where are your headquarters?</p>
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
                          className={cn("min-h-[100px] bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all rounded-xl", errors.address && 'border-red-500')}
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
                          className={cn("h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20 transition-all rounded-xl", errors.zipCode && 'border-red-500')}
                          maxLength={6}
                        />
                        {errors.zipCode && <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Terms & Submit */}
                  <div className="space-y-6 pt-4 border-t border-dashed border-gray-200">
                     <div className="bg-purple-50/50 rounded-xl p-5 border border-purple-100">
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
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
                   <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                   </div>
                   
                   {/* Profile Content */}
                   <div className="px-6 pb-6 relative">
                      {/* Logo */}
                      <div className="w-24 h-24 bg-white rounded-xl shadow-md border-4 border-white absolute -top-28 left-6 flex items-center justify-center overflow-hidden z-10">
                         <Building2 className="h-10 w-10 text-gray-300" />
                      </div>
                      
                      {/* Business Name & Details */}
                      <div className="mt-10 mb-6">
                         <h2 className="text-2xl font-bold text-gray-900 break-words leading-tight min-h-[2rem]">
                            {formData.organizationName || "Business Name"}
                         </h2>
                         {formData.tagline && (
                            <p className="text-sm text-gray-500 font-medium mt-1 mb-2">
                               {formData.tagline}
                            </p>
                         )}
                         <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                            {formData.businessCategory && (
                               <span className="text-gray-500 text-xs">
                                  {formData.businessCategory}
                               </span>
                            )}
                         </div>

                         {/* Follow Button */}
                         <div className="mt-4">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-9 text-sm font-semibold">
                               <Plus className="h-4 w-4 mr-1" /> Follow
                            </Button>
                         </div>
                      </div>

                      <div className="space-y-4 pt-2 border-t border-gray-100">
                         <div className="flex items-start gap-3 text-sm pt-4">
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
                            <span className="text-purple-600 truncate">
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
                      
                      {/* <div className="mt-8 pt-6 border-t border-gray-100">
                         <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                            <p className="text-xs text-gray-500 mb-2">Registration Status</p>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold">
                               <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                               Drafting
                            </div>
                         </div>
                      </div> */}
                   </div>
                </div>
                
                <div className="mt-6 bg-purple-50 rounded-xl p-4 border border-purple-100 flex gap-3">
                   <div className="p-2 bg-purple-100 rounded-lg h-fit">
                      <CheckCircle className="h-5 w-5 text-purple-700" />
                   </div>
                   <div>
                      <h4 className="font-semibold text-purple-900 text-sm">Why Register?</h4>
                      <ul className="mt-2 space-y-1 text-xs text-purple-800">
                         <li>• Verified badge on your profile</li>
                         <li>• Access to talent database</li>
                         <li>• Post jobs and internships</li>
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
