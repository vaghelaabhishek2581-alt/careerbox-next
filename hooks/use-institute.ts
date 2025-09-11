import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import {
  fetchMyInstitute,
  fetchInstituteById,
  fetchInstitutes,
  searchInstitutes,
  createInstitute,
  updateInstitute,
  verifyInstitute
} from '@/lib/redux/slices/instituteSlice'
import { useCallback } from 'react'

export const useInstitute = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    currentInstitute,
    institutes,
    instituteProfile,
    loading,
    error,
    pagination,
    searchFilters
  } = useSelector((state: RootState) => state.institute)

  const getMyInstitute = useCallback(() => {
    dispatch(fetchMyInstitute())
  }, [dispatch])

  const getInstituteById = useCallback((instituteId: string) => {
    dispatch(fetchInstituteById(instituteId))
  }, [dispatch])

  const getInstitutes = useCallback((params?: { page?: number; limit?: number; status?: string }) => {
    dispatch(fetchInstitutes(params))
  }, [dispatch])

  const searchInstitutesList = useCallback((filters: any) => {
    dispatch(searchInstitutes(filters))
  }, [dispatch])

  const createInstituteProfile = useCallback((instituteData: any) => {
    return dispatch(createInstitute(instituteData))
  }, [dispatch])

  const updateInstituteProfile = useCallback((instituteId: string, instituteData: any) => {
    return dispatch(updateInstitute({ instituteId, instituteData }))
  }, [dispatch])

  const verifyInstituteProfile = useCallback((instituteId: string, isVerified: boolean) => {
    return dispatch(verifyInstitute({ instituteId, isVerified }))
  }, [dispatch])

  return {
    // State
    currentInstitute,
    institutes,
    instituteProfile,
    loading,
    error,
    pagination,
    searchFilters,
    
    // Actions
    getMyInstitute,
    getInstituteById,
    getInstitutes,
    searchInstitutes: searchInstitutesList,
    createInstitute: createInstituteProfile,
    updateInstitute: updateInstituteProfile,
    verifyInstitute: verifyInstituteProfile,
  }
}
