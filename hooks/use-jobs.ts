import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import {
  fetchJobs,
  createJob,
  updateJob,
  deleteJob,
  fetchJobById,
  fetchApplications,
  applyToJob
} from '@/lib/redux/slices/jobSlice'
import { useCallback } from 'react'

export const useJobs = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    jobs,
    currentJob,
    applications,
    loading,
    error,
    pagination,
    searchFilters
  } = useSelector((state: RootState) => state.jobs)

  const getJobs = useCallback((params?: { page?: number; limit?: number; businessId?: string; status?: string }) => {
    dispatch(fetchJobs(params || {}))
  }, [dispatch])

  const searchJobsList = useCallback((filters: any) => {
    // TODO: Implement searchJobs
    console.log('Search jobs:', filters)
  }, [dispatch])

  const createJobPosting = useCallback((jobData: any) => {
    return dispatch(createJob(jobData))
  }, [dispatch])

  const updateJobPosting = useCallback((jobId: string, jobData: any) => {
    return dispatch(updateJob({ jobId, jobData }))
  }, [dispatch])

  const deleteJobPosting = useCallback((jobId: string) => {
    return dispatch(deleteJob(jobId))
  }, [dispatch])

  const getJobById = useCallback((jobId: string) => {
    dispatch(fetchJobById(jobId))
  }, [dispatch])

  const getJobApplications = useCallback((jobId: string) => {
    dispatch(fetchApplications(jobId))
  }, [dispatch])

  const applyToJobPosting = useCallback((jobId: string, applicationData: any) => {
    return dispatch(applyToJob({ jobId, applicationData }))
  }, [dispatch])

  return {
    // State
    jobs,
    currentJob,
    applications,
    loading,
    error,
    pagination,
    searchFilters,
    
    // Actions
    getJobs,
    searchJobs: searchJobsList,
    createJob: createJobPosting,
    updateJob: updateJobPosting,
    deleteJob: deleteJobPosting,
    getJobById,
    getJobApplications,
    applyToJob: applyToJobPosting,
  }
}
