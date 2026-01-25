import BillingClient from "@/components/institute/billing/BillingClient";

export const metadata = {
  title: "Billing & Payments",
  description: "Manage invoices, payment methods, and billing information",
};

export default function InstituteBillingPage() {
  return <BillingClient />;
}
