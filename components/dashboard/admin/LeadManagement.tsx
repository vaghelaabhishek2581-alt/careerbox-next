import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import { fetchLeads, updateLeadStatus, convertLead } from '@/lib/redux/slices/leadSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'

export default function LeadManagement() {
  const dispatch = useDispatch<AppDispatch>()
  const { leads, loading, error } = useSelector((state: RootState) => state.leads)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [notes, setNotes] = useState('')
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')

  useEffect(() => {
    dispatch(fetchLeads({ status: 'pending' }))
  }, [dispatch])

  const handleStatusUpdate = async () => {
    if (!selectedLead || !statusUpdate) return

    try {
      await dispatch(updateLeadStatus({
        leadId: selectedLead.id,
        status: statusUpdate as any,
        notes
      })).unwrap()
      
      setSelectedLead(null)
      setStatusUpdate('')
      setNotes('')
      dispatch(fetchLeads({ status: 'pending' }))
    } catch (error) {
      console.error('Failed to update lead status:', error)
    }
  }

  const handleConvertLead = async () => {
    if (!selectedLead || !selectedPlan) return

    try {
      await dispatch(convertLead({
        leadId: selectedLead.id,
        subscriptionPlan: selectedPlan
      })).unwrap()
      
      setConvertDialogOpen(false)
      setSelectedLead(null)
      setSelectedPlan('')
      dispatch(fetchLeads({ status: 'pending' }))
    } catch (error) {
      console.error('Failed to convert lead:', error)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'default'
      case 'contacted': return 'secondary'
      case 'converted': return 'default'
      case 'rejected': return 'destructive'
      default: return 'outline'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading leads...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lead Management</h2>
        <Badge variant="outline">{leads.length} pending leads</Badge>
      </div>

      <div className="grid gap-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {lead.type === 'business' ? lead.businessData?.companyName : lead.instituteData?.instituteName}
                  </CardTitle>
                  <CardDescription>
                    {lead.type === 'business' ? lead.businessData?.industry : lead.instituteData?.type}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(lead.status)}>
                    {lead.status}
                  </Badge>
                  <Badge variant="outline">
                    {lead.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {lead.type === 'business' 
                    ? lead.businessData?.description 
                    : lead.instituteData?.description
                  }
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Contact: {lead.type === 'business' 
                    ? lead.businessData?.contactPerson.name 
                    : lead.instituteData?.contactPerson.name
                  }</span>
                  <span>Email: {lead.type === 'business' 
                    ? lead.businessData?.contactPerson.email 
                    : lead.instituteData?.contactPerson.email
                  }</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedLead(lead)}
                  >
                    Update Status
                  </Button>
                  {lead.status === 'contacted' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedLead(lead)
                        setConvertDialogOpen(true)
                      }}
                    >
                      Convert to Subscription
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Update Dialog */}
      <Dialog open={!!selectedLead && !convertDialogOpen} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedLead?.type === 'business' 
                ? selectedLead?.businessData?.companyName 
                : selectedLead?.instituteData?.instituteName
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={statusUpdate} onValueChange={setStatusUpdate}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Add notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLead(null)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert Lead Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Lead to Subscription</DialogTitle>
            <DialogDescription>
              Select a subscription plan for {selectedLead?.type === 'business' 
                ? selectedLead?.businessData?.companyName 
                : selectedLead?.instituteData?.instituteName
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Select subscription plan" />
              </SelectTrigger>
              <SelectContent>
                {selectedLead?.type === 'business' ? (
                  <>
                    <SelectItem value="business_basic">Business Basic - $29.99/month</SelectItem>
                    <SelectItem value="business_pro">Business Pro - $99.99/month</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="institute_basic">Institute Basic - $39.99/month</SelectItem>
                    <SelectItem value="institute_pro">Institute Pro - $129.99/month</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConvertLead} disabled={!selectedPlan}>
              Convert Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
