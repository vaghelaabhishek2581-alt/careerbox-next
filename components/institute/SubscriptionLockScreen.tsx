"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Phone, AlertCircle } from "lucide-react";
import Link from "next/link";

interface SubscriptionLockScreenProps {
  instituteName?: string;
  subscriptionStatus?: string;
  grantReason?: string;
  planName?: string;
}

export function SubscriptionLockScreen({
  instituteName = "Your Institute",
  subscriptionStatus = "inactive",
  grantReason,
  planName,
}: SubscriptionLockScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 shadow-xl border-slate-200">
        <div className="text-center space-y-6">
          {/* Lock Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 rounded-full"></div>
              <div className="relative bg-red-50 p-6 rounded-full border-4 border-red-100">
                <Lock className="h-16 w-16 text-red-600" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Account Deactivated
            </h1>
            <p className="text-lg text-gray-600">
              {instituteName}
            </p>
          </div>

          {/* Alert Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-left space-y-1">
                <p className="font-semibold text-red-900">
                  Your subscription has been deactivated
                </p>
                <p className="text-sm text-red-700">
                  {grantReason || "Your account access has been suspended by the administrator."}
                </p>
                {planName && (
                  <p className="text-sm text-red-600 mt-2">
                    Previous Plan: <span className="font-medium">{planName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="text-gray-600 space-y-2">
            <p className="text-base">
              Your account is currently <span className="font-semibold text-red-600">{subscriptionStatus}</span>.
            </p>
            <p className="text-sm">
              Please contact our support team to resolve this issue and reactivate your account.
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            <Link href="mailto:support@careerbox.com" className="block">
              <Button
                variant="outline"
                className="w-full h-auto py-4 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Email Support</p>
                    <p className="text-xs text-gray-600">support@careerbox.com</p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="tel:+911234567890" className="block">
              <Button
                variant="outline"
                className="w-full h-auto py-4 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Call Support</p>
                    <p className="text-xs text-gray-600">+91 123 456 7890</p>
                  </div>
                </div>
              </Button>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="pt-6 border-t border-slate-200">
            <p className="text-sm text-gray-500">
              Need immediate assistance?{" "}
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium underline">
                Visit our contact page
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="pt-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
