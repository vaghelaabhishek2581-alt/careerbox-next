import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CreditCard, Smartphone } from 'lucide-react'
import AddPaymentMethodDialog, { CardBrandLogo } from '@/components/payment/AddPaymentMethodDialog'

export const metadata = {
  title: 'Payment Methods',
  description: 'Manage Razorpay cards and UPI methods',
}

export default async function PaymentMethodsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (!session.user?.roles?.includes('institute') && !session.user?.roles?.includes('admin'))) {
    redirect('/unauthorized')
  }

  const methods = [
    { id: 'pm_card_2891', type: 'card', brand: 'Visa', last4: '2891', default: true },
    { id: 'pm_upi_razorpay', type: 'upi', handle: 'careerbox@upi', default: false },
  ]

  return (
    <div className="space-y-6">
      <div className="sticky top-[80px] z-30 bg-white backdrop-blur-sm px-4 sm:px-6 -mx-4 sm:-mx-6 mb-2 flex flex-col sm:flex-row sm:items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Payment Methods</h1>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <Link href="/institute/billing">
            <Button variant="outline">Back to Billing</Button>
          </Link>
        </div>
      </div>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Saved Methods</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 text-white px-4 py-2 rounded-full">Add New Method</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Add New Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new card or UPI handle. Your details are processed securely via Razorpay.
                  </DialogDescription>
                </DialogHeader>
                <AddPaymentMethodDialog />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {methods.map((m) => (
            <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border rounded-xl bg-white">
              <div className="flex items-center gap-3">
                {m.type === 'card' ? <CardBrandLogo brand={(m.brand?.toLowerCase() as any) || 'unknown'} className="h-5 w-8" /> : <Smartphone className="h-5 w-5" />}
                <div>
                  <div className="font-medium">
                    {m.type === 'card' ? `Card •••• ${m.last4}` : `UPI • ${m.handle}`}
                    <span className="ml-2">{m.default && <Badge variant="default">Default</Badge>}</span>
                  </div>
                  <div className="text-sm text-gray-500">{m.type === 'card' ? m.brand : 'Razorpay UPI'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* {m.default && <Badge variant="secondary">Default</Badge>} */}
                <Button size="sm" variant="outline">Set Default</Button>
                <Button size="sm" variant="outline">Remove</Button>
              </div>
            </div>
          ))}
          {methods.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No saved methods</div>
          )}
        </CardContent>
      </Card>

      {/* Add New Method moved into Dialog above */}
    </div>
  )
}
