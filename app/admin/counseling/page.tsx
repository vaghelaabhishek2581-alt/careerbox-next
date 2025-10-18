'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  HeadphonesIcon, 
  Search, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Download,
  BookOpen,
  Target
} from 'lucide-react';

interface CounselingRequest {
  id: string;
  studentName: string;
  userId: string;
  phone: string;
  currentEducation: string;
  careerInterests: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  requestDate: string;
  description: string;
  counselorAssigned?: string;
}

const mockRequests: CounselingRequest[] = [
  {
    id: '1',
    studentName: 'Rahul Sharma',
    userId: 'user_123',
    phone: '+91 9876543210',
    currentEducation: 'B.Tech Computer Science - 3rd Year',
    careerInterests: ['Software Development', 'Data Science'],
    urgencyLevel: 'high',
    status: 'pending',
    requestDate: '2024-01-15T10:30:00Z',
    description: 'Need guidance on career path between software development and data science.',
    counselorAssigned: 'Dr. Priya Mehta'
  },
  {
    id: '2',
    studentName: 'Priya Patel',
    userId: 'user_456',
    phone: '+91 9876543211',
    currentEducation: 'MBA - 1st Year',
    careerInterests: ['Marketing', 'Business Development'],
    urgencyLevel: 'medium',
    status: 'in_progress',
    requestDate: '2024-01-14T14:20:00Z',
    description: 'Want to understand career opportunities in marketing.',
    counselorAssigned: 'Prof. Ankit Kumar'
  },
  {
    id: '3',
    studentName: 'Arjun Singh',
    userId: 'user_789',
    phone: '+91 9876543212',
    currentEducation: 'B.Com - 2nd Year',
    careerInterests: ['Finance', 'Investment Banking'],
    urgencyLevel: 'urgent',
    status: 'assigned',
    requestDate: '2024-01-16T09:15:00Z',
    description: 'Need immediate guidance on finance career options and certification requirements.'
  }
];

export default function CareerCounselingPage() {
  const [requests, setRequests] = useState<CounselingRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<CounselingRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [response, setResponse] = useState('');

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.careerInterests.some(interest => 
                           interest.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      assigned: { color: 'bg-blue-100 text-blue-800', icon: User },
      in_progress: { color: 'bg-purple-100 text-purple-800', icon: HeadphonesIcon },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const handleViewRequest = (request: CounselingRequest) => {
    setSelectedRequest(request);
    setResponse('');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (requestId: string, newStatus: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: newStatus as any } : req
    ));
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HeadphonesIcon className="h-5 w-5 text-blue-600" />
            Career Counseling
          </h1>
          <p className="text-sm text-gray-600">Manage counseling requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm"><Plus className="h-4 w-4 mr-1" />Schedule</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-700">{stats.total}</p>
              <p className="text-xs text-blue-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-lg font-bold text-yellow-700">{stats.pending}</p>
              <p className="text-xs text-yellow-600">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-lg font-bold text-purple-700">{stats.inProgress}</p>
              <p className="text-xs text-purple-600">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-lg font-bold text-green-700">{stats.completed}</p>
              <p className="text-xs text-green-600">Done</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compact Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or interests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">Active</SelectItem>
            <SelectItem value="completed">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Compact Requests List */}
      <div className="space-y-3">
        {filteredRequests.map((request) => {
          const statusConfig = getStatusConfig(request.status);
          const StatusIcon = statusConfig.icon;

          return (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <h3 className="font-semibold text-gray-900">{request.studentName}</h3>
                    </div>
                    <Badge className={statusConfig.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {request.status}
                    </Badge>
                    <Badge variant="outline" className={
                      request.urgencyLevel === 'urgent' ? 'border-red-300 text-red-700' :
                      request.urgencyLevel === 'high' ? 'border-orange-300 text-orange-700' :
                      request.urgencyLevel === 'medium' ? 'border-blue-300 text-blue-700' :
                      'border-gray-300 text-gray-700'
                    }>
                      {request.urgencyLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewRequest(request)}>
                      <Eye className="h-4 w-4 mr-1" />Details
                    </Button>
                    <Select value={request.status} onValueChange={(value) => handleUpdateStatus(request.id, value)}>
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in_progress">Active</SelectItem>
                        <SelectItem value="completed">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span>{request.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="h-3 w-3" />
                    <span className="truncate">{request.currentEducation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Target className="h-3 w-3" />
                    <span className="truncate">{request.careerInterests.join(', ')}</span>
                  </div>
                </div>
                
                {request.counselorAssigned && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">Counselor: </span>
                    <span className="font-medium text-blue-600">{request.counselorAssigned}</span>
                  </div>
                )}
                
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">{request.description}</p>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <HeadphonesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No counseling requests found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Full Screen Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Career Counseling Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">Student Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span><strong>Name:</strong> {selectedRequest.studentName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span><strong>Phone:</strong> {selectedRequest.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span><strong>Education:</strong> {selectedRequest.currentEducation}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">Request Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Status:</strong> 
                      <Badge className={`${getStatusConfig(selectedRequest.status).color} ml-2`}>
                        {selectedRequest.status}
                      </Badge>
                    </p>
                    <p><strong>Urgency:</strong> 
                      <Badge variant="outline" className={`ml-2 ${
                        selectedRequest.urgencyLevel === 'urgent' ? 'border-red-300 text-red-700' :
                        selectedRequest.urgencyLevel === 'high' ? 'border-orange-300 text-orange-700' :
                        'border-blue-300 text-blue-700'
                      }`}>
                        {selectedRequest.urgencyLevel}
                      </Badge>
                    </p>
                    <p><strong>Date:</strong> {new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                    {selectedRequest.counselorAssigned && (
                      <p><strong>Counselor:</strong> {selectedRequest.counselorAssigned}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Career Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.careerInterests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Description</h3>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                  {selectedRequest.description}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Admin Response</h3>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response or assign a counselor..."
                  rows={3}
                  className="text-sm"
                />
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                  <Select value={selectedRequest.status} onValueChange={(value) => handleUpdateStatus(selectedRequest.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">Active</SelectItem>
                      <SelectItem value="completed">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                  <Button>Save & Respond</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
