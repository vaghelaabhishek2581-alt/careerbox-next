'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchDashboardStats } from '@/lib/redux/slices/dashboardSlice';
import DashboardLayout from '@/components/dashboard/layout';
import { 
  Users, 
  TrendingUp, 
  DollarSign,
  Target,
  UserPlus,
  BarChart3,
  Settings,
  CreditCard,
  Search,
  FileText
} from 'lucide-react';

export default function BusinessDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { stats, isLoading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats({ role: 'business', dateRange: '30d' }));
  }, [dispatch]);

  const businessStats = [
    {
      title: 'Active Employees',
      value: '156',
      change: '+12%',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Recruitment Pipeline',
      value: '23',
      change: '+8%',
      icon: Target,
      color: 'green'
    },
    {
      title: 'Training Completion',
      value: '89%',
      change: '+5%',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Monthly Investment',
      value: '$12,450',
      change: '+15%',
      icon: DollarSign,
      color: 'orange'
    }
  ];

  const recentHires = [
    { name: 'Sarah Johnson', role: 'Frontend Developer', date: '2024-01-15', status: 'Onboarding' },
    { name: 'Mike Chen', role: 'Product Manager', date: '2024-01-12', status: 'Active' },
    { name: 'Emily Davis', role: 'UX Designer', date: '2024-01-10', status: 'Active' },
    { name: 'Alex Rodriguez', role: 'Backend Developer', date: '2024-01-08', status: 'Active' }
  ];

  const openPositions = [
    { title: 'Senior React Developer', applicants: 15, posted: '3 days ago', status: 'Active' },
    { title: 'DevOps Engineer', applicants: 8, posted: '1 week ago', status: 'Active' },
    { title: 'Data Scientist', applicants: 22, posted: '2 weeks ago', status: 'Reviewing' },
    { title: 'Marketing Manager', applicants: 12, posted: '1 week ago', status: 'Active' }
  ];

  return (
    <DashboardLayout
      title="Business Dashboard"
      subtitle="Manage your talent acquisition and workforce development"
      role="business"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {businessStats.map((stat, index) => {
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
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Hires */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  Recent Hires
                </CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentHires.map((hire, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {hire.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{hire.name}</h4>
                        <p className="text-sm text-gray-600">{hire.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={hire.status === 'Active' ? 'default' : 'secondary'}>
                        {hire.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{hire.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Employee Satisfaction</span>
                    <span className="text-sm text-gray-500">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Retention Rate</span>
                    <span className="text-sm text-gray-500">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Training Progress</span>
                    <span className="text-sm text-gray-500">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Goal Achievement</span>
                    <span className="text-sm text-gray-500">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Active Job Postings
              </CardTitle>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {openPositions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{position.title}</h4>
                      <p className="text-sm text-gray-600">
                        {position.applicants} applicants • Posted {position.posted}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={position.status === 'Active' ? 'default' : 'secondary'}>
                        {position.status}
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

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recruitment Funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Applications Received</span>
                  <span className="font-semibold">342</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Initial Screening</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Interviews Scheduled</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Final Round</span>
                  <span className="font-semibold">32</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Offers Extended</span>
                  <span className="font-semibold">18</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Talent Pool Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">2,456</div>
                  <div className="text-sm text-gray-500">Candidates in Pipeline</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">234</div>
                    <div className="text-xs text-gray-600">Pre-screened</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">89</div>
                    <div className="text-xs text-gray-600">Shortlisted</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Employee Directory</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Export
                </Button>
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                  Add Employee
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'John Smith', role: 'Engineering Manager', department: 'Engineering', status: 'Active' },
                  { name: 'Lisa Wang', role: 'Senior Designer', department: 'Design', status: 'Active' },
                  { name: 'Carlos Rodriguez', role: 'DevOps Engineer', department: 'Engineering', status: 'Active' },
                  { name: 'Amanda Chen', role: 'Product Manager', department: 'Product', status: 'Active' }
                ].map((employee, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-gray-600">
                          {employee.role} • {employee.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="default">{employee.status}</Badge>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hiring Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">45 days</div>
                    <div className="text-sm text-gray-500">Average Time to Hire</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">$2,500</div>
                      <div className="text-xs text-gray-600">Cost per Hire</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">85%</div>
                      <div className="text-xs text-gray-600">Offer Acceptance</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">4.6/5.0</div>
                    <div className="text-sm text-gray-500">Average Performance Score</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">92%</div>
                      <div className="text-xs text-gray-600">Goal Achievement</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">3.2%</div>
                      <div className="text-xs text-gray-600">Turnover Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Company Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Company Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Recruitment Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Employee Onboarding
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Performance Reviews
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">Professional Plan</div>
                  <div className="text-sm text-gray-600">$299/month • Next billing: Feb 15, 2024</div>
                </div>
                <Button variant="outline" className="w-full justify-start">
                  Billing History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Update Payment Method
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}