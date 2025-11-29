import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/options';
import { Sidebar } from '@/components/institute/sidebar';
import { SiteHeader } from '@/components/site-header';

export default async function InstituteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth/signin');
  }

  // Redirect to unauthorized if user doesn't have 'institute' or 'admin' role
  if (!session.user?.roles?.includes('institute') && !session.user?.roles?.includes('admin')) {
    redirect('/unauthorized');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <Sidebar />
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
