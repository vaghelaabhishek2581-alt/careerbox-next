import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import {
  fetchExams,
  searchExams,
  createExam,
  updateExam,
  deleteExam,
  fetchExamById,
  fetchExamRegistrations,
  registerForExam,
  submitExamAnswers
} from '@/lib/redux/slices/examSlice'
import { useCallback } from 'react'

export const useExams = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    exams,
    currentExam,
    registrations,
    loading,
    error,
    pagination,
    searchFilters
  } = useSelector((state: RootState) => state.exams)

  const getExams = useCallback((params?: { page?: number; limit?: number; createdBy?: string; createdByType?: string; status?: string }) => {
    dispatch(fetchExams(params || {}))
  }, [dispatch])

  const searchExamsList = useCallback((filters: any) => {
    dispatch(searchExams(filters))
  }, [dispatch])

  const createExamPosting = useCallback((examData: any) => {
    return dispatch(createExam(examData))
  }, [dispatch])

  const updateExamPosting = useCallback((examId: string, examData: any) => {
    return dispatch(updateExam({ examId, examData }))
  }, [dispatch])

  const deleteExamPosting = useCallback((examId: string) => {
    return dispatch(deleteExam(examId))
  }, [dispatch])

  const getExamById = useCallback((examId: string) => {
    dispatch(fetchExamById(examId))
  }, [dispatch])

  const getExamRegistrations = useCallback((examId: string) => {
    dispatch(fetchExamRegistrations(examId))
  }, [dispatch])

  const registerForExamPosting = useCallback((examId: string, registrationData: any) => {
    return dispatch(registerForExam({ examId, registrationData }))
  }, [dispatch])

  const submitAnswers = useCallback((examId: string, answers: any[]) => {
    return dispatch(submitExamAnswers({ examId, answers }))
  }, [dispatch])

  return {
    // State
    exams,
    currentExam,
    registrations,
    loading,
    error,
    pagination,
    searchFilters,
    
    // Actions
    getExams,
    searchExams: searchExamsList,
    createExam: createExamPosting,
    updateExam: updateExamPosting,
    deleteExam: deleteExamPosting,
    getExamById,
    getExamRegistrations,
    registerForExam: registerForExamPosting,
    submitExamAnswers: submitAnswers,
  }
}
