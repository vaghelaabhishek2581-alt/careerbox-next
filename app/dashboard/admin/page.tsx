'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchDashboardStats } from '@/lib/redux/slices/dashboardSlice';
import { fetchUsers } from '@/lib/redux/slices/userSlice';
import { fetchOrganizations } from '@/lib/redux/slices/organizationSlice';
import { fetchBusinesses } from '@/lib/redux/slices/businessSlice';
import DashboardLayout from '@/components/dashboard/layout';
import { 
  Users, 
  Building2, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  UserPlus,
  Settings,
  Shield,
  BarChart3,
  Globe
} from 'lucide-react';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { stats, isLoading } = useAppSelector((state) => state.dashboard);
  const { users, totalUsers } = useAppSelector((state) => state.users);
  const { organizations, totalOrganizations } = useAppSelector((state) => state.organization);
  const { businesses, totalBusinesses, businessStats } = useAppSelector((state) => state.business);

  useEffect(() => {
    dispatch(fetchDashboardStats({ role: 'admin', dateRange: '30d' }));
    dispatch(fetchUsers({ page: 1, limit: 10, filters: {} }));
    dispatch(fetchOrganizations({ page: 1, limit: 5 }));
    dispatch(fetchBusinesses({ page: 1, limit: 5, filters: {} }));
  }, [dispatch]);

  const adminStats = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: '+12%',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Organizations',
      value: totalOrganizations.toString(),
      change: '+8%',
      icon: Building2,
      color: 'green'
    },
    {
      title: 'Businesses',
      value: totalBusinesses.toString(),
      change: '+15%',
      icon: Briefcase,
      color: 'purple'
    },
    {
      title: 'Revenue',
      value: `$${businessStats.totalRevenue.toLocaleString()}`,
      change: '+23%',
      icon: DollarSign,
      color: 'orange'
    }
  ];

  return (
    <DashboardLayout
      title="System Administration"
      subtitle="Manage users, organizations, and system-wide settings"
      role="admin"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {adminStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm font-medium text-${stat.color}-600`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`h-12 w-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Server Performance</span>
                    <span className="text-sm text-gray-500">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Database Health</span>
                    <span className="text-sm text-gray-500">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">API Response Time</span>
                    <span className="text-sm text-gray-500">99%</span>
                  </div>
                  <Progress value={99} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Recent System Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: 'New organization registered', time: '2 mins ago', type: 'success' },
                  { action: 'User reported content', time: '15 mins ago', type: 'warning' },
                  { action: 'Business subscription upgraded', time: '1 hour ago', type: 'info' },
                  { action: 'System backup completed', time: '3 hours ago', type: 'success' },
                  { action: 'Security scan finished', time: '6 hours ago', type: 'info' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-600' :
                      activity.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Organization Management</CardTitle>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <Building2 className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organizations.slice(0, 5).map((org, index) => (
                  <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-10 w-10 text-green-600" />
                      <div>
                        <h4 className="font-medium">{org.name}</h4>
                        <p className="text-sm text-gray-600">{org.type} • {org.memberCount} members</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                        {org.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="businesses" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Business Management</CardTitle>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Briefcase className="h-4 w-4 mr-2" />
                Add Business
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businesses.slice(0, 5).map((business, index) => (
                  <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-10 w-10 text-purple-600" />
                      <div>
                        <h4 className="font-medium">{business.name}</h4>
                        <p className="text-sm text-gray-600">
                          {business.industry} • {business.employees} employees
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={business.status === 'active' ? 'default' : 'secondary'}>
                        {business.subscription.plan}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Platform Configuration
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Email Templates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Payment Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  API Configuration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  User Permissions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Data Privacy Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Security Policies
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Audit Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}