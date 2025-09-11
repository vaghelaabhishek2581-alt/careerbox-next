import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import {
  fetchCourses,
  searchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  fetchCourseById,
  fetchCourseApplications,
  applyToCourse
} from '@/lib/redux/slices/courseSlice'
import { useCallback } from 'react'

export const useCourses = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    courses,
    currentCourse,
    applications,
    loading,
    error,
    pagination,
    searchFilters
  } = useSelector((state: RootState) => state.courses)

  const getCourses = useCallback((params?: { page?: number; limit?: number; instituteId?: string; status?: string }) => {
    dispatch(fetchCourses(params))
  }, [dispatch])

  const searchCoursesList = useCallback((filters: any) => {
    dispatch(searchCourses(filters))
  }, [dispatch])

  const createCoursePosting = useCallback((courseData: any) => {
    return dispatch(createCourse(courseData))
  }, [dispatch])

  const updateCoursePosting = useCallback((courseId: string, courseData: any) => {
    return dispatch(updateCourse({ courseId, courseData }))
  }, [dispatch])

  const deleteCoursePosting = useCallback((courseId: string) => {
    return dispatch(deleteCourse(courseId))
  }, [dispatch])

  const getCourseById = useCallback((courseId: string) => {
    dispatch(fetchCourseById(courseId))
  }, [dispatch])

  const getCourseApplications = useCallback((courseId: string) => {
    dispatch(fetchCourseApplications(courseId))
  }, [dispatch])

  const applyToCoursePosting = useCallback((courseId: string, applicationData: any) => {
    return dispatch(applyToCourse({ courseId, applicationData }))
  }, [dispatch])

  return {
    // State
    courses,
    currentCourse,
    applications,
    loading,
    error,
    pagination,
    searchFilters,
    
    // Actions
    getCourses,
    searchCourses: searchCoursesList,
    createCourse: createCoursePosting,
    updateCourse: updateCoursePosting,
    deleteCourse: deleteCoursePosting,
    getCourseById,
    getCourseApplications,
    applyToCourse: applyToCoursePosting,
  }
}
