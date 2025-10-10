'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, GraduationCap, BookOpen, ArrowRight, MessageCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface CounsellingFormData {
  name: string;
  email: string;
  phone: string;
  courseLevel: string;
  courseInterest: string;
  agreeToTerms: boolean;
}

const courseLevels = [
  { value: 'undergraduate', label: 'Undergraduate (B.Tech, B.E, B.Sc, etc.)' },
  { value: 'postgraduate', label: 'Postgraduate (MBA, M.Tech, M.Sc, etc.)' },
  { value: 'professional', label: 'Professional Courses (CA, CS, CMA, etc.)' },
  { value: 'medical', label: 'Medical (MBBS, BDS, BAMS, etc.)' },
  { value: 'diploma', label: 'Diploma Courses' },
  { value: 'certification', label: 'Certification Programs' },
  { value: 'other', label: 'Other' }
];

export default function CareerCounsellingPage() {
  const [formData, setFormData] = useState<CounsellingFormData>({
    name: '',
    email: '',
    phone: '',
    courseLevel: '',
    courseInterest: '',
    agreeToTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleInputChange = (field: keyof CounsellingFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Add top padding to account for fixed header */}
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Content */}
              <div className="space-y-8">
                <Badge className="inline-flex px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 text-base font-medium rounded-full">
                  🚀 Empowering Careers, Transforming Lives
                </Badge>
                
                <div className="space-y-6">
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                      Your Pathway to
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Professional Excellence
                    </span>
                    <br />
                    <span className="text-4xl lg:text-5xl text-gray-700">
                      right now
                    </span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                    Discover personalized career guidance, skill development, and 
                    opportunities that propel you towards your professional goals.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600 px-8 py-6 text-lg rounded-xl transition-all duration-300">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Join Community
                  </Button>
                </div>
              </div>

              {/* Right Form */}
              <div className="relative">
                <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Free Career Counselling
                      </h2>
                      <p className="text-gray-600">
                        Get personalized guidance for your career path
                      </p>
                    </div>

                    {submitStatus === 'success' && (
                      <Alert className="border-green-200 bg-green-50 mb-6">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Thank you! We'll contact you within 24 hours for your free career counselling session.
                        </AlertDescription>
                      </Alert>
                    )}

                    {submitStatus === 'error' && (
                      <Alert variant="destructive" className="mb-6">
                        <AlertDescription>
                          Something went wrong. Please try again or contact us directly.
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name Field */}
                      <div className="relative">
                        <Label htmlFor="name" className="sr-only">Your Name</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            className="pl-12 h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Email Field */}
                      <div className="relative">
                        <Label htmlFor="email" className="sr-only">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            className="pl-12 h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div className="relative">
                        <Label htmlFor="phone" className="sr-only">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <div className="flex">
                            <span className="inline-flex items-center px-4 text-base text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-md">
                              +91
                            </span>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="Phone Number"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              required
                              className="pl-4 h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-l-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Course Level Dropdown */}
                      <div className="relative">
                        <Label htmlFor="courseLevel" className="sr-only">Course Level</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                          <Select value={formData.courseLevel} onValueChange={(value) => handleInputChange('courseLevel', value)}>
                            <SelectTrigger className="pl-12 h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select Course Level" />
                            </SelectTrigger>
                            <SelectContent>
                              {courseLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Course Interest Field */}
                      <div className="relative">
                        <Label htmlFor="courseInterest" className="sr-only">Course of Interest</Label>
                        <div className="relative">
                          <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="courseInterest"
                            type="text"
                            placeholder="Course of Interest (e.g., MBA, M.B.B.S, B.Tech, B.E)"
                            value={formData.courseInterest}
                            onChange={(e) => handleInputChange('courseInterest', e.target.value)}
                            required
                            className="pl-12 h-14 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Terms Checkbox */}
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                          className="mt-1"
                        />
                        <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                          I agree to Careerbox's{' '}
                          <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                            Privacy Policy
                          </Link>{' '}
                          and{' '}
                          <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                            Terms & Conditions
                          </Link>
                        </Label>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isSubmitting || !formData.agreeToTerms}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? (
                          'Requesting Callback...'
                        ) : (
                          <>
                            Request Callback <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>

                    <p className="text-center text-xs text-gray-500 mt-6">
                      📞 We'll call you within 24 hours • 🔒 Your information is secure
                    </p>
                  </CardContent>
                </Card>

                {/* Floating decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}