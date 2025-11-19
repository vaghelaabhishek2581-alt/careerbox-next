'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PageLayout from '@/components/page-layout';
import HeroSection from '@/components/hero-section';
import { ContactFormData } from '@/lib/types';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Building2, GraduationCap, HelpCircle } from 'lucide-react';

// Note: This would need to be generated in a layout or parent component in a real app
// export const metadata: Metadata = generateSEOMetadata({
//   title: 'Contact Us',
//   description: 'Get in touch with CareerBox. Contact our team for support, partnerships, or general inquiries. We\'re here to help you succeed.',
//   keywords: ['contact careerbox', 'customer support', 'business inquiries', 'partnerships', 'help center'],
//   canonicalUrl: '/contact'
// });

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email',
    contact: 'info@careerbox.in',
    availability: '24/7'
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Talk to our team',
    contact: '+91 99 0967 5185',
    availability: 'Mon-Fri, 9am-6pm IST'
  },
  {
    icon: MapPin,
    title: 'Office Location',
    description: 'Visit our headquarters',
    contact: 'Ahmedabad, Gujarat',
    availability: 'By appointment'
  },
  {
    icon: Clock,
    title: 'Response Time',
    description: 'Average response time',
    contact: '< 24 hours',
    availability: 'Business inquiries'
  }
];

const departments = [
  { value: 'general', label: 'General Inquiry', icon: MessageSquare },
  { value: 'business', label: 'Business Solutions', icon: Building2 },
  { value: 'institute', label: 'Educational Partnerships', icon: GraduationCap },
  { value: 'support', label: 'Technical Support', icon: HelpCircle }
];

const faqs = [
  {
    question: 'How quickly can we get started?',
    answer: 'Most implementations can begin within 1-2 weeks of signing up. Our onboarding team will guide you through the entire process.'
  },
  {
    question: 'Do you offer custom enterprise solutions?',
    answer: 'Yes, we provide fully customized solutions for large organizations with specific requirements. Contact our enterprise team for details.'
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'We offer 24/7 email support, phone support during business hours, comprehensive documentation, and dedicated customer success managers for enterprise clients.'
  },
  {
    question: 'Can I integrate with existing HR systems?',
    answer: 'Absolutely! We integrate with most major HR systems including Workday, BambooHR, ATS platforms, and more. Our technical team can assist with setup.'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    type: 'general'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <PageLayout>
      <HeroSection
        title="Get In Touch"
        subtitle="We're Here to Help"
        description="Have questions about our services? Ready to partner with us? Looking for support? Our team is here to assist you every step of the way."
        primaryCTA={{
          text: "Contact Form",
          href: "#contact-form"
        }}
        secondaryCTA={{
          text: "Schedule Demo",
          href: "#demo"
        }}
        badge="📞 24/7 Support Available"
        backgroundGradient="from-blue-50 via-purple-50 to-indigo-50"
      />

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Multiple Ways to Reach Us</h2>
            <p className="text-xl text-gray-600">
              Choose the contact method that works best for you
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                    <p className="text-gray-600 mb-4">{method.description}</p>
                    <div className="text-lg font-semibold text-blue-600 mb-2">{method.contact}</div>
                    <p className="text-sm text-gray-500">{method.availability}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <p className="text-xl text-gray-600">
                Fill out the form below and we'll get back to you within 24 hours
              </p>
            </div>
            
            <Card className="shadow-2xl border-0">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitStatus === 'success' && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">
                        Thank you for your message! We'll get back to you within 24 hours.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {submitStatus === 'error' && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Sorry, there was an error sending your message. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@company.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company">Company/Organization</Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Your company name"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Inquiry Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value as ContactFormData['type'])}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Brief subject of your message"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your needs, questions, or how we can help you..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Sending Message...'
                    ) : (
                      <>
                        Send Message <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Office Hours & Location */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Visit Our Office</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Headquarters</h3>
                      <p className="text-gray-600">
                        53, World Business House,<br />
                        Nr. Parimal Garden, EllisBridge,<br />
                        Ahmedabad - 380006 (Gujarat) India
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Office Hours</h3>
                      <p className="text-gray-600">
                        Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                        Saturday: 10:00 AM - 2:00 PM IST<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Schedule a Visit</h4>
                    <p className="text-sm text-blue-700">
                      Interested in touring our office or meeting in person? Contact us to schedule an appointment.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                  <iframe
  src="https://www.google.com/maps?q=23.0195344,72.558727&z=15&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-2xl"
                  ></iframe>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <h3 className="font-bold text-gray-900 text-sm">Ahmedabad</h3>
                  <p className="text-xs text-gray-600">Gujarat, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Find Us on Map</h2>
            <p className="text-xl text-gray-600">
              Located in the heart of Ahmedabad's business district
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <iframe
  src="https://www.google.com/maps?q=23.0195344,72.558727&z=15&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Address</h4>
                <p className="text-gray-600 text-sm">53, World Business House, Nr. Parimal Garden, Ahmedabad Gujarat India</p>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Phone</h4>
                <p className="text-gray-600 text-sm">+91 79 1234 5678</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Email</h4>
                <p className="text-gray-600 text-sm">info@careerbox.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}