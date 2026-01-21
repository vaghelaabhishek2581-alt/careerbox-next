"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "diners"
  | "maestro"
  | "rupay"
  | "discover"
  | "unknown";

const formatCardNumber = (value: string) =>
  value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
};

const detectCardBrand = (num: string): CardBrand => {
  const n = num.replace(/\s+/g, "");
  if (/^4\d{0,}$/.test(n)) return "visa";
  if (/^(5[1-5]\d{0,}|2(2[2-9]|[3-6]\d|7[01]|720)\d{0,})$/.test(n)) return "mastercard";
  if (/^3[47]\d{0,}$/.test(n)) return "amex";
  if (/^3(0[0-5]|[68])\d{0,}$/.test(n)) return "diners";
  if (/^(50(18|20)|5893|63(04|39)|67(59|6[1-3]))\d{0,}$/.test(n)) return "maestro";
  if (/^(6011|65|64[4-9])\d{0,}$/.test(n)) return "discover";
  if (/^(60|652[1-9])\d{0,}$/.test(n)) return "rupay";
  return "unknown";
};

const brandLabel: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  diners: "Diners Club",
  maestro: "Maestro",
  rupay: "RuPay",
  discover: "Discover",
  unknown: "Card",
};

export const CardBrandLogo = ({ brand, className = "h-5 w-8" }: { brand: CardBrand; className?: string }) => {
  switch (brand) {
    case "mastercard":
      return (
        <svg viewBox="0 0 48 24" className={className}>
          <circle cx="18" cy="12" r="9" fill="#EB001B" />
          <circle cx="30" cy="12" r="9" fill="#F79E1B" />
        </svg>
      );
    case "visa":
      return (
        <svg viewBox="0 0 64 24" className={className}>
          <rect x="0" y="0" width="64" height="24" rx="4" fill="#1A1F71" />
          <text x="10" y="17" fontSize="12" fill="#fff" fontFamily="Arial" fontWeight="700">
            VISA
          </text>
        </svg>
      );
    case "amex":
      return (
        <svg viewBox="0 0 64 24" className={className}>
          <rect x="0" y="0" width="64" height="24" rx="4" fill="#2E77BB" />
          <text x="8" y="16" fontSize="10" fill="#fff" fontFamily="Arial" fontWeight="700">
            AMERICAN
          </text>
          <text x="8" y="22" fontSize="10" fill="#fff" fontFamily="Arial" fontWeight="700">
            EXPRESS
          </text>
        </svg>
      );
    case "diners":
      return (
        <svg viewBox="0 0 48 24" className={className}>
          <circle cx="18" cy="12" r="9" fill="#3A3A3A" />
          <circle cx="30" cy="12" r="9" fill="#9AA0A6" />
        </svg>
      );
    case "maestro":
      return (
        <svg viewBox="0 0 48 24" className={className}>
          <circle cx="18" cy="12" r="9" fill="#1A73E8" />
          <circle cx="30" cy="12" r="9" fill="#EA4335" />
        </svg>
      );
    case "rupay":
      return (
        <svg viewBox="0 0 64 24" className={className}>
          <rect x="0" y="0" width="64" height="24" rx="4" fill="#152238" />
          <text x="8" y="16" fontSize="12" fill="#fff" fontFamily="Arial" fontWeight="700">
            RuPay
          </text>
        </svg>
      );
    case "discover":
      return (
        <svg viewBox="0 0 64 24" className={className}>
          <rect x="0" y="0" width="64" height="24" rx="4" fill="#000" />
          <rect x="0" y="18" width="64" height="6" fill="#F79E1B" />
          <text x="8" y="16" fontSize="12" fill="#fff" fontFamily="Arial" fontWeight="700">
            DISCOVER
          </text>
        </svg>
      );
    default:
      return (
        <div className={className}>
          <div className="h-full w-full rounded bg-gray-200" />
        </div>
      );
  }
};

type UPIProvider = "gpay" | "phonepe" | "paytm" | "bhim" | "amazonpay" | "others";

