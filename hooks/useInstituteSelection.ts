'use client'
  
import { useEffect, useState, useRef } from 'react'
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
  const { selectedInstitute, userInstitutes, loading,hasFetched } = useSelector((state: RootState) => state.institute)
  
  const [needsSelection, setNeedsSelection] = useState(false)
  const [hasCheckedInstitutes, setHasCheckedInstitutes] = useState(false)
 const fetchingRef = useRef(false)
  useEffect(() => {
    // Only fetch if:
    // 1. autoFetch is enabled
    // 2. We haven't fetched yet (Redux state - shared across components)
    // 3. We're not currently loading
    // 4. We're not already dispatching (ref guard for same component)
    if (autoFetch && !hasFetched && !loading && !fetchingRef.current) {
      fetchingRef.current = true
      dispatch(fetchUserInstitutes()).finally(() => {
        fetchingRef.current = false
      })
    }
  }, [autoFetch, dispatch, hasFetched, loading])

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
