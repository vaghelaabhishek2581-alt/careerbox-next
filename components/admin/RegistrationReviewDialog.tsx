"use client";

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { reviewRegistrationIntent } from '@/lib/redux/slices/adminSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RegistrationReviewDialogProps {
  intent: any; // Using any for now to match the slice type which might be complex to import
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RegistrationReviewDialog({ 
  intent, 
  open, 
  onOpenChange,
  onSuccess 
}: RegistrationReviewDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [reviewAction, setReviewAction] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setReviewAction('');
      setAdminNotes('');
      setSubscriptionPlan('');
    }
  }, [open]);

  if (!intent) return null;

  const handleReview = async () => {
    if (!reviewAction) return;

    setIsSubmitting(true);
    try {
      await dispatch(reviewRegistrationIntent({
        intentId: intent.id,
        action: reviewAction as any,
        adminNotes,
        subscriptionPlan: subscriptionPlan || undefined,
      })).unwrap();

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Review failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      payment_required: { color: 'bg-blue-100 text-blue-800', icon: CreditCard },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Registration Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
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
          </div>

          {/* Review Action */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Update Status
            </h4>
            
            <div>
              <Label className="mb-2 block">New Status *</Label>
              <Select value={reviewAction} onValueChange={setReviewAction}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve" className="text-green-600 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Approve (Active)
                    </div>
                  </SelectItem>
                  <SelectItem value="reject" className="text-red-600 font-medium">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Reject (Failed)
                    </div>
                  </SelectItem>
                  <SelectItem value="pending" className="text-yellow-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Mark as Pending (Under Review)
                    </div>
                  </SelectItem>
                  <SelectItem value="require_payment" className="text-blue-600 font-medium">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Require Payment
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Warning for status reversal */}
            {intent.status === 'completed' && (reviewAction === 'reject' || reviewAction === 'pending') && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning: Deactivating Account</AlertTitle>
                <AlertDescription>
                  Changing status from <strong>Completed</strong> to <strong>{reviewAction === 'pending' ? 'Pending' : 'Rejected'}</strong> will immediately deactivate the user's dashboard access and set their institute status to {reviewAction === 'pending' ? 'Under Review' : 'Inactive'}.
                </AlertDescription>
              </Alert>
            )}

            {reviewAction === 'approve' && intent.status !== 'approved' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <Label className="mb-2 block">Grant Subscription Plan</Label>
                <Select value={subscriptionPlan} onValueChange={setSubscriptionPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free Plan</SelectItem>
                    <SelectItem value="paid">Paid Plan (Premium)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  The user will immediately receive access to the dashboard with this plan.
                </p>
              </div>
            )}
          </div>

          <div>
            <Label>
              {reviewAction === 'reject' ? 'Reason for Rejection *' : 'Admin Notes'}
            </Label>
            <Textarea
              placeholder={reviewAction === 'reject' 
                ? "Please explain clearly why the application was rejected. This will be shown to the user." 
                : "Internal notes or feedback for the user..."
              }
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={!reviewAction || isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
