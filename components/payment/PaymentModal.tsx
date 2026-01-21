"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Check,
  CreditCard,
  Smartphone,
  Building,
  GraduationCap,
  Crown,
  Loader2,
  AlertCircle
} from "lucide-react";
import { PAYMENT_PLANS } from "@/lib/payment/plans";
import apiClient from "@/lib/api/client";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'BUSINESS' | 'INSTITUTE' | 'STUDENT_PREMIUM';
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  discountCode?: string;
  onSuccess: (subscription: any) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  planType,
  billingCycle,
  discountCode,
  onSuccess
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [code, setCode] = useState<string>(discountCode || '');
  const billingInfo = {
    organization: 'CareerBox Institute',
    gstin: '29ABCDE1234F1Z5',
    address: '2nd Floor, MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    zip: '560001',
    country: 'India'
  };
  const savedMethods = [
    { id: 'pm_card_2891', type: 'card', brand: 'Visa', last4: '2891', default: true },
    { id: 'pm_upi_razorpay', type: 'upi', handle: 'careerbox@upi', default: false },
    { id: 'pm_net_hdfc', type: 'netbanking', bank: 'HDFC', default: true }
  ] as const;

  const plan = PAYMENT_PLANS[planType][billingCycle];


  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (typeof (window as any).Razorpay !== 'undefined') {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Preload Razorpay script when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript().catch(console.error);
    }
  }, [isOpen]);
  const savings = planType === 'BUSINESS' && billingCycle === 'YEARLY' ? 6000 :
    planType === 'INSTITUTE' && billingCycle === 'YEARLY' ? 10000 :
      planType === 'STUDENT_PREMIUM' && billingCycle === 'YEARLY' ? 600 : 0;

  const discountedAmount = (() => {
    const amount = plan.amount;
    const applied = (code || '').toUpperCase().trim();
    let off = 0;
    if (applied === 'SAVE10') off = Math.floor(amount * 0.10);
    else if (applied === 'INSTITUTE20' && planType === 'INSTITUTE') off = Math.floor(amount * 0.20);
    else if (applied === 'WELCOME500') off = 500 * 100;
    return Math.max(0, amount - off);
  })();

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load Razorpay script first
      const isRazorpayLoaded = await loadRazorpayScript();

      if (!isRazorpayLoaded) {
        throw new Error('Failed to load Razorpay. Please check your internet connection and try again.');
      }

      // Create payment order
      const response = await apiClient.post('/api/payment/create-order', {
        planType,
        billingCycle,
        discountCode: code || undefined
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create payment order');
      }

      // Initialize Razorpay
      const options = {
        key: (response.data as any).key,
        amount: (response.data as any).amount,
        currency: (response.data as any).currency,
        name: 'CareerBox',
        description: plan.name,
        order_id: (response.data as any).orderId,
        handler: async function (paymentResponse: any) {
          try {
            // Verify payment
            const verifyResponse = await apiClient.post('/api/payment/verify', {
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });

            if (verifyResponse.success) {
              onSuccess((verifyResponse.data as any).subscription);
              onClose();
            } else {
              throw new Error(verifyResponse.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'User Name', // This would come from user session
          email: 'user@example.com', // This would come from user session
        },
        notes: {
          planType,
          billingCycle,
          discountCode: code || ''
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = () => {
    switch (planType) {
      case 'BUSINESS':
        return <Building className="h-6 w-6" />;
      case 'INSTITUTE':
        return <GraduationCap className="h-6 w-6" />;
      case 'STUDENT_PREMIUM':
        return <Crown className="h-6 w-6" />;
      default:
        return <Crown className="h-6 w-6" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'upi':
        return <Smartphone className="h-5 w-5" />;
      case 'netbanking':
        return <Building className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="md:max-w-4xl w-[95vw] rounded-2xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-left">
            {getPlanIcon()}
            Complete Your Subscription
          </DialogTitle>
          <DialogDescription className="text-left">
            Secure payment powered by Razorpay.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {savings > 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Save ₹{savings}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Plan Duration</span>
                      <span className="font-medium capitalize">{billingCycle.toLowerCase()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Billing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Organization</div>
                      <div className="text-sm font-medium">{billingInfo.organization}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">GSTIN</div>
                      <div className="text-sm font-medium">{billingInfo.gstin}</div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <div className="text-xs text-muted-foreground">Address</div>
                      <div className="text-sm font-medium">{billingInfo.address}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">City</div>
                      <div className="text-sm font-medium">{billingInfo.city}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">State</div>
                      <div className="text-sm font-medium">{billingInfo.state}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Postal Code</div>
                      <div className="text-sm font-medium">{billingInfo.zip}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Country</div>
                      <div className="text-sm font-medium">{billingInfo.country}</div>
                    </div>
                  </div>
                  <div>
                    <Link href="/institute/billing/info">
                      <Button variant="outline" size="sm">Update Billing Info</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'card', label: 'Card', description: 'Credit/Debit Card' },
                      { id: 'upi', label: 'UPI', description: 'PhonePe, Google Pay' },
                      { id: 'netbanking', label: 'Net Banking', description: 'All Major Banks' }
                    ].map((method) => (
                      <Button
                        key={method.id}
                        variant={paymentMethod === method.id ? 'default' : 'outline'}
                        className="flex flex-col items-center gap-2 h-auto p-4"
                        onClick={() => setPaymentMethod(method.id as any)}
                      >
                        {getPaymentMethodIcon(method.id)}
                        <div className="text-center">
                          <div className="font-medium">{method.label}</div>
                          <div className="text-xs text-muted-foreground">{method.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Saved Methods</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Manage your saved methods</div>
                        <Link href="/institute/billing/payment-methods">
                          <Button variant="outline" size="sm">Update</Button>
                        </Link>
                      </div>
                      {(() => {
                        const fm = savedMethods.filter((m: any) => m.type === paymentMethod);
                        const dm = fm.find((m: any) => m.default);
                        return (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Default</div>
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">
                                  {dm
                                    ? dm.type === 'card'
                                      ? `${(dm as any).brand} •••• ${(dm as any).last4}`
                                      : dm.type === 'upi'
                                      ? `UPI • ${(dm as any).handle}`
                                      : `NetBanking • ${(dm as any).bank}`
                                    : 'No default set'}
                                </div>
                                {dm && <Badge variant="secondary">Default</Badge>}
                              </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">Saved {paymentMethod === 'card' ? 'Cards' : paymentMethod === 'upi' ? 'UPI Handles' : 'Banks'}</div>
                              {fm.length > 0 ? (
                                <div className="space-y-2">
                                  {fm.map((m: any) => (
                                    <div key={m.id} className="flex items-center justify-between p-2 border rounded-md">
                                      <div className="flex items-center gap-2 text-sm">
                                        {getPaymentMethodIcon(m.type)}
                                        <span className="font-medium">
                                          {m.type === 'card'
                                            ? `${m.brand} •••• ${m.last4}`
                                            : m.type === 'upi'
                                            ? `UPI • ${m.handle}`
                                            : `NetBanking • ${m.bank}`}
                                        </span>
                                      </div>
                                      {m.default && <Badge variant="outline">Default</Badge>}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground">No saved methods for this type</div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="text-2xl font-bold">₹{(discountedAmount / 100).toLocaleString()}</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex items-center justify-between text-green-600">
                        <span className="text-sm">You Save</span>
                        <span className="font-medium">₹{savings}</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Discount Code</span>
                      <div className="flex items-center gap-2">
                        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" />
                        <Badge variant="secondary" className="capitalize">{code ? 'applied' : 'optional'}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md mt-4">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              By proceeding, you agree to our Terms of Service and Privacy Policy
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ₹{(discountedAmount / 100).toLocaleString()}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
