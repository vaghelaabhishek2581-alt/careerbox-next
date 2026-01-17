"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndianRupee, CreditCard, Smartphone, FileDown, FileText, Eye } from "lucide-react";
import { faker } from "@faker-js/faker";
import { downloadInvoicePdf } from "@/lib/pdf/invoice";

type InvoiceStatus = "paid" | "pending" | "failed";
type Method = "card" | "upi";

interface Invoice {
  id: string;
  plan: string;
  cycle: "Monthly" | "Quarterly" | "Yearly";
  amount: number;
  currency: string;
  date: string;
  status: InvoiceStatus;
  method: Method;
  transactionId: string;
  cardBrand?: string;
  cardLast4?: string;
  upiHandle?: string;
}

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

const PAGE_SIZE = 10;
const TOTAL_ITEMS = 40;

const defaultSeller = {
  name: "CareerBox",
  addressLine1: "2nd Floor, MG Road",
  addressLine2: "Bengaluru, Karnataka 560001",
  country: "India",
  gstin: "29ABCDE1234F1Z5",
  pan: "ABCDE1234F",
  state: "Karnataka",
  email: "billing@careerbox.in",
};

const defaultBuyer = {
  name: "CareerBox Institute",
  addressLine1: "2nd Floor, MG Road",
  addressLine2: "Bengaluru, Karnataka 560001",
  country: "India",
  gstin: "29ABCDE1234F1Z5",
  state: "Karnataka",
  email: "accounts@careerbox.in",
};

const generateInvoices = (): Invoice[] => {
  faker.seed(20260117);
  const items: Invoice[] = [];
  for (let i = 0; i < TOTAL_ITEMS; i++) {
    const method: Method = faker.helpers.arrayElement(["card", "upi"]);
    const cycle = faker.helpers.arrayElement(["Monthly", "Quarterly", "Yearly"]) as Invoice["cycle"];
    const status = faker.helpers.arrayElement(["paid", "pending", "failed"]) as InvoiceStatus;
    const date = faker.date.recent({ days: 365 });
    const amount = cycle === "Yearly" ? 49999 : cycle === "Quarterly" ? 14999 : 4999;
    const id = `INV-${date.getFullYear()}-${String(100 + i).padStart(3, "0")}`;
    const plan = faker.helpers.arrayElement([
      "Institute Premium",
      "Institute Basic",
      "Business Professional",
      "Business Enterprise",
    ]);
    const transactionId = faker.string.alphanumeric({ length: 12 }).toUpperCase();
    const cardBrand = faker.helpers.arrayElement(["Visa", "Mastercard", "RuPay", "American Express", "Diners", "Maestro"]);
    const cardLast4 = faker.string.numeric({ length: 4 });
    const upiHandle = `${faker.internet.userName().toLowerCase()}@ok${faker.helpers.arrayElement(["axis", "hdfc", "icici", "sbi"])}`;

    items.push({
      id,
      plan,
      cycle,
      amount,
      currency: "INR",
      date: date.toISOString(),
      status,
      method,
      transactionId,
      cardBrand,
      cardLast4,
      upiHandle,
    });
  }
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return items;
};

export default function InvoiceList() {
  const allInvoices = useMemo(generateInvoices, []);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visible = allInvoices.slice(0, visibleCount);

  const handleDownloadPdf = async (inv: Invoice) => {
    const dueDateISO = new Date(new Date(inv.date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await downloadInvoicePdf({
      id: inv.id,
      date: inv.date,
      dueDate: dueDateISO,
      plan: inv.plan,
      cycle: inv.cycle,
      method: inv.method,
      transactionId: inv.transactionId,
      upiHandle: inv.upiHandle,
      cardBrand: inv.cardBrand,
      cardLast4: inv.cardLast4,
      seller: defaultSeller,
      buyer: defaultBuyer,
      lineItems: [
        { description: `${inv.plan} (${inv.cycle})`, qty: 1, unitPrice: inv.amount, sac: "9983" },
      ],
    });
  };

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const last = entries[0];
        if (last.isIntersecting && hasMore && !loading) {
          setLoading(true);
          setTimeout(() => {
            const next = visibleCount + PAGE_SIZE;
            setVisibleCount(next);
            setHasMore(next < allInvoices.length);
            setLoading(false);
          }, 400);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleCount, hasMore, loading, allInvoices.length]);

  return (
    <div className="space-y-4">
      {visible.map((inv) => (
        <Card key={inv.id} className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">{inv.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={STATUS_COLOR[inv.status]}>{inv.status.toUpperCase()}</Badge>
                <div className="flex items-center gap-1">
                  <Link href={`/institute/billing/invoices/${inv.id}`} aria-label="View invoice">
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
                    <div className="font-medium">{inv.plan} ({inv.cycle})</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Payment Method</div>
                    <div className="font-medium flex items-center gap-2">
                      {inv.method === "card" ? <CreditCard className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                      {inv.method === "card" ? `${inv.cardBrand} •••• ${inv.cardLast4}` : `UPI • ${inv.upiHandle}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Transaction No.</div>
                    <div className="font-mono text-sm">{inv.transactionId}</div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-3 p-4 rounded-xl bg-gray-50">
                <div className="text-xs text-gray-500">Date</div>
                <div className="font-medium">{new Date(inv.date).toLocaleDateString()}</div>
              </div>
              <div className="md:col-span-3 p-4 rounded-xl bg-gray-50">
                <div className="text-xs text-gray-500">Amount</div>
                <div className="font-semibold flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {inv.amount.toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-gray-500 ml-1">{inv.currency}</span>
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
