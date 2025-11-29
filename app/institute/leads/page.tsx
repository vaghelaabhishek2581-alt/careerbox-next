"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/src/hooks/use-toast';
import { RefreshCw, Search, Download, Lock } from 'lucide-react';
import { IStudentLead } from '@/src/models/StudentLead';

const statusColors: { [key: string]: string } = {
  new: 'bg-blue-500',
  contacted: 'bg-yellow-500',
  qualified: 'bg-green-500',
  enrolled: 'bg-purple-500',
  rejected: 'bg-red-500',
};

export default function InstituteLeadsPage() {
  const [leads, setLeads] = useState<IStudentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isPaidPlan, setIsPaidPlan] = useState(true);
  const [leadsCount, setLeadsCount] = useState(0);
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/institute/leads');
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      if (data.isPaid === false) {
        setIsPaidPlan(false);
        setLeadsCount(data.count || 0);
        setLeads([]);
      } else {
        setIsPaidPlan(true);
        setLeads(data.data || []);
        setLeadsCount(data.count || 0);
      }
    } catch (e: any) {
      toast({ title: 'Failed to load leads', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/institute/leads`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.isPaid === false) {
          toast({
            title: 'Upgrade Required',
            description: 'Please upgrade your plan to manage leads.',
            action: (
              <Button variant="outline" onClick={() => window.open('/pricing', '_blank')}>
                Upgrade Now
              </Button>
            ),
          });
          return;
        }
        throw new Error(data.message || 'Failed to update status');
      }
      
      toast({ title: 'Status updated' });
      fetchLeads(); // Refresh leads after update
    } catch (e: any) {
      toast({ 
        title: 'Failed to update status', 
        description: e.message, 
        variant: 'destructive' 
      });
    }
  };

  const filteredLeads = useMemo(() => {
    if (!isPaidPlan) return [];
    
    return leads
      .filter(lead => statusFilter === 'all' || lead.status === statusFilter)
      .filter(lead =>
        lead.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [leads, searchTerm, statusFilter, isPaidPlan]);

  const stats = useMemo(() => {
    return leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }, [leads]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Student Leads</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {['new', 'contacted', 'qualified', 'enrolled', 'rejected'].map(status => {
          const count = isPaidPlan ? (stats[status] || 0) : 0;
          return (
            <Card key={status} className={!isPaidPlan ? 'opacity-70' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {status}
                  {!isPaidPlan && <span className="ml-2 text-xs text-muted-foreground">(Upgrade to view)</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {!isPaidPlan ? '--' : count}
                </div>
                {!isPaidPlan && status === 'new' && (
                  <p className="text-xs text-muted-foreground mt-1">{leadsCount} total leads</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, course..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchLeads} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isPaidPlan ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-8">
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Upgrade to view leads</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          You have {leadsCount} leads waiting. Upgrade your plan to view and manage them.
                        </p>
                      </div>
                      <Button onClick={() => window.open('/pricing', '_blank')} className="mt-4">
                        Upgrade Now
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No leads found.</TableCell></TableRow>
              ) : (
                filteredLeads.map(lead => (
                  <TableRow key={lead._id.toString()}>
                    <TableCell>{lead.fullName}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone || 'N/A'}</TableCell>
                    <TableCell>{lead.courseName || 'N/A'}</TableCell>
                    <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select value={lead.status} onValueChange={(newStatus) => handleStatusChange(lead._id.toString(), newStatus)}>
                        <SelectTrigger className={`w-[120px] focus:ring-0 border-none ${statusColors[lead.status] || 'bg-gray-500'} text-white`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="enrolled">Enrolled</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
