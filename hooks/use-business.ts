import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import {
  fetchMyBusiness,
  fetchBusinessById,
  fetchBusinesses,
  searchBusinesses,
  createBusiness,
  updateBusiness,
  verifyBusiness
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

  const getMyBusiness = useCallback(() => {
    dispatch(fetchMyBusiness())
  }, [dispatch])

  const getBusinessById = useCallback((businessId: string) => {
    dispatch(fetchBusinessById(businessId))
  }, [dispatch])

  const getBusinesses = useCallback((params?: { page?: number; limit?: number; status?: string }) => {
    dispatch(fetchBusinesses(params))
  }, [dispatch])

  const searchBusinessesList = useCallback((filters: any) => {
    dispatch(searchBusinesses(filters))
  }, [dispatch])

  const createBusinessProfile = useCallback((businessData: any) => {
    return dispatch(createBusiness(businessData))
  }, [dispatch])

  const updateBusinessProfile = useCallback((businessId: string, businessData: any) => {
    return dispatch(updateBusiness({ businessId, businessData }))
  }, [dispatch])

  const verifyBusinessProfile = useCallback((businessId: string, isVerified: boolean) => {
    return dispatch(verifyBusiness({ businessId, isVerified }))
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
