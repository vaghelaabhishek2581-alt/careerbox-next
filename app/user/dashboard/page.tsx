import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import UserDashboardUI from '@/components/user/dashboard/DashboardUI';

export const metadata: Metadata = {
  title: 'User Dashboard',
  description: 'Overview of your activity and profile',
};

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/unauthorized');
  }

  return <UserDashboardUI />;
}

