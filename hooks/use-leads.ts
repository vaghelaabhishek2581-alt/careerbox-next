import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import {
  fetchLeads,
  createLead,
  updateLeadStatus,
  convertLead,
  fetchLeadById
} from '@/lib/redux/slices/leadSlice'
import { useCallback } from 'react'

export const useLeads = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    leads,
    currentLead,
    loading,
    error,
    pagination
  } = useSelector((state: RootState) => state.leads)

  const getLeads = useCallback((params?: { page?: number; limit?: number; type?: string; status?: string }) => {
    dispatch(fetchLeads(params || {}))
  }, [dispatch])

  const createNewLead = useCallback((leadData: any) => {
    return dispatch(createLead(leadData))
  }, [dispatch])

  const updateLeadStatusAction = useCallback((leadId: string, status: 'rejected' | 'contacted' | 'converted', notes?: string) => {
    return dispatch(updateLeadStatus({ leadId, status, notes }))
  }, [dispatch])

  const convertLeadToSubscription = useCallback((leadId: string, subscriptionPlan: string) => {
    return dispatch(convertLead({ leadId, subscriptionPlan }))
  }, [dispatch])

  const getLeadById = useCallback((leadId: string) => {
    dispatch(fetchLeadById(leadId))
  }, [dispatch])

  return {
    // State
    leads,
    currentLead,
    loading,
    error,
    pagination,
    
    // Actions
    getLeads,
    createLead: createNewLead,
    updateLeadStatus: updateLeadStatusAction,
    convertLead: convertLeadToSubscription,
    getLeadById,
  }
}
