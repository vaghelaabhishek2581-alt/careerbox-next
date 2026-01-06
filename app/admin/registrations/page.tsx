'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchAllRegistrationIntents,
  reviewRegistrationIntent,
  grantFreeSubscription,
  setFilters,
  setCurrentPage,
  setSelectedIntent
} from '@/lib/redux/slices/adminSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Briefcase,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Mail,
  Phone,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

import { RegistrationReviewDialog } from '@/components/admin/RegistrationReviewDialog';

export default function AdminRegistrationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { registrationIntents, loading, error, filters, currentPage, totalPages, totalItems } = useSelector(
    (state: RootState) => state.admin
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [reviewDialog, setReviewDialog] = useState(false);
  // const [grantDialog, setGrantDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedIntent, setSelectedIntentLocal] = useState<any>(null);
  const [viewingIntent, setViewingIntent] = useState<any>(null);
  // const [grantSuccess, setGrantSuccess] = useState(false);
  // const [grantError, setGrantError] = useState('');
  // const [grantLoading, setGrantLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAllRegistrationIntents({ page: 1 }));
  }, [dispatch]);

  const handleSearch = () => {
    const newFilters: any = {};
    if (searchTerm) newFilters.search = searchTerm;
    if (statusFilter && statusFilter !== 'all') newFilters.status = statusFilter;
    if (typeFilter && typeFilter !== 'all') newFilters.type = typeFilter;
    
    dispatch(setFilters(newFilters));
    dispatch(fetchAllRegistrationIntents({ page: 1, filters: newFilters }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      payment_required: { color: 'bg-blue-100 text-blue-800', icon: CreditCard },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    return type === 'institute' ? Building2 : Briefcase;
  };

  // Calculate stats
  const stats = {
    totalRegistrations: registrationIntents.length,
    pendingReview: registrationIntents.filter(r => r.status === 'pending').length,
    approved: registrationIntents.filter(r => r.status === 'approved').length,
    completed: registrationIntents.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registration Management</h1>
          <p className="text-gray-600 mt-2">
            Review and manage institute and business registration requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => dispatch(fetchAllRegistrationIntents({ page: currentPage, filters }))}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRegistrations}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="payment_required">Payment Required</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="institute">Institute</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Requests ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading registrations...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Admin Institute</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrationIntents.map((intent) => {
                  const TypeIcon = getTypeIcon(intent.type);
                  return (
                    <TableRow key={intent.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${intent.type === 'institute' ? 'bg-orange-100' : 'bg-purple-100'}`}>
                            <TypeIcon className={`h-5 w-5 ${intent.type === 'institute' ? 'text-orange-600' : 'text-purple-600'}`} />
                          </div>
                          <div>
                            <p className="font-medium">{intent.organizationName}</p>
                            <p className="text-sm text-gray-500">{intent.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{intent.contactName}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {intent.contactPhone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{intent.city}, {intent.state}</p>
                          <p className="text-sm text-gray-500">{intent.country}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={intent.type === 'institute' ? 'outline' : 'secondary'} className="capitalize">
                          {intent.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {intent.type === 'institute' ? (
                          intent.isAdminInstitute ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(intent.status)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{format(new Date(intent.createdAt), 'MMM dd, yyyy')}</p>
                          <p className="text-xs text-gray-500">{format(new Date(intent.createdAt), 'HH:mm')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog open={viewDialog} onOpenChange={setViewDialog}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setViewingIntent(intent);
                                  setViewDialog(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Registration Details</DialogTitle>
                              </DialogHeader>
                              {viewingIntent && (
                                <div className="space-y-6">
                                  {/* Header with status */}
                                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-3 rounded-lg ${viewingIntent.type === 'institute' ? 'bg-orange-100' : 'bg-purple-100'}`}>
                                        {viewingIntent.type === 'institute' ? (
                                          <Building2 className={`h-6 w-6 text-orange-600`} />
                                        ) : (
                                          <Briefcase className={`h-6 w-6 text-purple-600`} />
                                        )}
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-semibold">{viewingIntent.organizationName}</h3>
                                        <p className="text-sm text-gray-600 capitalize">{viewingIntent.type}</p>
                                      </div>
                                    </div>
                                    {getStatusBadge(viewingIntent.status)}
                                  </div>

                                  {/* Basic Information */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <h4 className="font-semibold text-gray-900 border-b pb-2">Contact Information</h4>
                                      <div className="space-y-3">
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Contact Person</Label>
                                          <p className="text-sm text-gray-900">{viewingIntent.contactName}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Email</Label>
                                          <p className="text-sm text-gray-900 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            {viewingIntent.email}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Phone</Label>
                                          <p className="text-sm text-gray-900 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            {viewingIntent.contactPhone}
                                          </p>
                                        </div>
                                        {viewingIntent.website && (
                                          <div>
                                            <Label className="text-sm font-medium text-gray-700">Website</Label>
                                            <p className="text-sm text-blue-600 hover:underline">
                                              <a href={viewingIntent.website} target="_blank" rel="noopener noreferrer">
                                                {viewingIntent.website}
                                              </a>
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <h4 className="font-semibold text-gray-900 border-b pb-2">Organization Details</h4>
                                      <div className="space-y-3">
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Address</Label>
                                          <p className="text-sm text-gray-900 flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                            <span>
                                              {viewingIntent.address}<br />
                                              {viewingIntent.city}, {viewingIntent.state}<br />
                                              {viewingIntent.country}
                                              {viewingIntent.zipCode && ` - ${viewingIntent.zipCode}`}
                                            </span>
                                          </p>
                                        </div>
                                        {viewingIntent.establishmentYear && (
                                          <div>
                                            <Label className="text-sm font-medium text-gray-700">Establishment Year</Label>
                                            <p className="text-sm text-gray-900 flex items-center gap-2">
                                              <Calendar className="w-4 h-4 text-gray-500" />
                                              {viewingIntent.establishmentYear}
                                            </p>
                                          </div>
                                        )}
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Applied On</Label>
                                          <p className="text-sm text-gray-900 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            {format(new Date(viewingIntent.createdAt), 'MMMM dd, yyyy \'at\' HH:mm')}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  {viewingIntent.description && (
                                    <div>
                                      <h4 className="font-semibold text-gray-900 border-b pb-2 mb-3">Description</h4>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingIntent.description}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Admin Notes (if any) */}
                                  {viewingIntent.adminNotes && (
                                    <div>
                                      <h4 className="font-semibold text-gray-900 border-b pb-2 mb-3">Admin Notes</h4>
                                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingIntent.adminNotes}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Timeline */}
                                  <div>
                                    <h4 className="font-semibold text-gray-900 border-b pb-2 mb-3">Timeline</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-3 text-sm">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-gray-600">Submitted:</span>
                                        <span className="font-medium">{format(new Date(viewingIntent.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                                      </div>
                                      {viewingIntent.updatedAt && viewingIntent.updatedAt !== viewingIntent.createdAt && (
                                        <div className="flex items-center gap-3 text-sm">
                                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                          <span className="text-gray-600">Last Updated:</span>
                                          <span className="font-medium">{format(new Date(viewingIntent.updatedAt), 'MMM dd, yyyy HH:mm')}</span>
                                        </div>
                                      )}
                                      {viewingIntent.completedAt && (
                                        <div className="flex items-center gap-3 text-sm">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-gray-600">Completed:</span>
                                          <span className="font-medium">{format(new Date(viewingIntent.completedAt), 'MMM dd, yyyy HH:mm')}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex justify-end">
                                    <Button variant="outline" onClick={() => setViewDialog(false)}>
                                      Close
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedIntentLocal(intent);
                              setReviewDialog(true);
                            }}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          
                          <RegistrationReviewDialog 
                            open={reviewDialog && selectedIntent?.id === intent.id}
                            onOpenChange={(open) => {
                              setReviewDialog(open);
                              if (!open) setSelectedIntentLocal(null);
                            }}
                            intent={intent}
                            onSuccess={() => dispatch(fetchAllRegistrationIntents({ page: currentPage, filters }))}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
