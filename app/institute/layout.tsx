import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/options';
import { SidebarManager } from '@/components/institute/SidebarManager';
import Header from '@/components/header';

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
      {/* Header is rendered globally since we removed the hide logic in components/header.tsx */}
      <Header />
      {/* Add top padding to account for the fixed header height so content isn't hidden behind it */}
      <div className="pt-20 pb-24"> 
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 lg:gap-8 pt-6">
            <aside className="hidden lg:block w-[300px] shrink-0">
               {/* Sidebar should be sticky but account for the header height */}
               <div className="sticky top-24">
                 <SidebarManager />
               </div>
            </aside>
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
