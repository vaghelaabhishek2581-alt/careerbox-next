import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import { fetchLeads } from '@/lib/redux/slices/leadSlice'
import { fetchBusinesses } from '@/lib/redux/slices/businessSlice'
import { fetchInstitutes } from '@/lib/redux/slices/instituteSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Building2, 
  GraduationCap, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  DollarSign,
  Server
} from 'lucide-react'
import Link from 'next/link'
import SystemHealthDashboard from '../admin/SystemHealthDashboard'
import EmailTemplateManager from '../admin/EmailTemplateManager'
import SessionManager from '../admin/SessionManager'

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { leads, loading: leadsLoading } = useSelector((state: RootState) => state.leads)
  const { businesses, loading: businessesLoading } = useSelector((state: RootState) => state.business)
  const { institutes, loading: institutesLoading } = useSelector((state: RootState) => state.institute)

  useEffect(() => {
    dispatch(fetchLeads({ status: 'pending' }))
    dispatch(fetchBusinesses())
    dispatch(fetchInstitutes())
  }, [dispatch])

  const pendingLeads = leads.filter(lead => lead.status === 'pending')
  const contactedLeads = leads.filter(lead => lead.status === 'contacted')
  const convertedLeads = leads.filter(lead => lead.status === 'converted')
  const verifiedBusinesses = businesses.filter(business => business.isVerified)
  const verifiedInstitutes = institutes.filter(institute => institute.isVerified)

  if (leadsLoading || businessesLoading || institutesLoading) {
    return <div className="flex items-center justify-center p-8">Loading admin dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the platform and oversee all activities</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4" />
          Admin Access
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leads</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              {contactedLeads.length} contacted, {convertedLeads.length} converted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businesses.length}</div>
            <p className="text-xs text-muted-foreground">
              {verifiedBusinesses.length} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Institutes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{institutes.length}</div>
            <p className="text-xs text-muted-foreground">
              {verifiedInstitutes.length} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground">
              System uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Lead Management</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="institutes">Institutes</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="system">System Health</TabsTrigger>
                  <TabsTrigger value="emails">Email Templates</TabsTrigger>
                  <TabsTrigger value="sessions">Session Management</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Leads */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Leads</CardTitle>
                  <Link href="/dashboard/admin/leads">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {lead.type === 'business' ? lead.businessData?.companyName : lead.instituteData?.instituteName}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">{lead.type}</p>
                      </div>
                      <Badge variant={
                        lead.status === 'pending' ? 'default' :
                        lead.status === 'contacted' ? 'secondary' :
                        lead.status === 'converted' ? 'default' : 'destructive'
                      }>
                        {lead.status}
                      </Badge>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <p className="text-sm text-muted-foreground">No leads available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Platform Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Total Users</span>
                    </div>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Active Businesses</span>
                    </div>
                    <span className="font-medium">{businesses.filter(b => b.status === 'active').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Active Institutes</span>
                    </div>
                    <span className="font-medium">{institutes.filter(i => i.status === 'active').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Monthly Revenue</span>
                    </div>
                    <span className="font-medium">$12,345</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lead Management</h3>
            <Badge variant="outline">{leads.length} total leads</Badge>
          </div>
          <div className="grid gap-4">
            {leads.map((lead) => (
              <Card key={lead.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {lead.type === 'business' ? lead.businessData?.companyName : lead.instituteData?.instituteName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="capitalize">{lead.type}</span>
                        <span>Created: {new Date(lead.createdAt).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        lead.status === 'pending' ? 'default' :
                        lead.status === 'contacted' ? 'secondary' :
                        lead.status === 'converted' ? 'default' : 'destructive'
                      }>
                        {lead.status}
                      </Badge>
                      <Link href={`/dashboard/admin/leads/${lead.id}`}>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {lead.type === 'business' 
                      ? lead.businessData?.description 
                      : lead.instituteData?.description
                    }
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Contact: {lead.type === 'business' 
                      ? lead.businessData?.contactPerson.name 
                      : lead.instituteData?.contactPerson.name
                    }</span>
                    <span>Email: {lead.type === 'business' 
                      ? lead.businessData?.contactPerson.email 
                      : lead.instituteData?.contactPerson.email
                    }</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {leads.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No leads available</h3>
                  <p className="mt-1 text-sm text-gray-500">Leads will appear here when users create business or institute profiles.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="businesses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Business Management</h3>
            <Badge variant="outline">{businesses.length} total businesses</Badge>
          </div>
          <div className="grid gap-4">
            {businesses.map((business) => (
              <Card key={business.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{business.companyName}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span>{business.industry}</span>
                        <span>{business.size}</span>
                        <span>Created: {new Date(business.createdAt).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={business.isVerified ? 'default' : 'secondary'}>
                        {business.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                      <Badge variant={business.status === 'active' ? 'default' : 'destructive'}>
                        {business.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{business.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{business.address.city}, {business.address.country}</span>
                    <span>Contact: {business.contactInfo.email}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="institutes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Institute Management</h3>
            <Badge variant="outline">{institutes.length} total institutes</Badge>
          </div>
          <div className="grid gap-4">
            {institutes.map((institute) => (
              <Card key={institute.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{institute.instituteName}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span>{institute.type}</span>
                        <span>Created: {new Date(institute.createdAt).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={institute.isVerified ? 'default' : 'secondary'}>
                        {institute.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                      <Badge variant={institute.status === 'active' ? 'default' : 'destructive'}>
                        {institute.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{institute.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{institute.address.city}, {institute.address.country}</span>
                    <span>Contact: {institute.contactInfo.email}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <h3 className="text-lg font-semibold">User Management</h3>
          <Card>
            <CardContent className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">User management</h3>
              <p className="mt-1 text-sm text-gray-500">View and manage all platform users, roles, and permissions.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemHealthDashboard />
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <EmailTemplateManager />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <SessionManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h3 className="text-lg font-semibold">Platform Analytics</h3>
          <Card>
            <CardContent className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics dashboard</h3>
              <p className="mt-1 text-sm text-gray-500">View detailed platform analytics, user engagement, and performance metrics.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
