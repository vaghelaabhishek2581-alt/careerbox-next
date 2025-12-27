"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle, RefreshCw, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface VerificationFailedViewProps {
  reason?: string;
  onRetry?: () => void;
  onDelete?: () => void;
}

export function VerificationFailedView({ reason, onRetry, onDelete }: VerificationFailedViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center px-4">
      <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <XCircle className="h-12 w-12 text-red-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Verification Failed</h1>
      <p className="text-gray-600 text-lg mb-8 max-w-lg">
        Unfortunately, your institute registration could not be approved at this time.
      </p>

      <Card className="w-full border-red-200 bg-red-50/50 mb-8 text-left">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Reason for Rejection</h3>
              <p className="text-red-800 text-sm">
                {reason || "The documents provided were not clear or did not match the institute details. Please review your submission and try again."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <Link href="/institute/profile" className="w-full">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11">
            <RefreshCw className="h-4 w-4 mr-2" />
            Correct & Resubmit
          </Button>
        </Link>
        
        <Button 
          variant="outline" 
          className="w-full border-red-200 text-red-600 hover:bg-red-50 h-11"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete & Create New
        </Button>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Need help? <Link href="/support" className="text-blue-600 hover:underline">Contact our support team</Link>
      </p>
    </div>
  );
}
