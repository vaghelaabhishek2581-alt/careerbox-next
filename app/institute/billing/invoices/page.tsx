import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, IndianRupee } from 'lucide-react'
import InvoiceList from '@/components/institute/billing/InvoiceList'

export const metadata = {
  title: 'Invoices',
  description: 'Your institute invoices and payment history',
}

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions)
  if (!session || (!session.user?.roles?.includes('institute') && !session.user?.roles?.includes('admin'))) {
    redirect('/unauthorized')
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-[80px] z-30 bg-white backdrop-blur-sm px-4 sm:px-6 -mx-4 sm:-mx-6 mb-2 flex flex-col sm:flex-row sm:items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Invoices</h1>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <Button variant="outline">Export</Button>
          <Link href="/institute/billing">
            <Button variant="outline">Back to Billing</Button>
          </Link>
        </div>
      </div>
      <InvoiceList />
    </div>
  )
}
