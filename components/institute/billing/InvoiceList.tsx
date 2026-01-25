"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IndianRupee,
  FileDown,
  FileText,
  Eye,
} from "lucide-react";
import { downloadInvoicePdf } from "@/lib/pdf/invoice";
import { AppDispatch } from "@/lib/redux/store";
import { fetchInvoicesPage } from "@/lib/redux/slices/subscriptionSlice";

type InvoiceStatus = "paid" | "pending" | "failed" | "inactive" | "cancelled" | "expired" | "suspended";

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  inactive: "bg-gray-100 text-gray-800",
  cancelled: "bg-gray-100 text-gray-800",
  expired: "bg-gray-100 text-gray-800",
  suspended: "bg-gray-100 text-gray-800",
};

const PAGE_SIZE = 10;

export default function InvoiceList() {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = async (p: number) => {
    setLoading(true);
    try {
      const res = await dispatch(fetchInvoicesPage({ page: p, limit: PAGE_SIZE })).unwrap();
      const data = (res as any)?.data || [];
      const pagination = (res as any)?.pagination || { totalPages: p, currentPage: p };
      setItems((prev) => [...prev, ...data]);
      setHasMore(pagination.currentPage < pagination.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(1);
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const last = entries[0];
        if (last.isIntersecting && hasMore && !loading) {
          const next = page + 1;
          setPage(next);
          loadPage(next);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading]);

  const handleDownloadPdf = async (inv: any) => {
    const dueDateISO = new Date(new Date(inv.paymentDate || inv.startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await downloadInvoicePdf({
      id: inv.id || inv.orderId,
      date: inv.paymentDate || inv.startDate,
      dueDate: dueDateISO,
      plan: inv.planName || "Subscription",
      cycle: (inv.interval || "Yearly") as any,
      method: "upi",
      transactionId: inv.orderId || inv.id,
      upiHandle: "",
      seller: {
        name: "CareerBox",
        addressLine1: "53, World Business House",
        addressLine2: "EllisBridge, Ahmedabad, Gujarat-380006",
        country: "India",
        gstin: "29ABCDE1234F1Z5",
        pan: "ABCDE1234F",
        state: "Gujarat",
        email: "billing@careerbox.in",
      },
      buyer: {
        name: "CareerBox Institute",
        addressLine1: "2nd Floor, MG Road",
        addressLine2: "Bengaluru, Karnataka 560001",
        country: "India",
        gstin: "29ABCDE1234F1Z5",
        state: "Karnataka",
        email: "accounts@careerbox.in",
      },
      lineItems: [
        { description: `${inv.planName || "Subscription"} (${inv.interval || "Yearly"})`, qty: 1, unitPrice: inv.amount, sac: "9983" },
      ],
    });
  };

  return (
    <div className="space-y-4">
      {items.map((inv) => (
        <Card key={inv.id || inv.orderId} className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">{inv.id || inv.orderId}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={STATUS_COLOR[(inv.status as InvoiceStatus) || "paid"]}>
                  {String(inv.status || "paid").toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1">
                  <Link href={`/institute/billing/invoices/${inv.id || inv.orderId}`} aria-label="View invoice">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Download invoice"
                    className="h-8 w-8"
                    onClick={() => handleDownloadPdf(inv)}
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Subscription</div>
                    <div className="font-medium">{inv.planName || "Subscription"} ({inv.interval || "Yearly"})</div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-3 p-4 rounded-xl bg-gray-50">
                <div className="text-xs text-gray-500">Date</div>
                <div className="font-medium">
                  {new Date(inv.paymentDate || inv.startDate).toLocaleDateString()}
                </div>
              </div>
              <div className="md:col-span-3 p-4 rounded-xl bg-gray-50">
                <div className="text-xs text-gray-500">Amount</div>
                <div className="font-semibold flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {Number(inv.amount).toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-gray-500 ml-1">
                    {inv.currency || "INR"}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Processed securely via Razorpay</div>
          </CardContent>
        </Card>
      ))}

      <div ref={sentinelRef} />

      {!hasMore && (
        <div className="text-center py-6 text-sm text-muted-foreground">All invoices loaded</div>
      )}
      {loading && (
        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">Loading more...</div>
      )}
    </div>
  );
}
