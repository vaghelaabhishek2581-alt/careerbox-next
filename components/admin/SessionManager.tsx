'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Shield, 
  User, 
  Clock, 
  Trash2, 
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { API } from '@/lib/api/services'

interface Session {
  tokenId: string
  userId: string
  email: string
  createdAt: string
  expiresAt: string
  user: {
    name: string
    role: string
    activeRole: string
    lastLoginAt: string
    provider: string
  }
}

interface SessionsResponse {
  sessions: Session[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null)

  const fetchSessions = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await API.admin.getSessions(page, 20)
      
      if (response.success) {
        setSessions(response.data.sessions)
        setTotalPages(response.data.pagination.pages)
        setCurrentPage(response.data.pagination.page)
      } else {
        toast.error(response.error || 'Failed to fetch sessions')
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error('Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }

  const terminateSession = async (tokenId: string) => {
    try {
      setTerminatingSession(tokenId)
      const response = await API.admin.terminateSession(tokenId)
      
      if (response.success) {
        toast.success('Session terminated successfully')
        fetchSessions(currentPage)
      } else {
        toast.error(response.error || 'Failed to terminate session')
      }
    } catch (error) {
      console.error('Error terminating session:', error)
      toast.error('Failed to terminate session')
    } finally {
      setTerminatingSession(null)
    }
  }

  const terminateAllUserSessions = async (userId: string, userEmail: string) => {
    try {
      const response = await API.admin.terminateAllUserSessions(userId)
      
      if (response.success) {
        toast.success(`All sessions terminated for ${userEmail}`)
        fetchSessions(currentPage)
      } else {
        toast.error(response.error || 'Failed to terminate user sessions')
      }
    } catch (error) {
      console.error('Error terminating user sessions:', error)
      toast.error('Failed to terminate user sessions')
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const filteredSessions = sessions.filter(session =>
    session.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'business': return 'bg-blue-100 text-blue-800'
      case 'institute': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Manage active user sessions and terminate them if necessary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Session Management
        </CardTitle>
        <CardDescription>
          Manage active user sessions and terminate them if necessary
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Sessions Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.tokenId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.user.name}</div>
                        <div className="text-sm text-gray-500">{session.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(session.user.activeRole || session.user.role)}>
                        {session.user.activeRole || session.user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {session.user.provider}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(session.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {getTimeRemaining(session.expiresAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={terminatingSession === session.tokenId}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Terminate Session</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to terminate this session for{' '}
                                <strong>{session.user.name}</strong> ({session.email})?
                                <br />
                                <br />
                                This will log them out immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => terminateSession(session.tokenId)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Terminate Session
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Terminate All User Sessions</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to terminate ALL sessions for{' '}
                                <strong>{session.user.name}</strong> ({session.email})?
                                <br />
                                <br />
                                This will log them out from all devices immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => terminateAllUserSessions(session.userId, session.email)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Terminate All Sessions
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchSessions(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchSessions(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sessions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
