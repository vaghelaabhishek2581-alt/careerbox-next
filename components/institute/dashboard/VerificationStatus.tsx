"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

// Mock verification state - In a real app, this would come from your backend/Redux
type VerificationState = 'pending' | 'verified' | 'rejected';

const verificationStatus: {
  status: VerificationState;
  message?: string;
  issues?: string[];
} = {
  status: 'rejected', // Change this to 'pending' or 'verified' to see other states
  message: "Action Required: Profile Verification Returned",
  issues: [
    "Institute accreditation document is blurred or unreadable.",
    "The contact number provided does not match the official records.",
    "Please update the high-resolution logo for better visibility."
  ]
};

export function VerificationStatus() {
  if (verificationStatus.status === 'verified') {
    return null; // Or show a small badge somewhere else
  }

  return (
    <Card className={`border-l-4 shadow-sm ${
      verificationStatus.status === 'rejected' 
        ? "border-l-red-500 bg-red-50/50 border-t-slate-200 border-r-slate-200 border-b-slate-200" 
        : "border-l-yellow-500 bg-yellow-50/50 border-t-slate-200 border-r-slate-200 border-b-slate-200"
    }`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {verificationStatus.status === 'rejected' ? (
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className={`font-bold text-base ${
              verificationStatus.status === 'rejected' ? "text-red-900" : "text-yellow-900"
            }`}>
              {verificationStatus.status === 'rejected' 
                ? "Verification Failed: Corrections Needed" 
                : "Verification Pending"}
            </h3>
            
            <p className={`text-sm mt-1 ${
              verificationStatus.status === 'rejected' ? "text-red-700" : "text-yellow-700"
            }`}>
              {verificationStatus.message || "Your profile is currently under review by our admin team. This process usually takes 24-48 hours."}
            </p>

            {verificationStatus.status === 'rejected' && verificationStatus.issues && (
              <div className="mt-3 bg-white/60 rounded-lg p-3 border border-red-100">
                <p className="text-xs font-semibold text-red-800 mb-2 uppercase tracking-wide">Admin Feedback:</p>
                <ul className="space-y-1.5">
                  {verificationStatus.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {verificationStatus.status === 'rejected' && (
              <div className="mt-4">
                 <Link href="/institute/profile">
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700 h-9 text-xs">
                    Fix Issues Now
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
