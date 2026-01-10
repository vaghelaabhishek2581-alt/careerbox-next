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
import { formatDistanceToNow } from "date-fns";
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
    color: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Your registration is being reviewed by our admin team"
  },
  under_review: {
    icon: Clock,
    label: "Under Review",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Your registration is being reviewed by our admin team"
  },
  approved: {
    icon: CheckCircle,
    label: "Approved",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Congratulations! Your registration has been approved"
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    description: "Your registration was not approved"
  },
  payment_required: {
    icon: CreditCard,
    label: "Payment Required",
    color: "bg-sky-100 text-sky-800 border-sky-200",
    description: "Please complete payment to activate your account"
  },
  // completed removed in favor of approved
};

const STATUS_CARD_STYLES: Record<string, { card: string; label: string }> = {
  pending: { card: "bg-amber-50 border-amber-200", label: "text-amber-700" },
  under_review: { card: "bg-amber-50 border-amber-200", label: "text-amber-700" },
  approved: { card: "bg-emerald-50 border-emerald-200", label: "text-emerald-700" },
  rejected: { card: "bg-rose-50 border-rose-200", label: "text-rose-700" },
  payment_required: { card: "bg-sky-50 border-sky-200", label: "text-sky-700" },
  // completed removed in favor of approved
};

function normalizeStatus(status: string) {
  if (!status) return 'pending'
  if (status === 'completed') return 'approved'
  if (status === 'under_review' || status === 'under review') return 'pending'
  return status
}

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
    router.push(`/user/payment/${intentId}`);
  };

  const handleNewRegistration = (type: 'institute' | 'business') => {
    router.push(`/user/register-${type}`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registration Status</h1>
          <p className="text-gray-600 mt-2">
            Track your institute and business registration applications
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-2 md:hidden">
            <Button
              onClick={() => handleNewRegistration('institute')}
              variant="outline"
              size="icon"
              aria-label="Register Institute"
              title="Register Institute"
            >
              <Building2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleNewRegistration('business')}
              variant="outline"
              size="icon"
              aria-label="Register Business"
              title="Register Business"
            >
              <Building className="h-4 w-4" />
            </Button>
          </div>
          <div className="hidden md:flex gap-2">
            <Button
              onClick={() => handleNewRegistration('institute')}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Register Institute
            </Button>
            <Button
              onClick={() => handleNewRegistration('business')}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Building className="h-4 w-4 mr-2" />
              Register Business
            </Button>
          </div>
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

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-5 md:gap-4 no-scrollbar">
        <Card className="min-w-[160px] md:min-w-0 shadow-sm shrink-0 rounded-xl bg-white border-slate-200">
          <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
            <span className="text-sm font-medium text-gray-600">Total Applications</span>
            <span className="text-2xl font-bold text-gray-900">{intents.length}</span>
          </CardContent>
        </Card>
        {['pending', 'payment_required', 'approved', 'rejected'].map((status) => {
          const count = intents.filter((i: any) => {
            const s = normalizeStatus(i.status)
            if (status === 'approved') return s === 'approved'
            return s === status
          }).length;
          const style = STATUS_CARD_STYLES[status] || STATUS_CARD_STYLES.pending;
          const label =
            status === 'pending'
              ? 'Under Review'
              : status === 'payment_required'
              ? 'Payment Required'
              : status === 'rejected'
              ? 'Rejected'
              : 'Approved';
          return (
            <Card key={status} className={`min-w-[160px] md:min-w-0 shadow-sm shrink-0 rounded-xl ${style.card}`}>
              <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${style.label}`}>{label}</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{count}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {intents.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registration Applications</h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted any registration applications yet. Get started by registering your institute or business.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => handleNewRegistration('institute')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Register Institute
              </Button>
              <Button
                onClick={() => handleNewRegistration('business')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Building className="h-4 w-4 mr-2" />
                Register Business
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {intents.map((intent) => {
            const normalized = normalizeStatus(intent.status as string) as keyof typeof STATUS_CONFIG
            const statusConfig = STATUS_CONFIG[normalized];
            const StatusIcon = statusConfig.icon;
            const TypeIcon = intent.type === 'institute' ? Building2 : Building;

            return (
              <Card key={intent.id} className={`rounded-2xl border shadow-sm overflow-hidden ${STATUS_CARD_STYLES[normalized]?.card || ""}`}>
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
                  <p className="text-sm text-gray-700">{statusConfig.description}</p>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4" />
                      <span>{intent.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4" />
                      <span>{intent.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {formatDistanceToNow(new Date(intent.createdAt), { addSuffix: true })}</span>
                    </div>
                    {intent.reviewedAt && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4" />
                        <span>Reviewed {formatDistanceToNow(new Date(intent.reviewedAt), { addSuffix: true })}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Address:</span> {intent.address}, {intent.city}, {intent.state}, {intent.country} - {intent.zipCode}
                  </div>

                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Description:</span> {intent.description}
                  </div>

                  {intent.adminNotes && (
                    <div className="p-3 bg-white/60 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">Admin Notes</p>
                      <p className="text-sm text-gray-700">{intent.adminNotes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 flex-wrap">
                    {intent.status === 'payment_required' && (
                      <Button
                        onClick={() => handlePayment(intent.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
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
                        <Building2 className="h-4 w-4 mr-2" />
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
                        <Building2 className="h-4 w-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    )}

                    {intent.status === 'rejected' && (
                      <Button
                        onClick={() => handleNewRegistration(intent.type)}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
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
