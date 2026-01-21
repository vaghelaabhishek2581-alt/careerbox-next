'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, IndianRupee, ArrowLeft, ShieldCheck, Building2, Wallet } from 'lucide-react'
import { downloadInvoicePdf } from '@/lib/pdf/invoice'

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id as string

  const invoice = {
    id,
    date: '2026-01-01',
    dueDate: '2026-01-08',
    amount: 49999,
    currency: 'INR',
    status: 'paid' as const,
    plan: 'Institute Premium (Yearly)',
    method: 'upi' as const,
    transactionId: 'TXN-8F2A1B9C4D',
    upiHandle: 'careerbox@upi',
    cardBrand: undefined as string | undefined,
    cardLast4: undefined as string | undefined,
    lineItems: [
      { description: 'Institute Premium Subscription (12 months)', qty: 1, unitPrice: 49999, sac: '9983' },
    ],
  }

  const seller = {
    name: 'CareerBox',
    addressLine1: '2nd Floor, MG Road',
    addressLine2: 'Bengaluru, Karnataka 560001',
    country: 'India',
    gstin: '29ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    state: 'Karnataka',
    email: 'billing@careerbox.in'
  }

  const buyer = {
    name: 'CareerBox Institute',
    addressLine1: '2nd Floor, MG Road',
    addressLine2: 'Bengaluru, Karnataka 560001',
    country: 'India',
    gstin: '29ABCDE1234F1Z5',
    state: 'Karnataka',
    email: 'accounts@careerbox.in'
  }

  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
  const intraState = seller.state === buyer.state
  const taxRate = 0.18
  const totalTax = Math.round(subtotal * taxRate)
  const cgst = intraState ? Math.round(totalTax / 2) : 0
  const sgst = intraState ? Math.round(totalTax / 2) : 0
  const igst = intraState ? 0 : totalTax
  const totalDue = subtotal + totalTax
  const formatINR = (n: number) => n.toLocaleString('en-IN')

  const handleDownloadPdf = async () => {
    await downloadInvoicePdf({
      id: invoice.id,
      date: invoice.date,
      dueDate: invoice.dueDate,
      plan: invoice.plan,
      cycle: 'Yearly',
      method: invoice.method,
      transactionId: invoice.transactionId,
      upiHandle: invoice.upiHandle,
      cardBrand: invoice.cardBrand,
      cardLast4: invoice.cardLast4,
      seller,
      buyer,
      lineItems: invoice.lineItems,
    })
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-[80px] z-30 bg-white backdrop-blur-sm px-6 -mx-6 mb-4 flex flex-col md:flex-row md:items-center justify-between py-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Tax Invoice</h1>
            <Badge variant="secondary" className="ml-2">#{invoice.id}</Badge>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Issued by {seller.name}</p>
        </div>
        <div className="flex gap-2 mt-3 md:mt-0">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf}>Download PDF</Button>
        </div>
      </div>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Invoice Details</span>
            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
              {invoice.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50">
              <div className="text-xs text-gray-500">Invoice No.</div>
              <div className="text-lg font-semibold">{invoice.id}</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <div className="text-xs text-gray-500">Invoice Date</div>
              <div className="text-lg font-semibold">{new Date(invoice.date).toLocaleDateString()}</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <div className="text-xs text-gray-500">Due Date</div>
              <div className="text-lg font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Building2 className="h-4 w-4" />
                <span className="font-semibold">Billed By</span>
              </div>
              <div className="text-sm">
                <div className="font-semibold">{seller.name}</div>
                <div>{seller.addressLine1}</div>
                <div>{seller.addressLine2}</div>
                <div>{seller.country}</div>
                <div className="mt-2 text-gray-600">GSTIN: {seller.gstin}</div>
                <div className="text-gray-600">PAN: {seller.pan}</div>
                <div className="text-gray-600">Email: {seller.email}</div>
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Building2 className="h-4 w-4" />
                <span className="font-semibold">Billed To</span>
              </div>
              <div className="text-sm">
                <div className="font-semibold">{buyer.name}</div>
                <div>{buyer.addressLine1}</div>
                <div>{buyer.addressLine2}</div>
                <div>{buyer.country}</div>
                <div className="mt-2 text-gray-600">GSTIN: {buyer.gstin}</div>
                <div className="text-gray-600">Email: {buyer.email}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border">
            <div className="p-4">
              <div className="grid grid-cols-12 text-sm font-medium text-gray-600">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">HSN/SAC</div>
                <div className="col-span-1 text-right">Qty</div>
                <div className="col-span-3 text-right">Unit Price</div>
              </div>
            </div>
            <div className="divide-y">
              {invoice.lineItems.map((item, idx) => (
                <div key={idx} className="p-4 grid grid-cols-12 text-sm">
                  <div className="col-span-6">{item.description}</div>
                  <div className="col-span-2 text-right">{(item as any).sac}</div>
                  <div className="col-span-1 text-right">{item.qty}</div>
                  <div className="col-span-3 text-right flex items-center justify-end gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {formatINR(item.unitPrice)}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {formatINR(subtotal)}
                </span>
              </div>
              {intraState ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">CGST @ 9%</span>
                    <span className="font-semibold flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {formatINR(cgst)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">SGST @ 9%</span>
                    <span className="font-semibold flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {formatINR(sgst)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">IGST @ 18%</span>
                  <span className="font-semibold flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {formatINR(igst)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-900 font-semibold">Total Due</span>
                <span className="text-lg font-bold flex items-center gap-1">
                  <IndianRupee className="h-5 w-5" />
                  {formatINR(totalDue)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border rounded-xl">
              <CardHeader>
                <CardTitle className="text-sm">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    {invoice.method === 'upi' ? `UPI • ${invoice.upiHandle}` : `Card • ${invoice.cardBrand} •••• ${invoice.cardLast4}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-mono">{invoice.transactionId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Place of Supply</span>
                  <span className="font-medium">{buyer.state}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reverse Charge</span>
                  <span className="font-medium">No</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border rounded-xl">
              <CardHeader>
                <CardTitle className="text-sm">Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{invoice.plan}</span>
                </div>
                <div className="text-xs text-gray-600">Validity: 12 months</div>
                <div className="text-xs text-gray-600">Support: Priority</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border rounded-xl">
            <CardHeader>
              <CardTitle className="text-sm">Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <div>Prices are exclusive of applicable taxes unless stated otherwise. Tax charged as per GST law.</div>
              <div>Services are non-transferable and subject to the CareerBox Terms of Service.</div>
              <div>Disputes subject to Bengaluru, Karnataka jurisdiction.</div>
              <div>For support and billing queries, contact {seller.email}.</div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">This is a system-generated invoice.</div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Authorized Signatory</div>
              <div className="mt-6 h-8 w-40 border-t border-gray-300 mx-auto"></div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Link href="/institute/billing">
              <Button variant="outline">Back to Billing</Button>
            </Link>
            <Button variant="default" onClick={handleDownloadPdf}>Download PDF</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
