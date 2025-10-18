"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchUserRegistrationIntents } from "@/lib/redux/slices/registrationSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  AlertCircle,
  Plus,
  FileText,
  Calendar,
  Mail,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: "Under Review",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Your registration is being reviewed by our admin team"
  },
  approved: {
    icon: CheckCircle,
    label: "Approved",
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Congratulations! Your registration has been approved"
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Your registration was not approved"
  },
  payment_required: {
    icon: CreditCard,
    label: "Payment Required",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Please complete payment to activate your account"
  },
  completed: {
    icon: CheckCircle,
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Your registration is complete and active"
  }
};

export default function RegistrationStatusPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { intents, loading, error } = useSelector((state: RootState) => state.registration);

  useEffect(() => {
    if (session) {
      dispatch(fetchUserRegistrationIntents());
    }
  }, [session, dispatch]);

  const handlePayment = (intentId: string) => {
    // TODO: Implement payment flow
    router.push(`/dashboard/user/payment/${intentId}`);
  };

  const handleNewRegistration = (type: 'institute' | 'business') => {
    router.push(`/dashboard/user/register-${type}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registration Status</h1>
          <p className="text-gray-600 mt-2">
            Track your institute and business registration applications
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => handleNewRegistration('institute')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Register Institute
          </Button>
          <Button 
            onClick={() => handleNewRegistration('business')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Building className="w-4 h-4 mr-2" />
            Register Business
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration Intents */}
      {intents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registration Applications</h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted any registration applications yet. Get started by registering your institute or business.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => handleNewRegistration('institute')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Register Institute
              </Button>
              <Button 
                onClick={() => handleNewRegistration('business')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Building className="w-4 h-4 mr-2" />
                Register Business
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {intents.map((intent) => {
            const statusConfig = STATUS_CONFIG[intent.status as keyof typeof STATUS_CONFIG];
            const StatusIcon = statusConfig.icon;
            const TypeIcon = intent.type === 'institute' ? Building2 : Building;

            return (
              <Card key={intent.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        intent.type === 'institute' ? "bg-blue-100" : "bg-purple-100"
                      )}>
                        <TypeIcon className={cn(
                          "h-5 w-5",
                          intent.type === 'institute' ? "text-blue-600" : "text-purple-600"
                        )} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{intent.organizationName}</CardTitle>
                        <CardDescription className="capitalize">
                          {intent.type} Registration
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={statusConfig.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{statusConfig.description}</p>

                  <Separator />

                  {/* Application Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{intent.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{intent.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Applied: {new Date(intent.createdAt).toLocaleDateString()}</span>
                    </div>
                    {intent.reviewedAt && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Reviewed: {new Date(intent.reviewedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="text-sm text-gray-600">
                    <strong>Address:</strong> {intent.address}, {intent.city}, {intent.state}, {intent.country} - {intent.zipCode}
                  </div>

                  {/* Description */}
                  <div className="text-sm text-gray-600">
                    <strong>Description:</strong> {intent.description}
                  </div>

                  {/* Admin Notes */}
                  {intent.adminNotes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">Admin Notes:</p>
                      <p className="text-sm text-gray-600">{intent.adminNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    {intent.status === 'payment_required' && (
                      <Button 
                        onClick={() => handlePayment(intent.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Complete Payment
                      </Button>
                    )}
                    
                    {intent.status === 'approved' && (
                      <Button 
                        onClick={() => router.push(`/dashboard/${intent.type}`)}
                        className={cn(
                          "text-white",
                          intent.type === 'institute' 
                            ? "bg-blue-600 hover:bg-blue-700" 
                            : "bg-purple-600 hover:bg-purple-700"
                        )}
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Access Dashboard
                      </Button>
                    )}

                    {intent.status === 'completed' && (
                      <Button 
                        onClick={() => router.push(`/dashboard/${intent.type}`)}
                        className={cn(
                          "text-white",
                          intent.type === 'institute' 
                            ? "bg-blue-600 hover:bg-blue-700" 
                            : "bg-purple-600 hover:bg-purple-700"
                        )}
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    )}

                    {intent.status === 'rejected' && (
                      <Button 
                        onClick={() => handleNewRegistration(intent.type)}
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Apply Again
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
