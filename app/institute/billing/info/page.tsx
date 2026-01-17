import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin } from 'lucide-react'

export const metadata = {
  title: 'Billing Information',
  description: 'Address and tax information for invoices',
}

export default async function BillingInfoPage() {
  const session = await getServerSession(authOptions)
  if (!session || (!session.user?.roles?.includes('institute') && !session.user?.roles?.includes('admin'))) {
    redirect('/unauthorized')
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-[80px] z-30 bg-white backdrop-blur-sm px-4 sm:px-6 -mx-4 sm:-mx-6 mb-2 flex flex-col sm:flex-row sm:items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Billing Information</h1>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <Link href="/institute/billing">
            <Button variant="outline">Back to Billing</Button>
          </Link>
        </div>
      </div>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="org">Organization</Label>
              <Input id="org" defaultValue="CareerBox Institute" />
            </div>
            <div>
              <Label htmlFor="gst">GSTIN</Label>
              <Input id="gst" defaultValue="29ABCDE1234F1Z5" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="addr1">Address Line</Label>
              <Textarea id="addr1" defaultValue="2nd Floor, MG Road" />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" defaultValue="Bengaluru" />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" defaultValue="Karnataka" />
            </div>
            <div>
              <Label htmlFor="zip">Postal Code</Label>
              <Input id="zip" defaultValue="560001" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" defaultValue="India" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button className="bg-blue-800 text-white px-4 py-2 rounded-full">Save</Button>
            <Button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full" variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
