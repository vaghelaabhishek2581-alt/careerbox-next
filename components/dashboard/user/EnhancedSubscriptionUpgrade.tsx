"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Check, 
  Crown, 
  Building, 
  GraduationCap, 
  Star,
  ArrowRight,
  Zap,
  Users,
  BarChart3,
  Shield,
  Headphones,
  TrendingUp,
  Award,
  Globe
} from "lucide-react";
import PaymentModal from "@/components/payment/PaymentModal";
import { PAYMENT_PLANS } from "@/lib/payment/plans";

export default function EnhancedSubscriptionUpgrade() {
  const [selectedPlan, setSelectedPlan] = useState<'BUSINESS' | 'INSTITUTE' | 'STUDENT_PREMIUM' | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleUpgrade = (planType: 'BUSINESS' | 'INSTITUTE' | 'STUDENT_PREMIUM') => {
    setSelectedPlan(planType);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (subscription: any) => {
    console.log('Payment successful:', subscription);
    // Redirect to appropriate dashboard
    window.location.href = '/dashboard';
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'BUSINESS':
        return <Building className="h-6 w-6" />;
      case 'INSTITUTE':
        return <GraduationCap className="h-6 w-6" />;
      case 'STUDENT_PREMIUM':
        return <Crown className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'BUSINESS':
        return 'text-blue-600';
      case 'INSTITUTE':
        return 'text-green-600';
      case 'STUDENT_PREMIUM':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPlanGradient = (planType: string) => {
    switch (planType) {
      case 'BUSINESS':
        return 'from-blue-500 to-blue-600';
      case 'INSTITUTE':
        return 'from-green-500 to-green-600';
      case 'STUDENT_PREMIUM':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Unlock Your Potential with CareerBox
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your needs and take your career or business to the next level
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-lg shadow-sm border">
            <div className="flex">
              {(['MONTHLY', 'QUARTERLY', 'YEARLY'] as const).map((billing) => (
                <Button
                  key={billing}
                  variant={selectedBilling === billing ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedBilling(billing)}
                  className="px-6"
                >
                  {billing}
                  {billing === 'YEARLY' && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Save up to 20%
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
          {/* Business Plan */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getPlanGradient('BUSINESS')}`} />
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full bg-gradient-to-r ${getPlanGradient('BUSINESS')} text-white`}>
                  {getPlanIcon('BUSINESS')}
                </div>
              </div>
              <CardTitle className={`text-2xl ${getPlanColor('BUSINESS')}`}>
                Business Plan
              </CardTitle>
              <CardDescription>
                Perfect for companies looking to hire and manage talent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold">
                  ₹{PAYMENT_PLANS.BUSINESS[selectedBilling].amount / 100}
                </div>
                <div className="text-sm text-muted-foreground">
                  per {selectedBilling.toLowerCase().slice(0, -2)}
                </div>
                {selectedBilling === 'YEARLY' && (
                  <Badge variant="secondary" className="mt-2">
                    Save ₹6,000
                  </Badge>
                )}
              </div>

              <ul className="space-y-3">
                {PAYMENT_PLANS.BUSINESS[selectedBilling].features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => handleUpgrade('BUSINESS')}
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Institute Plan */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-green-200">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getPlanGradient('INSTITUTE')}`} />
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500 text-white">Most Popular</Badge>
            </div>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full bg-gradient-to-r ${getPlanGradient('INSTITUTE')} text-white`}>
                  {getPlanIcon('INSTITUTE')}
                </div>
              </div>
              <CardTitle className={`text-2xl ${getPlanColor('INSTITUTE')}`}>
                Institute Plan
              </CardTitle>
              <CardDescription>
                Ideal for educational institutions and training centers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold">
                  ₹{PAYMENT_PLANS.INSTITUTE[selectedBilling].amount / 100}
                </div>
                <div className="text-sm text-muted-foreground">
                  per {selectedBilling.toLowerCase().slice(0, -2)}
                </div>
                {selectedBilling === 'YEARLY' && (
                  <Badge variant="secondary" className="mt-2">
                    Save ₹10,000
                  </Badge>
                )}
              </div>

              <ul className="space-y-3">
                {PAYMENT_PLANS.INSTITUTE[selectedBilling].features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => handleUpgrade('INSTITUTE')}
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Student Premium Plan */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getPlanGradient('STUDENT_PREMIUM')}`} />
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full bg-gradient-to-r ${getPlanGradient('STUDENT_PREMIUM')} text-white`}>
                  {getPlanIcon('STUDENT_PREMIUM')}
                </div>
              </div>
              <CardTitle className={`text-2xl ${getPlanColor('STUDENT_PREMIUM')}`}>
                Premium Student
              </CardTitle>
              <CardDescription>
                Enhanced features for students and professionals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold">
                  ₹{PAYMENT_PLANS.STUDENT_PREMIUM[selectedBilling].amount / 100}
                </div>
                <div className="text-sm text-muted-foreground">
                  per {selectedBilling.toLowerCase().slice(0, -2)}
                </div>
                {selectedBilling === 'YEARLY' && (
                  <Badge variant="secondary" className="mt-2">
                    Save ₹600
                  </Badge>
                )}
              </div>

              <ul className="space-y-3">
                {PAYMENT_PLANS.STUDENT_PREMIUM[selectedBilling].features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                onClick={() => handleUpgrade('STUDENT_PREMIUM')}
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compare All Features</h2>
            <p className="text-muted-foreground">
              See what's included in each plan to make the right choice
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Features</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-purple-600">Premium Student</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-blue-600">Business</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-green-600">Institute</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { feature: 'Browse Jobs & Courses', free: true, student: true, business: true, institute: true },
                    { feature: 'Apply to Opportunities', free: true, student: true, business: true, institute: true },
                    { feature: 'Basic Profile Management', free: true, student: true, business: true, institute: true },
                    { feature: 'Unlimited Applications', free: false, student: true, business: true, institute: true },
                    { feature: 'Advanced Profile Features', free: false, student: true, business: true, institute: true },
                    { feature: 'Skill Assessments', free: false, student: true, business: true, institute: true },
                    { feature: 'Job Posting', free: false, student: false, business: true, institute: false },
                    { feature: 'Course Creation', free: false, student: false, business: false, institute: true },
                    { feature: 'Candidate Screening', free: false, student: false, business: true, institute: false },
                    { feature: 'Student Enrollment', free: false, student: false, business: false, institute: true },
                    { feature: 'Analytics Dashboard', free: false, student: true, business: true, institute: true },
                    { feature: 'Priority Support', free: false, student: true, business: true, institute: true },
                    { feature: 'API Access', free: false, student: false, business: true, institute: true },
                    { feature: 'Custom Branding', free: false, student: false, business: true, institute: true },
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {row.free ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.student ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.business ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.institute ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-semibold mb-1">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">Powered by Razorpay with bank-level security</p>
            </div>
            <div className="flex flex-col items-center">
              <Headphones className="h-8 w-8 text-blue-500 mb-2" />
              <h3 className="font-semibold mb-1">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Get help whenever you need it</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-8 w-8 text-purple-500 mb-2" />
              <h3 className="font-semibold mb-1">Money Back Guarantee</h3>
              <p className="text-sm text-muted-foreground">7-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          planType={selectedPlan}
          billingCycle={selectedBilling}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
