'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, GraduationCap, BookOpen, ArrowRight, MessageCircle, CheckCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { getStateNames, getCityNames } from "@/lib/utils/indian-locations";

interface CounsellingFormData {
  name: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  courseLevel: string;
  courseInterest: string;
  agreeToTerms: boolean;
}

const courseLevels = [
  { value: 'undergraduate', label: 'Undergraduate (After 12th)' },
  { value: 'postgraduate', label: 'Postgraduate (After Graduation)' },
  { value: 'professional', label: 'Executive Education (For Working Professionals & CXOs)' },
  { value: 'medical', label: 'Doctorate / Ph.D (After UG or PG + Work Ex)' },
  { value: 'Advance_diploma', label: 'Advance Diploma Courses (After 12th)' },
  { value: 'diploma', label: 'Diploma Courses (After 10th & 12th)' },
  { value: 'certification', label: 'Skilling & Certification Programs (After 10th & 12th)' },
  { value: 'abroad', label: 'Abroad Education (Pathway / Hybrid Mode)' },
  { value: 'Job_guarantee', label: 'Job Guarantee Program (100% Placement)' },
  { value: 'other', label: 'Other' }
];

export default function CareerCounsellingPage() {
  const [formData, setFormData] = useState<CounsellingFormData>({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    courseLevel: '',
    courseInterest: '',
    agreeToTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Load states on mount
  useEffect(() => {
    getStateNames().then(setStates);
  }, []);

  // Load cities when state changes
  useEffect(() => {
    if (formData.state) {
      getCityNames(formData.state).then(setCities);
    } else {
      setCities([]);
    }
  }, [formData.state]);

  const handleInputChange = (field: keyof CounsellingFormData, value: string | boolean) => {
    setFormData(prev => {
      // If state changes, reset city
      if (field === 'state') {
        return { ...prev, [field]: value as string, city: '' };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      alert('Please agree to the Privacy Policy and Terms & Conditions');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await apiClient.post('/api/career-counselling', formData);

      if (response.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          state: '',
          city: '',
          courseLevel: '',
          courseInterest: '',
          agreeToTerms: false
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Subtle Grid Background Pattern */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Add top padding to account for fixed header */}
      <div className="pt-8 pb-20 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              {/* Left Content */}
              <div className="space-y-10">
                <div className="inline-flex px-4 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 text-blue-700 text-sm font-semibold rounded-full shadow-sm">
                  🚀 Empowering Careers, Transforming Lives
                </div>
                
                <div className="space-y-6">
                  <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight text-slate-900">
                    Your Pathway to
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      Excellence
                    </span>
                  </h1>
                  
                  <p className="text-xl text-slate-600 leading-relaxed max-w-xl font-light">
                    Unlock your potential with personalized career guidance. We help you navigate the complexities of education and career choices to find your perfect fit.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/signup">
                    <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg rounded-xl shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 transition-all duration-300">
                      Get Started Free
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="h-14 px-8 border-slate-200 text-slate-700 hover:bg-blue-100/50 hover:text-blue-600 text-lg rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Join Community
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-8">
                    <div>
                        <div className="text-3xl font-bold text-slate-900">10k+</div>
                        <div className="text-sm text-slate-500 font-medium">Students Guided</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">300+</div>
                        <div className="text-sm text-slate-500 font-medium">Popular Institutes</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">95%</div>
                        <div className="text-sm text-slate-500 font-medium">Success Rate</div>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-slate-400 pt-10">
                  &copy; {new Date().getFullYear()} CareerBox. All rights reserved.
                </div>
              </div>

              {/* Right Form */}
              <div className="relative">
                {/* Decorative blob behind the form only */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-[2.5rem] blur-xl opacity-50 pointer-events-none" />
                
                <Card className="relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 bg-white rounded-3xl overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600" />
                  <CardContent className="p-8 lg:p-10">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Free Career Counselling
                      </h2>
                      <p className="text-slate-500 text-lg">
                        Fill out the form below to request a callback
                      </p>
                    </div>

                    {submitStatus === 'success' && (
                      <Alert className="border-green-100 bg-green-50/80 backdrop-blur-sm mb-8 rounded-xl">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <AlertDescription className="text-green-800 font-medium ml-2">
                          Request received! We'll contact you shortly.
                        </AlertDescription>
                      </Alert>
                    )}

                    {submitStatus === 'error' && (
                      <Alert variant="destructive" className="mb-8 rounded-xl bg-red-50 border-red-100 text-red-700">
                        <AlertDescription>
                          Something went wrong. Please try again.
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name Field */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700 font-medium ml-1">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Email and Phone */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-700 font-medium ml-1">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="email_id@example.com"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              required
                              className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-slate-700 font-medium ml-1">Phone Number</Label>
                          <div className="relative flex">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                               <Phone className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="flex w-full">
                              <span className="inline-flex items-center pl-12 pr-3 text-slate-500 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl font-medium">
                                +91
                              </span>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="98765 43210"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                required
                                className="pl-4 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-l-none rounded-r-xl border-l-0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* State and City */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-slate-700 font-medium ml-1">State</Label>
                          <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl text-slate-600">
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-100 shadow-xl rounded-xl p-1 max-h-60">
                              {states.map((state) => (
                                <SelectItem 
                                  key={state} 
                                  value={state}
                                  className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer text-slate-600 py-2 rounded-lg my-0.5"
                                >
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-slate-700 font-medium ml-1">City</Label>
                          <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)} disabled={!formData.state}>
                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl text-slate-600 disabled:opacity-50">
                              <SelectValue placeholder={formData.state ? "Select City" : "Select State First"} />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-100 shadow-xl rounded-xl p-1 max-h-60">
                              {cities.map((city) => (
                                <SelectItem 
                                  key={city} 
                                  value={city}
                                  className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer text-slate-600 py-2 rounded-lg my-0.5"
                                >
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Course Level and Interest */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="courseLevel" className="text-slate-700 font-medium ml-1">Course Level</Label>
                          <div className="relative">
                            <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                            <Select value={formData.courseLevel} onValueChange={(value) => handleInputChange('courseLevel', value)}>
                              <SelectTrigger className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl text-slate-600">
                                <SelectValue placeholder="Select Level" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-slate-100 shadow-xl rounded-xl p-1">
                                {courseLevels.map((level) => (
                                  <SelectItem 
                                    key={level.value} 
                                    value={level.value}
                                    className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer text-slate-600 py-3 rounded-lg my-0.5"
                                  >
                                    {level.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="courseInterest" className="text-slate-700 font-medium ml-1">Interested Course</Label>
                          <div className="relative">
                            <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                              id="courseInterest"
                              type="text"
                              placeholder="e.g. MBA, B.Tech"
                              value={formData.courseInterest}
                              onChange={(e) => handleInputChange('courseInterest', e.target.value)}
                              required
                              className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Terms Checkbox */}
                      <div className="flex items-start space-x-3 pt-2">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                          className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-slate-300"
                        />
                        <Label htmlFor="terms" className="text-sm text-slate-500 leading-relaxed cursor-pointer font-normal">
                          I agree to CareerBox's{' '}
                          <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                            Privacy Policy
                          </Link>{' '}
                          and{' '}
                          <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                            Terms & Conditions
                          </Link>
                        </Label>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isSubmitting || !formData.agreeToTerms}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl mt-4"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <>
                            Request Free Callback <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-4">
                      <span>🔒 Secure Information</span>
                      <span>📞 24hr Response Time</span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
