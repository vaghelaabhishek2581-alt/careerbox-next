"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  FileText,
  MapPin,
  IndianRupee,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { RootState, AppDispatch } from "@/lib/redux/store";
import {
  fetchCurrentSubscription,
  fetchBillingHistory,
  exportBillingHistoryCsv,
} from "@/lib/redux/slices/subscriptionSlice";

export default function BillingClient() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentSubscription, billingHistory, loading } = useSelector(
    (s: RootState) => s.subscription,
  );

  useEffect(() => {
    dispatch(fetchCurrentSubscription());
    dispatch(fetchBillingHistory({ page: 1, limit: 20 }));
  }, [dispatch]);

  const startDate = currentSubscription
    ? new Date((currentSubscription as any).startDate)
    : null;
  const endDate = currentSubscription
    ? new Date((currentSubscription as any).endDate)
    : null;
  const now = new Date();
  const totalDays =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000),
        )
      : 1;
  const remainingDays = endDate
    ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / 86400000))
    : 0;
  const progress = Math.min(
    100,
    Math.max(0, Math.round(((totalDays - remainingDays) / totalDays) * 100)),
  );

  return (
    <div className="space-y-6">
      <div className="sticky top-[80px] z-30 bg-white backdrop-blur-sm px-4 sm:px-6 -mx-4 sm:-mx-6 mb-2 flex flex-col sm:flex-row sm:items-center justify-between py-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Billing & Payments
          </h1>
          <p className="hidden md:block text-sm text-gray-500 mt-1">
            Manage invoices, payment methods, and billing information
          </p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <Link href="/institute/subscription">
            <Button variant="outline">Manage Subscription</Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => dispatch(exportBillingHistoryCsv())}
          >
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Current Plan
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-blue-800">
              {(currentSubscription as any)?.planName || "—"} •{" "}
              {(currentSubscription as any)?.billingInfo?.interval || "Yearly"}
            </div>
            <p className="text-xs text-blue-600">
              {(currentSubscription as any)?.status || "—"}
            </p>
            <div className="mt-3">
              <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-blue-700">
                {remainingDays} days to next billing
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-pink-50 to-rose-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-700">
              Last Invoice
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-rose-800">
              {billingHistory[0]
                ? new Date(
                    (billingHistory[0] as any).paymentDate,
                  ).toLocaleDateString()
                : "—"}
            </div>
            <p className="text-xs text-rose-700">
              ₹
              {billingHistory[0]
                ? (billingHistory[0] as any).amount.toLocaleString("en-IN")
                : "—"}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs text-rose-700">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Next renew: {endDate ? endDate.toLocaleDateString() : "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-violet-50 to-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Invoices
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-purple-800">
              {billingHistory.length}
            </div>
            <p className="text-xs text-purple-700">Paid</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Default Method
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-green-800">
              Razorpay UPI
            </div>
            <p className="text-xs text-green-700">careerbox@upi</p>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-2xl border shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-900">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Invoices
            </span>
            <Link href="/institute/billing/invoices">
              <Button className="size-sm bg-blue-600 rounded-full px-4 py-1 text-white">
                View All
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[560px]">
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Loading invoices...
                    </div>
                  </TableCell>
                </TableRow>
              ) : billingHistory.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-gray-600"
                  >
                    No invoices
                  </TableCell>
                </TableRow>
              ) : (
                billingHistory.slice(0, 10).map((inv: any) => (
                  <TableRow key={inv.id || inv.orderId}>
                    <TableCell>
                      <Link
                        href={`/institute/billing/invoices/${inv.id || inv.orderId}`}
                        className="font-medium hover:underline"
                      >
                        {inv.id || inv.orderId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {new Date(inv.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <IndianRupee className="h-4 w-4" />
                        {inv.amount.toLocaleString("en-IN")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          inv.status === "paid" ? "default" : "secondary"
                        }
                        className="capitalize"
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
