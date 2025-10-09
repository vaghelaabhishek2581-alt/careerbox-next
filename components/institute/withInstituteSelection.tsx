'use client'

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import { fetchUserInstitutes } from '@/lib/redux/slices/instituteSlice'
import InstituteSelectionModal from './InstituteSelectionModal'

interface WithInstituteSelectionProps {
  requireInstitute?: boolean
  title?: string
  description?: string
}

export function withInstituteSelection<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithInstituteSelectionProps = {}
) {
  const {
    requireInstitute = true,
    title = "Select Institute",
    description = "Please select an institute to continue"
  } = options

  return function WithInstituteSelectionComponent(props: P) {
    const dispatch = useDispatch<AppDispatch>()
    const { selectedInstitute, userInstitutes, loading } = useSelector((state: RootState) => state.institute)
    const [showModal, setShowModal] = useState(false)
    const [hasCheckedInstitutes, setHasCheckedInstitutes] = useState(false)

    useEffect(() => {
      // Fetch user institutes on component mount if not already loaded
      if (userInstitutes.length === 0 && !loading && !hasCheckedInstitutes) {
        dispatch(fetchUserInstitutes()).finally(() => {
          setHasCheckedInstitutes(true)
        })
      } else if (userInstitutes.length > 0) {
        setHasCheckedInstitutes(true)
      }
    }, [dispatch, userInstitutes.length, loading, hasCheckedInstitutes])

    useEffect(() => {
      // Show modal if institute is required but none is selected
      if (
        requireInstitute && 
        hasCheckedInstitutes && 
        !selectedInstitute && 
        !loading
      ) {
        setShowModal(true)
      } else {
        setShowModal(false)
      }
    }, [requireInstitute, selectedInstitute, hasCheckedInstitutes, loading])

    const handleModalClose = () => {
      // Only close modal if an institute is selected or not required
      if (selectedInstitute || !requireInstitute) {
        setShowModal(false)
      }
    }

    // Show loading while checking for institutes
    if (!hasCheckedInstitutes && loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading institutes...</p>
          </div>
        </div>
      )
    }

    return (
      <>
        <WrappedComponent {...props} />
        <InstituteSelectionModal
          isOpen={showModal}
          onClose={handleModalClose}
          title={title}
          description={description}
        />
      </>
    )
  }
}

export default withInstituteSelection
