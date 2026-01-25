"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { reviewRegistrationIntent } from "@/lib/redux/slices/adminSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RegistrationReviewDialogProps {
  intent: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RegistrationReviewDialog({
  intent,
  open,
  onOpenChange,
  onSuccess,
}: RegistrationReviewDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [reviewAction, setReviewAction] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [grantDurationMonths, setGrantDurationMonths] = useState<number>(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log(intent);
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setReviewAction("");
      setAdminNotes("");
      setSubscriptionPlan("");
      setError(null);
    }
  }, [open]);

  const publicProfileId =
    intent?.personalDetails?.publicProfileId || intent?.publicProfileId;
  const publicProfileUrl = publicProfileId
    ? `https://careerbox.in/profile/${publicProfileId}`
    : null;

  // Normalize website (remove backticks/spaces, ensure protocol)
  const rawWebsite = intent?.website ?? intent?.personalDetails?.website;
  const safeWebsite =
    typeof rawWebsite === "string"
      ? rawWebsite.toString().replace(/`/g, "").trim()
      : "";
  const websiteUrl = safeWebsite
    ? safeWebsite.startsWith("http")
      ? safeWebsite
      : `https://${safeWebsite}`
    : "";

  if (!intent) return null;

  const handleReview = async () => {
    if (!reviewAction) return;

    // Validate subscription plan is selected when approving
    if (reviewAction === "approve" && !subscriptionPlan) {
      setError("Please select a subscription plan to grant");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await dispatch(
        reviewRegistrationIntent({
          intentId: intent.id,
          action: reviewAction as any,
          adminNotes,
          subscriptionPlan: subscriptionPlan || undefined,
          durationMonths: grantDurationMonths,
        })
      ).unwrap();

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Review failed:", error);
      setError(
        typeof error === "string"
          ? error
          : error?.message || "Failed to update registration status"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      payment_required: {
        color: "bg-blue-100 text-blue-800",
        icon: CreditCard,
      },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Registration Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* User Details */}
          <div className="grid grid-cols-2 gap-4">
            {intent?.type === "institute" ? (
              <>
                <div>
                  <Label className="text-sm font-medium">Contact Person</Label>
                  <p className="text-sm text-gray-600">{intent.contactName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600 break-all">{intent.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-gray-600">{intent.contactPhone}</p>
                </div>
                {websiteUrl && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Website</Label>
                    <div className="mt-1">
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline break-all"
                      >
                        {safeWebsite}
                      </a>
                    </div>
                  </div>
                )}
                {publicProfileUrl && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Public Profile</Label>
                    <div className="mt-1">
                      <a
                        href={publicProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline break-all"
                      >
                        {publicProfileUrl}
                      </a>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-gray-600">
                    {intent.personalDetails?.firstName}{" "}
                    {intent.personalDetails?.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Headline</Label>
                  <p className="text-sm text-gray-600">
                    {intent.personalDetails?.professionalHeadline}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">City</Label>
                  <p className="text-sm text-gray-600">
                    {intent.personalDetails?.city}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-gray-600">
                    {intent.personalDetails?.phone}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">About</Label>
                  <p className="text-sm text-gray-600">
                    {intent.personalDetails?.aboutMe}
                  </p>
                </div>
                {publicProfileUrl && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Public Profile</Label>
                    <div className="mt-1">
                      <a
                        href={publicProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline break-all"
                      >
                        {publicProfileUrl}
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Organization Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Organization Name</Label>
              <p className="text-sm text-gray-600">{intent.organizationName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <p className="text-sm text-gray-600 capitalize">{intent.type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Current Status</Label>
              <div className="mt-1">{getStatusBadge(intent.status)}</div>
            </div>
            {(intent.address || intent.city || intent.state || intent.country || intent.zipCode) && (
              <div className="col-span-2">
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm text-gray-600 break-words">
                  {[intent.address, intent.city, intent.state, intent.country]
                    .filter(Boolean)
                    .join(", ")}
                  {intent.zipCode ? ` - ${intent.zipCode}` : ""}
                </p>
              </div>
            )}
            {intent.establishmentYear && (
              <div>
                <Label className="text-sm font-medium">Establishment Year</Label>
                <p className="text-sm text-gray-600">{intent.establishmentYear}</p>
              </div>
            )}
            {intent.createdAt && (
              <div>
                <Label className="text-sm font-medium">Applied On</Label>
                <p className="text-sm text-gray-600">
                  {new Date(intent.createdAt).toLocaleString()}
                </p>
              </div>
            )}
            {intent.updatedAt && (
              <div>
                <Label className="text-sm font-medium">Last Updated</Label>
                <p className="text-sm text-gray-600">
                  {new Date(intent.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Review Action */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Update Status
            </h4>
            <div>
              <Label className="mb-3 block">New Status *</Label>
              <RadioGroup value={reviewAction} onValueChange={setReviewAction}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-md border border-gray-200 hover:bg-white transition-colors">
                    <RadioGroupItem value="approve" id="approve" />
                    <Label
                      htmlFor="approve"
                      className="flex items-center gap-2 text-green-600 font-medium cursor-pointer flex-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve (Active)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-md border border-gray-200 hover:bg-white transition-colors">
                    <RadioGroupItem value="reject" id="reject" />
                    <Label
                      htmlFor="reject"
                      className="flex items-center gap-2 text-red-600 font-medium cursor-pointer flex-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject (Failed)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-md border border-gray-200 hover:bg-white transition-colors">
                    <RadioGroupItem value="pending" id="pending" />
                    <Label
                      htmlFor="pending"
                      className="flex items-center gap-2 text-yellow-600 font-medium cursor-pointer flex-1"
                    >
                      <Clock className="h-4 w-4" />
                      Mark as Pending (Under Review)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-md border border-gray-200 hover:bg-white transition-colors">
                    <RadioGroupItem
                      value="require_payment"
                      id="require_payment"
                    />
                    <Label
                      htmlFor="require_payment"
                      className="flex items-center gap-2 text-blue-600 font-medium cursor-pointer flex-1"
                    >
                      <CreditCard className="h-4 w-4" />
                      Require Payment
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Warning for status reversal */}
            {intent.status === "completed" &&
              (reviewAction === "reject" || reviewAction === "pending") && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning: Deactivating Account</AlertTitle>
                  <AlertDescription>
                    Changing status from <strong>Completed</strong> to{" "}
                    <strong>
                      {reviewAction === "pending" ? "Pending" : "Rejected"}
                    </strong>{" "}
                    will immediately deactivate the user&apos;s dashboard access
                    and set their institute status to{" "}
                    {reviewAction === "pending" ? "Under Review" : "Inactive"}.
                  </AlertDescription>
                </Alert>
              )}

            {reviewAction === "approve" && (
              <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                <Label className="mb-3 block">Grant Subscription Plan *</Label>
                <RadioGroup
                  value={subscriptionPlan}
                  onValueChange={setSubscriptionPlan}
                >
                  <div className="space-y-3">
                    <div
                      className={`flex items-start space-x-3 p-3 rounded-md border ${
                        !subscriptionPlan && error
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:bg-white"
                      } transition-colors`}
                    >
                      <RadioGroupItem value="free" id="free" className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor="free"
                          className="font-medium cursor-pointer block"
                        >
                          Free Plan (Basic Access)
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Dashboard access with masked student lead contact info
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start space-x-3 p-3 rounded-md border ${
                        !subscriptionPlan && error
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:bg-white"
                      } transition-colors`}
                    >
                      <RadioGroupItem
                        value="premium"
                        id="premium"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="premium"
                          className="font-medium cursor-pointer block"
                        >
                          Premium Plan (Full Access - Leads Unmasked)
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Full access with unmasked leads and all features
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
                <div className="mt-4">
                  <Label className="mb-2 block">Grant Duration</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={grantDurationMonths === 3 ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setGrantDurationMonths(3)}
                    >
                      3 months
                    </Button>
                    <Button
                      variant={grantDurationMonths === 6 ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setGrantDurationMonths(6)}
                    >
                      6 months
                    </Button>
                    <Button
                      variant={grantDurationMonths === 12 ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setGrantDurationMonths(12)}
                    >
                      12 months
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {reviewAction === "require_payment" && (
              <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                <Label className="mb-3 block">
                  Plan to Unlock After Payment
                </Label>
                <RadioGroup
                  value={subscriptionPlan}
                  onValueChange={setSubscriptionPlan}
                >
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 rounded-md border border-gray-200 hover:bg-white transition-colors">
                      <RadioGroupItem
                        value="premium"
                        id="premium-payment"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="premium-payment"
                          className="font-medium cursor-pointer block"
                        >
                          Premium Plan
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          User will be prompted to pay for the selected plan to
                          activate their account
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div>
            <Label>
              {reviewAction === "reject"
                ? "Reason for Rejection *"
                : "Admin Notes"}
            </Label>
            <Textarea
              placeholder={
                reviewAction === "reject"
                  ? "Please explain clearly why the application was rejected. This will be shown to the user."
                  : "Internal notes or feedback for the user..."
              }
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="min-h-[100px] mt-2"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={!reviewAction || isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
