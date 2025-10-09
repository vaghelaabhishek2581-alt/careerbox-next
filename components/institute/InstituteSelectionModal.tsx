'use client'

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import { fetchUserInstitutes, setSelectedInstitute } from '@/lib/redux/slices/instituteSlice'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Users, GraduationCap, BookOpen, CheckCircle } from 'lucide-react'

interface InstituteSelectionModalProps {
  isOpen: boolean
  onClose?: () => void
  title?: string
  description?: string
}

export const InstituteSelectionModal: React.FC<InstituteSelectionModalProps> = ({
  isOpen,
  onClose,
  title = "Select Institute",
  description = "Please select an institute to continue"
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { userInstitutes, selectedInstitute, loading } = useSelector((state: RootState) => state.institute)

  useEffect(() => {
    if (isOpen && userInstitutes.length === 0) {
      dispatch(fetchUserInstitutes())
    }
  }, [isOpen, userInstitutes.length, dispatch])

  const handleSelectInstitute = (institute: any) => {
    dispatch(setSelectedInstitute(institute))
    onClose?.()
  }

  const handleCreateInstitute = () => {
    // Navigate to institute creation page
    window.location.href = '/register/institute'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            {title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading institutes...</span>
            </div>
          ) : userInstitutes.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Institutes Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You don't have any institutes registered yet. Create your first institute to get started.
              </p>
              <Button onClick={handleCreateInstitute} className="bg-orange-600 hover:bg-orange-700">
                <Building2 className="h-4 w-4 mr-2" />
                Create Institute
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userInstitutes.map((institute) => (
                <Card 
                  key={institute._id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedInstitute?._id === institute._id 
                      ? 'ring-2 ring-orange-600 bg-orange-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectInstitute(institute)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {institute.name}
                          {institute.isVerified && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {selectedInstitute?._id === institute._id && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Selected
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {institute.address.city}, {institute.address.state}
                        </CardDescription>
                      </div>
                      {institute.logo && (
                        <img 
                          src={institute.logo} 
                          alt={`${institute.name} logo`}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-blue-600" />
                        <span className="text-muted-foreground">Students:</span>
                        <span className="font-medium">{institute.studentCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3 text-green-600" />
                        <span className="text-muted-foreground">Faculty:</span>
                        <span className="font-medium">{institute.facultyCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-purple-600" />
                        <span className="text-muted-foreground">Courses:</span>
                        <span className="font-medium">{institute.courseCount || 0}</span>
                      </div>
                    </div>
                    
                    {institute.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {institute.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <Badge 
                        variant={institute.status === 'active' ? 'default' : 'secondary'}
                        className={
                          institute.status === 'active' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                            : ''
                        }
                      >
                        {institute.status}
                      </Badge>
                      
                      {institute.establishmentYear && (
                        <span className="text-xs text-muted-foreground">
                          Est. {institute.establishmentYear}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {userInstitutes.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleCreateInstitute}
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Create New Institute
              </Button>
              
              {selectedInstitute && (
                <Button 
                  onClick={() => onClose?.()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Continue with {selectedInstitute.name}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InstituteSelectionModal