const UpiLogo = ({ provider, className = "h-6 w-16" }: { provider: UPIProvider; className?: string }) => {
  switch (provider) {
    case "gpay":
      return (
        <svg viewBox="0 0 64 24" className={className}>
          <text x="6" y="16" fontSize="12" fill="#1A73E8" fontFamily="Arial" fontWeight="700">
            GPay
          </text>
        </svg>
      );
    case "phonepe":
      return (
        <svg viewBox="0 0 64 24" className={className}>
          <rect x="6" y="4" width="16" height="16" rx="8" fill="#5B2D8D" />
          <text x="26" y="16" fontSize="12" fill="#5B2D8D" fontFamily="Arial" fontWeight="700">
            PhonePe
          </text>
        </svg>
      );
    case "paytm":
      return (
        <svg viewBox="0 0 64 24" className={className}>
          <text x="6" y="16" fontSize="12" fill="#00BFE7" fontFamily="Arial" fontWeight="700">
            Paytm
          </text>
        </svg>
      );
    case "bhim":
      return (
        <svg viewBox="0 0 64 24" className={className}>
          <polygon points="8,6 24,12 8,18" fill="#FF6D00" />
          <text x="28" y="16" fontSize="12" fill="#1A1A1A" fontFamily="Arial" fontWeight="700">
            BHIM
          </text>
        </svg>
      );
    case "amazonpay":
      return (
        <svg viewBox="0 0 64 24" className={className}>
          <text x="6" y="16" fontSize="12" fill="#FF9900" fontFamily="Arial" fontWeight="700">
            Amazon Pay
          </text>
        </svg>
      );
    default:
      return <div className={className} />;
  }
};

export default function AddPaymentMethodDialog() {
  const { toast } = useToast();

  const [mode, setMode] = useState<"card" | "upi">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [upiProvider, setUpiProvider] = useState<UPIProvider>("gpay");
  const [upiId, setUpiId] = useState("");

  const brand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);
  const cvvLength = brand === "amex" ? 4 : 3;

  const validCard =
    cardNumber.replace(/\s/g, "").length >= 12 &&
    /\b[A-Z][a-zA-Z ]{1,}\b/.test(cardName) &&
    /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExp) &&
    new RegExp(`^\\d{${cvvLength}}$`).test(cardCvv);

  const upiPattern = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
  const validUpi = upiPattern.test(upiId);

  const handleAddCard = () => {
    if (!validCard) {
      toast({ title: "Invalid card details", description: "Please check the fields and try again." });
      return;
    }
    toast({
      title: "Card added",
      description: `${brandLabel[brand]} •••• ${cardNumber.replace(/\D/g, "").slice(-4)} saved`,
    });
  };

  const handleAddUpi = () => {
    if (!validUpi) {
      toast({ title: "Invalid UPI ID", description: "Enter a valid UPI ID like username@bank" });
      return;
    }
    toast({
      title: "UPI handle added",
      description: `${upiId} via ${upiProvider.toUpperCase()} saved`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={mode === "card" ? "default" : "outline"} onClick={() => setMode("card")}>
          Card
        </Button>
        <Button variant={mode === "upi" ? "default" : "outline"} onClick={() => setMode("upi")}>
          UPI
        </Button>
      </div>

      {mode === "card" && (
        <div className="space-y-4">
          <Card className="rounded-xl border bg-gradient-to-br from-slate-50 to-white">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary">{brandLabel[brand]}</Badge>
                <CardBrandLogo brand={brand} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="card-number"
                      placeholder="4111 1111 1111 1111"
                      value={formatCardNumber(cardNumber)}
                      onChange={(e) => setCardNumber(e.target.value)}
                      inputMode="numeric"
                    />
                    <CardBrandLogo brand={brand} className="h-6 w-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="card-name">Cardholder Name</Label>
                  <Input
                    id="card-name"
                    placeholder="CareerBox Institute"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exp">Expiry</Label>
                    <Input
                      id="exp"
                      placeholder="MM/YY"
                      value={cardExp}
                      onChange={(e) => setCardExp(formatExpiry(e.target.value))}
                      maxLength={5}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder={cvvLength === 4 ? "4 digits" : "3 digits"}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, cvvLength))}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddCard} disabled={!validCard}>
                  Add Card
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="text-xs text-gray-500">Processed securely via Razorpay</div>
        </div>
      )}

      {mode === "upi" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(["gpay", "phonepe", "paytm", "bhim", "amazonpay", "others"] as UPIProvider[]).map((p) => (
              <Button
                key={p}
                variant={upiProvider === p ? "default" : "outline"}
                className="flex items-center justify-center gap-2 h-12"
                onClick={() => setUpiProvider(p)}
              >
                <UpiLogo provider={p} />
              </Button>
            ))}
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="upi-id">UPI ID</Label>
              <Input
                id="upi-id"
                placeholder="username@bank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <div className="text-xs text-muted-foreground mt-1">Example: careerbox@okaxis</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddUpi} disabled={!validUpi}>
              Add UPI
            </Button>
          </div>
          <div className="text-xs text-gray-500">Processed securely via Razorpay</div>
        </div>
      )}
    </div>
  );
}

