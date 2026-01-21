"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContactFormData } from "@/lib/types";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Building2,
  GraduationCap,
  HelpCircle,
  ArrowRight,
  User,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/footer";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    contact: "info@careerbox.in",
    availability: "24/7",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Talk to our team",
    contact: "+91 99 0967 5185",
    availability: "Mon-Fri, 9am-6pm IST",
  },
  {
    icon: MapPin,
    title: "Office Location",
    description: "Visit our headquarters",
    contact: "Ahmedabad, Gujarat",
    availability: "By appointment",
  },
  {
    icon: Clock,
    title: "Response Time",
    description: "Average response time",
    contact: "< 24 hours",
    availability: "Business inquiries",
  },
];

const departments = [
  { value: "general", label: "General Inquiry", icon: MessageSquare },
  { value: "business", label: "Business Solutions", icon: Building2 },
  {
    value: "institute",
    label: "Educational Partnerships",
    icon: GraduationCap,
  },
  { value: "support", label: "Technical Support", icon: HelpCircle },
];

const faqs = [
  {
    question: "How quickly can we get started?",
    answer:
      "Most implementations can begin within 1-2 weeks of signing up. Our onboarding team will guide you through the entire process.",
  },
  {
    question: "Do you offer custom enterprise solutions?",
    answer:
      "Yes, we provide fully customized solutions for large organizations with specific requirements. Contact our enterprise team for details.",
  },
  {
    question: "What kind of support do you provide?",
    answer:
      "We offer 24/7 email support, phone support during business hours, comprehensive documentation, and dedicated customer success managers for enterprise clients.",
  },
  {
    question: "Can I integrate with existing HR systems?",
    answer:
      "Absolutely! We integrate with most major HR systems including Workday, BambooHR, ATS platforms, and more. Our technical team can assist with setup.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    mobile: "",
    message: "",
    type: "general",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          mobile: "",
          message: "",
          type: "general",
        });
      } else {
        setSubmitStatus("error");
        setErrorMessage(data.message || "Failed to send message");
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 min-h-[calc(90vh)] relative flex items-center">
        <div className="mx-[20px] sm:mx-[70px] mt-8 sm:mt-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            {/* Left side content */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-8 sm:pb-12 md:pb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 text-sm font-medium rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                24/7 Support Available
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                Get in Touch <br></br> with{" "}
                <span className="text-blue-600">Our Team</span>
              </h1>
              <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-prose md:max-w-xl leading-relaxed">
                Have questions about our services? Ready to partner with us?
                Looking for support? Our team is here to assist you every step
                of the way.
              </p>

              <div className="flex flex-wrap gap-3 pt-4">
                <Link href="#contact-form">
                  <Button
                    size="lg"
                    className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Contact Form
                  </Button>
                </Link>
                <Link href="#location">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-lg border-2 hover:bg-gray-50 rounded-xl"
                  >
                    Visit Office
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-8 border-t border-gray-100 mt-8">
                <div className="flex -space-x-4">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200">
                    <img
                      src="https://api.dicebear.com/9.x/personas/svg?seed=jack.png"
                      alt="Avatar 1"
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300">
                    <img
                      src="https://api.dicebear.com/9.x/personas/svg?seed=jack"
                      alt="Avatar 2"
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-400">
                    <img
                      src="https://api.dicebear.com/9.x/personas/svg?seed=sheela"
                      alt="Avatar 3"
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                    +49
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">
                    50+ Support Agents
                  </span>
                  <br />
                  Ready to help you now
                </div>
              </div>
            </div>

            {/* Right visual */}
            <div className="relative flex justify-center md:justify-end h-full min-h-[400px]">
              <div className="w-full max-w-lg h-auto relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full opacity-50 blur-3xl"></div>
                <img
                  src="/contact.png"
                  alt="Contact Us"
                  className="relative z-10 w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Multiple Ways to Reach Us
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the contact method that works best for you
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactMethods.map((method, index) => {
                const IconComponent = method.icon;
                return (
                  <Card
                    key={index}
                    className="text-center hover:shadow-xl transition-all duration-300 border-gray-100 group hover:-translate-y-2 bg-white"
                  >
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-600 transition-colors rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <IconComponent className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {method.title}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        {method.description}
                      </p>
                      <div className="text-lg font-bold text-gray-900 mb-2">
                        {method.contact}
                      </div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        {method.availability}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Send Us a Message
                  </h2>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Fill out the form below and we&apos;ll get back to you
                    within 24 hours. We&apos;re eager to hear from you.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">
                          General Inquiries
                        </h4>
                        <p className="text-gray-600 text-sm">
                          For general questions about our platform and services.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">
                          Business Solutions
                        </h4>
                        <p className="text-gray-600 text-sm">
                          For companies looking to hire talent or upskill
                          employees.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">
                          Support
                        </h4>
                        <p className="text-gray-600 text-sm">
                          For technical assistance and account support.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="shadow-2xl border-gray-100 rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {submitStatus === "success" && (
                        <Alert className="border-green-200 bg-green-50 rounded-xl">
                          <AlertDescription className="text-green-800 font-medium flex items-center gap-2">
                            <span className="text-xl">✅</span> Thank you!
                            We&apos;ll be in touch shortly.
                          </AlertDescription>
                        </Alert>
                      )}

                      {submitStatus === "error" && (
                        <Alert variant="destructive" className="rounded-xl">
                          <AlertDescription>
                            {errorMessage ||
                              "Sorry, there was an error sending your message. Please try again."}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="text-slate-700 font-medium ml-1"
                          >
                            Full Name <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <User className="h-5 w-5" />
                            </div>
                            <Input
                              id="name"
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              required
                              className="h-12 pl-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-slate-700 font-medium ml-1"
                          >
                            Email Address{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Mail className="h-5 w-5" />
                            </div>
                            <Input
                              id="email"
                              type="email"
                              placeholder="john@example.com"
                              value={formData.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              required
                              className="h-12 pl-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="mobile"
                            className="text-slate-700 font-medium ml-1"
                          >
                            Mobile Number{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Phone className="h-5 w-5" />
                            </div>
                            <Input
                              id="mobile"
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={formData.mobile}
                              onChange={(e) =>
                                handleInputChange("mobile", e.target.value)
                              }
                              required
                              className="h-12 pl-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="type"
                            className="text-slate-700 font-medium ml-1"
                          >
                            Inquiry Type
                          </Label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                              <HelpCircle className="h-5 w-5" />
                            </div>
                            <Select
                              value={formData.type}
                              onValueChange={(value) =>
                                handleInputChange(
                                  "type",
                                  value as ContactFormData["type"]
                                )
                              }
                            >
                              <SelectTrigger className="h-12 pl-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem
                                    key={dept.value}
                                    value={dept.value}
                                  >
                                    {dept.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="message"
                          className="text-slate-700 font-medium ml-1"
                        >
                          Message <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us more about your needs..."
                          rows={4}
                          value={formData.message}
                          onChange={(e) =>
                            handleInputChange("message", e.target.value)
                          }
                          required
                          className="min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl resize-none p-4"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending...</span>
                          </div>
                        ) : (
                          "Send Message"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Quick answers to common questions
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {faqs.map((faq, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow duration-300 border-gray-100 bg-white"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900">
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Hours & Location */}
      <section id="location" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">
                    Visit Our Office
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          Headquarters
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          53, World Business House,
                          <br />
                          Nr. Parimal Garden, EllisBridge,
                          <br />
                          Ahmedabad - 380006 (Gujarat) India
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          Office Hours
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Monday - Friday: 9:00 AM - 6:00 PM IST
                          <br />
                          Saturday: 10:00 AM - 2:00 PM IST
                          <br />
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <iframe
                    src="https://www.google.com/maps?q=23.0195344,72.558727&z=15&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
