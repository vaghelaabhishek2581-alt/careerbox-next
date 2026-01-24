import { useEffect, useState } from "react";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Crown, Zap, Star, AlertCircle } from "lucide-react";
import { SubscriptionPlan } from "@/lib/types/subscription.types";
import { downloadInvoicePdf } from "@/lib/pdf/invoice";
import { SELLER_DETAILS } from "@/lib/billing/invoice";

export default function SubscriptionManagement() {
  const {
    currentSubscription,
    availablePlans,
    billingHistory,
    usageStats,
    loading,
    getCurrentSubscription,
    getAvailablePlans,
    getBillingHistory,
    getUsageStats,
    updateSubscription,
    cancelSubscription,
  } = useSubscriptions();

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const handleDownloadInvoice = async (bill: any) => {
    await downloadInvoicePdf({
      id: bill.invoiceId || bill.id,
      date: bill.invoiceDate,
      dueDate: bill.dueDate,
      plan: bill.planName,
      cycle: bill.interval,
      method:
        bill.paymentMethod === "UPI"
          ? "upi"
          : bill.paymentMethod === "Card"
            ? "card"
            : undefined,
      transactionId: bill.transactionId || bill.orderId,
      seller: SELLER_DETAILS,
      buyer: {
        name: bill.billingSnapshot?.organizationName || "Business",
        addressLine1: bill.billingSnapshot?.addressLine1 || "",
        addressLine2: bill.billingSnapshot?.addressLine2 || "",
        country: bill.billingSnapshot?.country || "India",
        gstin: bill.billingSnapshot?.gstin,
        state: bill.billingSnapshot?.state,
        email: bill.billingSnapshot?.email,
      },
      lineItems: [
        {
          description: `${bill.planName || "Subscription"} (${bill.interval || "yearly"})`,
          qty: 1,
          unitPrice: Number(bill.subtotal ?? bill.amount),
          sac: "9983",
        },
      ],
    });
  };

  useEffect(() => {
    getCurrentSubscription();
    getAvailablePlans();
    getBillingHistory();
    getUsageStats();
  }, [
    getCurrentSubscription,
    getAvailablePlans,
    getBillingHistory,
    getUsageStats,
  ]);

  const handleUpgrade = async () => {
    if (!currentSubscription || !selectedPlan) return;

    try {
      await updateSubscription(currentSubscription.id, { plan: selectedPlan });
      setUpgradeDialogOpen(false);
      getCurrentSubscription();
    } catch (error) {
      console.error("Failed to upgrade subscription:", error);
    }
  };

  const handleCancel = async () => {
    if (!currentSubscription) return;

    try {
      await cancelSubscription(currentSubscription.id);
      setCancelDialogOpen(false);
      getCurrentSubscription();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    }
  };

  const getPlanIcon = (planId: string) => {
    if (planId.includes("pro")) return <Crown className="h-5 w-5" />;
    if (planId.includes("basic")) return <Zap className="h-5 w-5" />;
    return <Star className="h-5 w-5" />;
  };

  const getPlanColor = (planId: string) => {
    if (planId.includes("pro")) return "text-purple-600";
    if (planId.includes("basic")) return "text-blue-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        Loading subscription...
      </div>
    );
  }

  if (!currentSubscription) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No active subscription
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Subscribe to access business features.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscription Management</h2>
        <Badge variant="outline" className="flex items-center gap-1">
          {getPlanIcon(currentSubscription.plan)}
          <span className={getPlanColor(currentSubscription.plan)}>
            {currentSubscription.plan.replace("_", " ").toUpperCase()}
          </span>
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Your active subscription details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPlanIcon(currentSubscription.plan)}
                    <span className="font-medium">
                      {currentSubscription.plan.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <Badge
                    variant={
                      currentSubscription.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {currentSubscription.status}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  ${currentSubscription.billingInfo.amount}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{currentSubscription.billingInfo.interval}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Next billing:{" "}
                  {new Date(
                    currentSubscription.billingInfo.nextBillingDate,
                  ).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={upgradeDialogOpen}
                    onOpenChange={setUpgradeDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Upgrade Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upgrade Subscription</DialogTitle>
                        <DialogDescription>
                          Choose a new plan to upgrade your subscription.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select
                          value={selectedPlan}
                          onValueChange={setSelectedPlan}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePlans
                              .filter(
                                (plan) => plan.id !== currentSubscription.plan,
                              )
                              .map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.name} - ${plan.price.monthly}/month
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setUpgradeDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpgrade}
                          disabled={!selectedPlan}
                        >
                          Upgrade
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={cancelDialogOpen}
                    onOpenChange={setCancelDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Cancel Subscription
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel your subscription? You
                          will lose access to business features.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setCancelDialogOpen(false)}
                        >
                          Keep Subscription
                        </Button>
                        <Button variant="destructive" onClick={handleCancel}>
                          Cancel Subscription
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Features</CardTitle>
                <CardDescription>
                  What's included in your current plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentSubscription.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {availablePlans.map((plan) => (
              <Card
                key={plan.id}
                className={plan.popular ? "ring-2 ring-primary" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(plan.id)}
                      <CardTitle className={getPlanColor(plan.id)}>
                        {plan.name}
                      </CardTitle>
                    </div>
                    {plan.popular && <Badge variant="default">Popular</Badge>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    ${plan.price.monthly}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={
                      plan.id === currentSubscription.plan
                        ? "outline"
                        : "default"
                    }
                    disabled={plan.id === currentSubscription.plan}
                  >
                    {plan.id === currentSubscription.plan
                      ? "Current Plan"
                      : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                Your recent payments and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((bill) => (
                  <div
                    key={bill.invoiceId || bill.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        ${bill.amount} {bill.currency}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(bill.invoiceDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          bill.status === "paid" ? "default" : "secondary"
                        }
                      >
                        {bill.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(bill)}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
                {billingHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No billing history available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>
                Your current usage against plan limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usageStats ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Job Posts</span>
                        <span>
                          {usageStats.jobPosts} /{" "}
                          {currentSubscription.limits.jobPosts === -1
                            ? "∞"
                            : (currentSubscription.limits.jobPosts ?? 0)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${currentSubscription.limits.jobPosts === -1 ? 0 : (usageStats.jobPosts / (currentSubscription.limits.jobPosts ?? 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Exam Posts</span>
                        <span>
                          {usageStats.examPosts} /{" "}
                          {currentSubscription.limits.examPosts === -1
                            ? "∞"
                            : (currentSubscription.limits.examPosts ?? 0)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${currentSubscription.limits.examPosts === -1 ? 0 : (usageStats.examPosts / (currentSubscription.limits.examPosts ?? 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Applicant Views</span>
                        <span>
                          {usageStats.applicantViews} /{" "}
                          {currentSubscription.limits.applicantViews === -1
                            ? "∞"
                            : (currentSubscription.limits.applicantViews ?? 0)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${currentSubscription.limits.applicantViews === -1 ? 0 : (usageStats.applicantViews / (currentSubscription.limits.applicantViews ?? 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Analytics Access</span>
                        <span>
                          {usageStats.analyticsAccess ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No usage statistics available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
