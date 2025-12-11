import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, FileText } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Institute Dashboard',
  description: 'Manage your institute profile and activities',
};

export default async function InstituteDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (!session.user?.roles?.includes('institute') && !session.user?.roles?.includes('admin'))) {
    redirect('/unauthorized');
  }

  // In a real app, you would fetch this data from your API
  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users },
    { title: 'Active Courses', value: '24', icon: BookOpen },
    { title: 'Applications', value: '156', icon: FileText },
    { title: 'Graduates', value: '856', icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institute Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name || 'Institute Admin'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/institute/courses"
              className="block p-3 rounded-md hover:bg-accent transition-colors"
            >
              Manage Courses
            </a>
            <a
              href="/institute/students"
              className="block p-3 rounded-md hover:bg-accent transition-colors"
            >
              View Students
            </a>
            <a
              href="/institute/settings"
              className="block p-3 rounded-md hover:bg-accent transition-colors"
            >
              Institute Settings
            </a>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="border-b pb-4 last:border-0 last:pb-0">
                  <p className="text-sm">New student application received</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
