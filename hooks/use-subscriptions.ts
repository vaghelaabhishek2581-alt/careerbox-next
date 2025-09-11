import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import {
  fetchCurrentSubscription,
  fetchAvailablePlans,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  fetchBillingHistory,
  fetchUsageStats,
  processPayment
} from '@/lib/redux/slices/subscriptionSlice'
import { useCallback } from 'react'

export const useSubscriptions = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    currentSubscription,
    availablePlans,
    billingHistory,
    usageStats,
    loading,
    error
  } = useSelector((state: RootState) => state.subscription)

  const getCurrentSubscription = useCallback(() => {
    dispatch(fetchCurrentSubscription())
  }, [dispatch])

  const getAvailablePlans = useCallback(() => {
    dispatch(fetchAvailablePlans())
  }, [dispatch])

  const createNewSubscription = useCallback((subscriptionData: any) => {
    return dispatch(createSubscription(subscriptionData))
  }, [dispatch])

  const updateCurrentSubscription = useCallback((subscriptionId: string, subscriptionData: any) => {
    return dispatch(updateSubscription({ subscriptionId, subscriptionData }))
  }, [dispatch])

  const cancelCurrentSubscription = useCallback((subscriptionId: string) => {
    return dispatch(cancelSubscription(subscriptionId))
  }, [dispatch])

  const getBillingHistory = useCallback((params?: { page?: number; limit?: number }) => {
    dispatch(fetchBillingHistory(params))
  }, [dispatch])

  const getUsageStats = useCallback(() => {
    dispatch(fetchUsageStats())
  }, [dispatch])

  const processSubscriptionPayment = useCallback((paymentData: any) => {
    return dispatch(processPayment(paymentData))
  }, [dispatch])

  return {
    // State
    currentSubscription,
    availablePlans,
    billingHistory,
    usageStats,
    loading,
    error,
    
    // Actions
    getCurrentSubscription,
    getAvailablePlans,
    createSubscription: createNewSubscription,
    updateSubscription: updateCurrentSubscription,
    cancelSubscription: cancelCurrentSubscription,
    getBillingHistory,
    getUsageStats,
    processPayment: processSubscriptionPayment,
  }
}
