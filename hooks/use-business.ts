import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import {
  fetchBusinessProfile,
  fetchBusinessById,
  fetchBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness
} from '@/lib/redux/slices/businessSlice'
import { useCallback } from 'react'

export const useBusiness = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    currentBusiness,
    businesses,
    businessProfile,
    loading,
    error,
    pagination,
    searchFilters
  } = useSelector((state: RootState) => state.business)

  const getMyBusiness = useCallback((businessId: string) => {
    dispatch(fetchBusinessProfile(businessId))
  }, [dispatch])

  const getBusinessById = useCallback((businessId: string) => {
    dispatch(fetchBusinessById(businessId))
  }, [dispatch])

  const getBusinesses = useCallback((params?: { page?: number; limit?: number; industry?: string; verified?: boolean }) => {
    dispatch(fetchBusinesses(params || {}))
  }, [dispatch])

  const searchBusinessesList = useCallback((filters: any) => {
    // TODO: Implement searchBusinesses
    console.log('Search businesses:', filters)
  }, [dispatch])

  const createBusinessProfile = useCallback((businessData: any) => {
    return dispatch(createBusiness(businessData))
  }, [dispatch])

  const updateBusinessProfile = useCallback((businessId: string, businessData: any) => {
    return dispatch(updateBusiness({ businessId, businessData }))
  }, [dispatch])

  const verifyBusinessProfile = useCallback((businessId: string, isVerified: boolean) => {
    // TODO: Implement verifyBusiness
    console.log('Verify business:', businessId, isVerified)
  }, [dispatch])

  return {
    // State
    currentBusiness,
    businesses,
    businessProfile,
    loading,
    error,
    pagination,
    searchFilters,
    
    // Actions
    getMyBusiness,
    getBusinessById,
    getBusinesses,
    searchBusinesses: searchBusinessesList,
    createBusiness: createBusinessProfile,
    updateBusiness: updateBusinessProfile,
    verifyBusiness: verifyBusinessProfile,
  }
}
