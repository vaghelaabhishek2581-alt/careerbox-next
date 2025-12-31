'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchAdminStats, fetchAllRegistrationIntents } from '@/lib/redux/slices/adminSlice';
import { RegistrationReviewDialog } from '@/components/admin/RegistrationReviewDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Globe,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, registrationIntents, loading } = useSelector((state: RootState) => state.admin);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchAllRegistrationIntents({ page: 1 }));
  }, [dispatch]);

  const adminStats = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '0',
      change: '+12%',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Total Institutes',
      value: stats?.totalInstitutes?.toString() || '0',
      change: '+8%',
      icon: Building2,
      color: 'orange'
    },
    {
      title: 'Total Businesses',
      value: stats?.totalBusinesses?.toString() || '0',
      change: '+15%',
      icon: Briefcase,
      color: 'purple'
    },
    {
      title: 'Pending Reviews',
      value: stats?.pendingRegistrations?.toString() || '0',
      change: 'New',
      icon: FileText,
      color: 'red'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage users, registrations, and system-wide settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            <Shield className="w-3 h-3 mr-1" />
            Admin Access
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <Tabs defaultValue="registrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registrations">Registration Requests</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Registration Reviews</CardTitle>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                {registrationIntents?.filter(intent => intent.status === 'pending').length || 0} Pending
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registrationIntents?.slice(0, 5).map((intent) => {
                  const TypeIcon = intent.type === 'institute' ? Building2 : Briefcase;
                  const statusConfig = {
                    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
                    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
                    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
                    payment_required: { color: 'bg-blue-100 text-blue-800', icon: CreditCard },
                    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
                  };
                  const StatusIcon = statusConfig[intent.status as keyof typeof statusConfig]?.icon || Clock;
                  
                  return (
                    <div key={intent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${intent.type === 'institute' ? 'bg-orange-100' : 'bg-purple-100'}`}>
                          <TypeIcon className={`h-5 w-5 ${intent.type === 'institute' ? 'text-orange-600' : 'text-purple-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{intent.organizationName}</h4>
                          <p className="text-sm text-gray-600">{intent.email} • {intent.type}</p>
                          <p className="text-xs text-gray-500">Applied: {new Date(intent.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusConfig[intent.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {intent.status.replace('_', ' ')}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedIntent(intent);
                            setReviewDialog(true);
                          }}
                          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  );
                }) || (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No registration requests found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <RegistrationReviewDialog 
          open={reviewDialog}
          onOpenChange={setReviewDialog}
          intent={selectedIntent}
          onSuccess={() => {
            dispatch(fetchAdminStats());
            dispatch(fetchAllRegistrationIntents({ page: 1 }));
          }}
        />

        <TabsContent value="system" className="space-y-6">
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
                  { action: 'New institute registration', time: '2 mins ago', type: 'success' },
                  { action: 'Business application reviewed', time: '15 mins ago', type: 'info' },
                  { action: 'Subscription granted', time: '1 hour ago', type: 'success' },
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
    </div>
  );
}