"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Crown,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Users,
  Building2,
} from "lucide-react";
import apiClient from "@/lib/api/client";

interface SubscriptionInfo {
  planType: "free" | "basic" | "premium" | "enterprise";
  planName: string;
  status: string;
  startDate?: string | Date;
  endDate?: string | Date;
  isPaidPlan: boolean;
  features?: {
    leadsUnmasked?: boolean;
    prioritySupport?: boolean;
    analyticsAccess?: boolean;
    customBranding?: boolean;
  };
}

export default function BillingOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null,
  );
  const [cycle, setCycle] = useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/institute/profile");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load subscription");
        }
        setSubscription(data.subscription);
      } catch (e: any) {
        setError(e.message || "Failed to load subscription");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof (window as any).Razorpay !== "undefined") {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    loadRazorpayScript().catch(() => {});
  }, []);

  const handlePayment = async (
    planType: "BUSINESS" | "INSTITUTE" | "STUDENT_PREMIUM",
    billingCycle: "MONTHLY" | "QUARTERLY" | "YEARLY",
  ) => {
    setIsPaying(true);
    setPayError(null);
    try {
      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        throw new Error("Failed to load Razorpay");
      }
      const response = await apiClient.post("/api/payment/create-order", {
        planType,
        billingCycle,
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to create payment order");
      }
      const options = {
        key: (response.data as any).key,
        amount: (response.data as any).amount,
        currency: (response.data as any).currency,
        name: "CareerBox",
        description: planType === "INSTITUTE" ? "Premium" : "Subscription",
        order_id: (response.data as any).orderId,
        handler: async function (paymentResponse: any) {
          try {
            const verifyResponse = await apiClient.post("/api/payment/verify", {
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });
            if (verifyResponse.success) {
              const res = await fetch("/api/institute/profile");
              const data = await res.json();
              setSubscription(data.subscription);
            } else {
              throw new Error(
                verifyResponse.error || "Payment verification failed",
              );
            }
          } catch (e: any) {
            setPayError(e?.message || "Payment verification failed");
          } finally {
            setIsPaying(false);
          }
        },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
          },
        },
      } as any;
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (e: any) {
      setPayError(e?.message || "Payment failed");
      setIsPaying(false);
    }
  };

  const featureList = useMemo(() => {
    const features = [
      {
        label: "Unmasked leads",
        enabled: !!subscription?.features?.leadsUnmasked,
      },
      {
        label: "Priority support",
        enabled: !!subscription?.features?.prioritySupport,
      },
      {
        label: "Analytics access",
        enabled: !!subscription?.features?.analyticsAccess,
      },
      {
        label: "Custom branding",
        enabled: !!subscription?.features?.customBranding,
      },
    ];
    return features;
  }, [subscription]);

  const plans = useMemo(() => {
    return [
      {
        id: "FREE",
        name: "Free Plan",
        price: "₹0",
        cycle: "Lifetime",
        icon: ShieldCheck,
        features: [
          "List courses",
          "Collect leads (masked contacts)",
          "Basic institute page",
          "Email support",
        ],
        action: () => {},
        cta: "Current",
        disabled: true,
      },
      {
        id: "INSTITUTE_YEARLY",
        name: "Premium",
        price: "₹49,999/yr",
        cycle: "Yearly",
        icon: Crown,
        features: [
          "Unmasked leads",
          "Advanced analytics",
          "Priority support",
          "Custom branding",
          "Bulk operations",
        ],
        action: () =>
          handlePayment("INSTITUTE", cycle === "YEARLY" ? "YEARLY" : "MONTHLY"),
        cta: subscription?.isPaidPlan ? "Current" : "Upgrade",
      },
      {
        id: "ENTERPRISE",
        name: "Enterprise",
        price: "Contact Sales",
        cycle: "Yearly",
        icon: TrendingUp,
        features: [
          "All Premium features",
          "API access",
          "White-label options",
          "Dedicated success manager",
          "Custom SLAs",
        ],
        action: () =>
          window.open(
            "mailto:sales@careerbox.app?subject=Enterprise%20Plan%20Inquiry",
          ),
        cta: "Contact Sales",
      },
    ];
  }, [cycle, subscription]);

  return (
    <div className="space-y-6">
      <div className="sticky top-[80px] z-30 bg-white backdrop-blur-sm px-4 sm:px-6 -mx-4 sm:-mx-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between py-2 transition-all duration-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Subscriptions
          </h1>
          <p className="hidden md:block text-sm text-gray-500 mt-1">
            Manage your plan, billing cycle, and payments
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <Link href="/institute/billing">
            <Button>Billing & Payments</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border p-8 text-center text-gray-600">
          Loading subscription...
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 rounded-2xl border border-red-200 p-4">
          {error}
        </div>
      ) : (
        <>
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Plan</span>
                {subscription?.isPaidPlan ? (
                  <Badge
                    className="bg-green-100 text-green-800"
                    variant="secondary"
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge
                    className="bg-slate-100 text-slate-800"
                    variant="secondary"
                  >
                    Free
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="text-xs text-gray-500">Plan</div>
                  <div className="text-lg font-semibold">
                    {subscription?.planName || "Free Plan"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="text-lg font-semibold capitalize">
                    {subscription?.status || "active"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="text-xs text-gray-500">Validity</div>
                  <div className="text-lg font-semibold">
                    {subscription?.startDate
                      ? new Date(subscription.startDate).toLocaleDateString()
                      : "—"}{" "}
                    →{" "}
                    {subscription?.endDate
                      ? new Date(subscription.endDate).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {featureList.map((f, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-sm ${f.enabled ? "text-gray-900" : "text-gray-400"}`}
                  >
                    <Check
                      className={`h-4 w-4 ${f.enabled ? "text-green-600" : "text-gray-300"}`}
                    />
                    {f.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Available Plans
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={cycle === "MONTHLY" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setCycle("MONTHLY")}
              >
                Monthly
              </Button>
              <Button
                variant={cycle === "YEARLY" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setCycle("YEARLY")}
              >
                Yearly
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const Icon = p.icon;
              return (
                <Card
                  key={p.id}
                  className={`rounded-2xl border shadow-sm ${p.id === "INSTITUTE_YEARLY" ? "ring-2 ring-blue-500" : ""}`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {p.name}
                      </div>
                      <span className="text-sm text-gray-600">{p.price}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {p.features.map((f, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <Check className="h-4 w-4 text-green-600" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant="default"
                      onClick={p.action}
                      disabled={isPaying || p.cta === "Current"}
                    >
                      {p.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {payError && (
            <div className="bg-red-50 text-red-700 rounded-2xl border border-red-200 p-4">
              {payError}
            </div>
          )}

          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Student Leads</div>
                    <div className="font-semibold">
                      Unlock full contact details on Premium
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-500">Institute Page</div>
                    <div className="font-semibold">
                      Custom branding with Premium
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-500">Billing</div>
                    <div className="font-semibold">
                      Secure payments via Razorpay
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
