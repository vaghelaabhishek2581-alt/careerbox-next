"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Building2, Building, Clock, Mail, ArrowRight } from "lucide-react";

function RegistrationSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registrationType, setRegistrationType] = useState<'institute' | 'business' | null>(null);

  useEffect(() => {
    if (!searchParams) return;
    const type = searchParams.get('type');
    if (type && (type === 'institute' || type === 'business')) {
      setRegistrationType(type as 'institute' | 'business');
    }
  }, [searchParams]);

  const handleGoToDashboard = () => {
    router.push('/user/registration-status');
  };

  const handleGoToHome = () => {
    router.push('/recommendation-collections');
  };

  if (!registrationType) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const TypeIcon = registrationType === 'institute' ? Building2 : Building;
  const typeColor = registrationType === 'institute' ? 'blue' : 'purple';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${registrationType === 'institute'
      ? 'from-blue-50 to-indigo-100'
      : 'from-purple-50 to-pink-100'
      } py-12`}>
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center">
          <CardContent className="p-12">
            {/* Success Icon */}
            <div className={`p-4 ${registrationType === 'institute' ? 'bg-blue-100' : 'bg-purple-100'
              } rounded-full w-fit mx-auto mb-6`}>
              <CheckCircle className={`h-12 w-12 ${registrationType === 'institute' ? 'text-blue-600' : 'text-purple-600'
                }`} />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Registration Submitted Successfully!
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Your {registrationType} registration application has been submitted and is now under review.
            </p>

            {/* Registration Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`p-2 ${registrationType === 'institute' ? 'bg-blue-100' : 'bg-purple-100'
                  } rounded-lg`}>
                  <TypeIcon className={`h-5 w-5 ${registrationType === 'institute' ? 'text-blue-600' : 'text-purple-600'
                    }`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {registrationType} Registration
                </h3>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Status: Under Review</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>You'll receive email updates about your application</span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="text-left bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Admin Review</p>
                    <p className="text-gray-600">Our team will review your application within 2-3 business days</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Decision Notification</p>
                    <p className="text-gray-600">You'll receive an email with the decision and next steps</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Account Activation</p>
                    <p className="text-gray-600">
                      If approved, you'll either get free access or be asked to complete payment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGoToDashboard}
                className={`${registrationType === 'institute'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-purple-600 hover:bg-purple-700'
                  } text-white`}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Track Application Status
              </Button>

              <Button
                onClick={handleGoToHome}
                variant="outline"
              >
                Go to Dashboard
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Keep an eye on your email for updates.
                You can also track your application status anytime from your dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RegistrationSuccessContent />
    </Suspense>
  );
}
