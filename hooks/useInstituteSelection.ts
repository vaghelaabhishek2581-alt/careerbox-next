'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import { fetchUserInstitutes } from '@/lib/redux/slices/instituteSlice'

interface UseInstituteSelectionOptions {
  requireInstitute?: boolean
  autoFetch?: boolean
}

export function useInstituteSelection(options: UseInstituteSelectionOptions = {}) {
  const { requireInstitute = true, autoFetch = true } = options
  const dispatch = useDispatch<AppDispatch>()
  const { selectedInstitute, userInstitutes, loading } = useSelector((state: RootState) => state.institute)
  
  const [needsSelection, setNeedsSelection] = useState(false)
  const [hasCheckedInstitutes, setHasCheckedInstitutes] = useState(false)

  useEffect(() => {
    // Auto-fetch user institutes if enabled and not already loaded
    if (autoFetch && userInstitutes.length === 0 && !loading && !hasCheckedInstitutes) {
      dispatch(fetchUserInstitutes()).finally(() => {
        setHasCheckedInstitutes(true)
      })
    } else if (userInstitutes.length > 0) {
      setHasCheckedInstitutes(true)
    }
  }, [autoFetch, dispatch, userInstitutes.length, loading, hasCheckedInstitutes])

  useEffect(() => {
    // Determine if selection is needed
    if (requireInstitute && hasCheckedInstitutes && !selectedInstitute && !loading) {
      setNeedsSelection(true)
    } else {
      setNeedsSelection(false)
    }
  }, [requireInstitute, selectedInstitute, hasCheckedInstitutes, loading])

  return {
    selectedInstitute,
    userInstitutes,
    loading,
    needsSelection,
    hasCheckedInstitutes,
    hasInstitutes: userInstitutes.length > 0,
    isReady: hasCheckedInstitutes && (selectedInstitute || !requireInstitute)
  }
}

export default useInstituteSelection
