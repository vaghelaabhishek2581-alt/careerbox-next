"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";

interface SystemHealth {
  api: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    uptime: number;
    errorRate: number;
  };
  database: {
    status: 'healthy' | 'degraded' | 'down';
    connectionCount: number;
    queryTime: number;
    size: number;
  };
  server: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: number;
  };
  payment: {
    razorpay: 'healthy' | 'degraded' | 'down';
    payu: 'healthy' | 'degraded' | 'down';
    successRate: number;
  };
}

interface PlatformStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  businesses: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  institutes: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  jobs: {
    total: number;
    active: number;
    postedToday: number;
    growth: number;
  };
  courses: {
    total: number;
    active: number;
    createdToday: number;
    growth: number;
  };
  revenue: {
    total: number;
    monthly: number;
    daily: number;
    growth: number;
  };
}

export default function SystemHealthDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/admin/system-health');
      const data = await response.json();
      setSystemHealth(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const fetchPlatformStats = async () => {
    try {
      const response = await fetch('/api/admin/platform-stats');
      const data = await response.json();
      setPlatformStats(data);
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSystemHealth(), fetchPlatformStats()]);
      setIsLoading(false);
    };

    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-500">Degraded</Badge>;
      case 'down':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={() => {
          setIsLoading(true);
          Promise.all([fetchSystemHealth(), fetchPlatformStats()]).finally(() => setIsLoading(false));
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
            {systemHealth && getStatusIcon(systemHealth.api.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.api.responseTime || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {systemHealth?.api.uptime || 0}%
            </p>
            {systemHealth && getStatusBadge(systemHealth.api.status)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            {systemHealth && getStatusIcon(systemHealth.database.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.database.connectionCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Query time: {systemHealth?.database.queryTime || 0}ms
            </p>
            {systemHealth && getStatusBadge(systemHealth.database.status)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server CPU</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.server.cpu || 0}%
            </div>
            <Progress value={systemHealth?.server.cpu || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.server.memory || 0}%
            </div>
            <Progress value={systemHealth?.server.memory || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Health Monitoring */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Gateway Status */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway Status</CardTitle>
                <CardDescription>Real-time payment service monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span>Razorpay</span>
                  </div>
                  {systemHealth && getStatusBadge(systemHealth.payment.razorpay)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span>PayU</span>
                  </div>
                  {systemHealth && getStatusBadge(systemHealth.payment.payu)}
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-sm">{systemHealth?.payment.successRate || 0}%</span>
                  </div>
                  <Progress value={systemHealth?.payment.successRate || 0} />
                </div>
              </CardContent>
            </Card>

            {/* Platform Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>Real-time platform metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {platformStats && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Total Users</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{platformStats.users.total.toLocaleString()}</div>
                        <div className="text-xs text-green-600">+{platformStats.users.growth}%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Active Jobs</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{platformStats.jobs.active.toLocaleString()}</div>
                        <div className="text-xs text-green-600">+{platformStats.jobs.growth}%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Monthly Revenue</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{platformStats.revenue.monthly.toLocaleString()}</div>
                        <div className="text-xs text-green-600">+{platformStats.revenue.growth}%</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>API endpoint performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Authentication</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                      </div>
                      <span className="text-sm">85ms</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Search API</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }} />
                      </div>
                      <span className="text-sm">120ms</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment API</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }} />
                      </div>
                      <span className="text-sm">95ms</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rates</CardTitle>
                <CardDescription>System error monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>API Errors</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }} />
                      </div>
                      <span className="text-sm">0.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database Errors</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }} />
                      </div>
                      <span className="text-sm">0.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment Errors</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '85%' }} />
                      </div>
                      <span className="text-sm">1.5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Real-time user engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12" />
                  <span className="ml-2">Activity chart will be implemented</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Payment and subscription metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <PieChart className="h-12 w-12" />
                  <span className="ml-2">Revenue chart will be implemented</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system events and errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[
                  { time: '14:32:15', level: 'INFO', message: 'User authentication successful', service: 'Auth' },
                  { time: '14:31:42', level: 'WARN', message: 'High memory usage detected', service: 'Server' },
                  { time: '14:30:18', level: 'INFO', message: 'Payment processed successfully', service: 'Payment' },
                  { time: '14:29:55', level: 'ERROR', message: 'Database connection timeout', service: 'Database' },
                  { time: '14:28:33', level: 'INFO', message: 'New user registration', service: 'Auth' },
                ].map((log, index) => (
                  <div key={index} className="flex items-center gap-4 p-2 border rounded">
                    <span className="text-xs text-muted-foreground w-16">{log.time}</span>
                    <Badge 
                      variant={log.level === 'ERROR' ? 'destructive' : log.level === 'WARN' ? 'secondary' : 'default'}
                      className="w-16 text-xs"
                    >
                      {log.level}
                    </Badge>
                    <span className="text-xs text-muted-foreground w-20">{log.service}</span>
                    <span className="text-sm flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
