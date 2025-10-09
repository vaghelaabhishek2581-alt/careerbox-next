'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchAllPayments,
  processRefund,
  updatePaymentStatus,
  setFilters,
  setCurrentPage,
  setSelectedPayment
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
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPaymentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { payments, loading, error, filters, currentPage, totalPages, totalItems } = useSelector(
    (state: RootState) => state.admin
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planTypeFilter, setPlanTypeFilter] = useState('');
  const [refundDialog, setRefundDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedPayment, setSelectedPaymentLocal] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    dispatch(fetchAllPayments({ page: 1 }));
  }, [dispatch]);

  const handleSearch = () => {
    const newFilters = {
      search: searchTerm,
      status: statusFilter,
      planType: planTypeFilter,
    };
    dispatch(setFilters(newFilters));
    dispatch(fetchAllPayments({ page: 1, filters: newFilters }));
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;

    try {
      await dispatch(processRefund({
        paymentId: selectedPayment.id,
        amount: refundAmount ? parseFloat(refundAmount) : undefined,
        reason: refundReason,
      })).unwrap();

      setRefundDialog(false);
      setRefundAmount('');
      setRefundReason('');
      setSelectedPaymentLocal(null);

      // Refresh payments list
      dispatch(fetchAllPayments({ page: currentPage, filters }));
    } catch (error) {
      console.error('Refund failed:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedPayment || !newStatus) return;

    try {
      await dispatch(updatePaymentStatus({
        paymentId: selectedPayment.id,
        status: newStatus as any,
        notes: statusNotes,
      })).unwrap();

      setStatusDialog(false);
      setNewStatus('');
      setStatusNotes('');
      setSelectedPaymentLocal(null);

      // Refresh payments list
      dispatch(fetchAllPayments({ page: currentPage, filters }));
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      created: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      refunded: { color: 'bg-blue-100 text-blue-800', icon: RotateCcw },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.created;
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Calculate stats
  const stats = {
    totalRevenue: payments.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0),
    totalPayments: payments.length,
    successfulPayments: payments.filter(p => p.status === 'paid').length,
    pendingPayments: payments.filter(p => ['created', 'pending'].includes(p.status)).length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage all payments across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => dispatch(fetchAllPayments({ page: currentPage, filters }))}>
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
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successfulPayments}</p>
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
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
                placeholder="Search payments..."
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
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planTypeFilter} onValueChange={setPlanTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payments ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading payments...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.userName}</p>
                        <p className="text-sm text-gray-500">{payment.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.organizationName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{payment.organizationType || 'Individual'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                      <p className="text-sm text-gray-500">{payment.planDuration} months</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {payment.planType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</p>
                        <p className="text-xs text-gray-500">{format(new Date(payment.createdAt), 'HH:mm')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>

                        {payment.status === 'paid' && (
                          <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPaymentLocal(payment)}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Process Refund</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Refund Amount (Leave empty for full refund)</Label>
                                  <Input
                                    type="number"
                                    placeholder={`Max: ${payment.amount}`}
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Reason for Refund *</Label>
                                  <Textarea
                                    placeholder="Enter reason for refund..."
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setRefundDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleRefund} disabled={!refundReason}>
                                    Process Refund
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {['created', 'pending', 'failed'].includes(payment.status) && (
                          <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPaymentLocal(payment)}
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Payment Status</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>New Status</Label>
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="paid">Paid</SelectItem>
                                      <SelectItem value="failed">Failed</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Notes</Label>
                                  <Textarea
                                    placeholder="Add notes about status change..."
                                    value={statusNotes}
                                    onChange={(e) => setStatusNotes(e.target.value)}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setStatusDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleStatusUpdate} disabled={!newStatus}>
                                    Update Status
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
