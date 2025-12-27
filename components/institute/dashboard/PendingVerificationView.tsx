"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, FileText, ArrowRight, Building2, Calendar, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { RegistrationIntent } from "@/lib/types/institute.types";

interface PendingVerificationViewProps {
  intent?: RegistrationIntent;
}

export function PendingVerificationView({ intent }: PendingVerificationViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center px-4">
      <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Clock className="h-12 w-12 text-yellow-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Verification Pending</h1>
      <p className="text-gray-600 text-lg mb-8 max-w-lg">
        Thank you for registering <span className="font-semibold text-gray-900">{intent?.organizationName || "your institute"}</span>. Your application is currently under review by our administration team.
      </p>

      {intent && (
        <Card className="w-full border-slate-200 shadow-sm mb-8 text-left bg-white overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Application Details
                </h3>
                <span className="text-xs font-medium px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
                    Under Review
                </span>
            </div>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{intent.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{intent.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Applied: {new Date(intent.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>Ref ID: <span className="font-mono text-xs">{intent.id.slice(-8).toUpperCase()}</span></span>
                    </div>
                </div>
                
                {intent.description && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 line-clamp-2">
                            <span className="font-medium text-gray-700">Description: </span>
                            {intent.description}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
      )}

      <Card className="w-full border-yellow-200 bg-yellow-50/50 mb-8 text-left">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-yellow-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Verification Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Registration details submitted</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Documents uploaded</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-5 w-5 rounded-full border-2 border-yellow-600 flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-600 animate-pulse" />
              </div>
              <span className="font-medium text-yellow-800">Admin Verification in progress</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-8 w-full max-w-lg">
        <p className="font-medium">What happens next?</p>
        <p className="mt-1">Our team typically reviews applications within 24-48 hours. You will receive an email notification once your institute profile is approved.</p>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Check Status Again
        </Button>
        <Link href="/contact-support">
           <Button variant="ghost" className="text-gray-500 hover:text-gray-900">
            Contact Support
           </Button>
        </Link>
      </div>
    </div>
  );
}
