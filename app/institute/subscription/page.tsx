import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import BillingOverview from '@/components/institute/subscription/SubscriptionOverview';

export const metadata: Metadata = {
  title: 'Subscription',
  description: 'Manage your institute subscription, payments, and billing',
};

export default async function InstituteSubscriptionPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  if (!session.user?.roles?.includes('institute') && !session.user?.roles?.includes('admin')) {
    redirect('/unauthorized');
  }

  return <BillingOverview />;
}
