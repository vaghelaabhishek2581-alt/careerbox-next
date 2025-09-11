import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Course, CourseApplication, CreateCourseRequest, UpdateCourseRequest, CourseSearchFilters, CourseSearchResponse } from '@/lib/types/course.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

interface CourseState {
  courses: Course[]
  currentCourse: Course | null
  applications: CourseApplication[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  searchFilters: CourseSearchFilters
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  applications: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
  },
  searchFilters: {},
}

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params: { page?: number; limit?: number; instituteId?: string; status?: string }) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.instituteId) queryParams.append('instituteId', params.instituteId)
    if (params.status) queryParams.append('status', params.status)

    const response = await fetch(`/api/courses?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch courses')
    }
    return response.json()
  }
)

export const searchCourses = createAsyncThunk(
  'courses/searchCourses',
  async (filters: CourseSearchFilters & { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()))
        } else {
          queryParams.append(key, value.toString())
        }
      }
    })

    const response = await fetch(`/api/courses/search?${queryParams}`)
    if (!response.ok) {
      throw new Error('Failed to search courses')
    }
    return response.json()
  }
)

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData: CreateCourseRequest) => {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    })
    if (!response.ok) {
      throw new Error('Failed to create course')
    }
    return response.json()
  }
)

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ courseId, courseData }: { courseId: string; courseData: UpdateCourseRequest }) => {
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    })
    if (!response.ok) {
      throw new Error('Failed to update course')
    }
    return response.json()
  }
)

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId: string) => {
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete course')
    }
    return { courseId }
  }
)

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId: string) => {
    const response = await fetch(`/api/courses/${courseId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch course')
    }
    return response.json()
  }
)

export const fetchCourseApplications = createAsyncThunk(
  'courses/fetchCourseApplications',
  async (courseId: string) => {
    const response = await fetch(`/api/courses/${courseId}/applications`)
    if (!response.ok) {
      throw new Error('Failed to fetch course applications')
    }
    return response.json()
  }
)

export const applyToCourse = createAsyncThunk(
  'courses/applyToCourse',
  async ({ courseId, applicationData }: { courseId: string; applicationData: any }) => {
    const response = await fetch(`/api/courses/${courseId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    })
    if (!response.ok) {
      throw new Error('Failed to apply to course')
    }
    return response.json()
  }
)

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload
    },
    setSearchFilters: (state, action: PayloadAction<CourseSearchFilters>) => {
      state.searchFilters = action.payload
    },
    updateCourseInList: (state, action: PayloadAction<Course>) => {
      const index = state.courses.findIndex(course => course.id === action.payload.id)
      if (index !== -1) {
        state.courses[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<Course>
        state.courses = response.data
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch courses'
      })
      // Search courses
      .addCase(searchCourses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchCourses.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as CourseSearchResponse
        state.courses = response.courses
        state.pagination = {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        }
      })
      .addCase(searchCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to search courses'
      })
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Course>
        if (response.data) {
          state.courses.unshift(response.data)
        }
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create course'
      })
      // Update course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Course>
        if (response.data) {
          const index = state.courses.findIndex(course => course.id === response.data!.id)
          if (index !== -1) {
            state.courses[index] = response.data!
          }
          if (state.currentCourse?.id === response.data!.id) {
            state.currentCourse = response.data!
          }
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update course'
      })
      // Delete course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false
        state.courses = state.courses.filter(course => course.id !== action.payload.courseId)
        if (state.currentCourse?.id === action.payload.courseId) {
          state.currentCourse = null
        }
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete course'
      })
      // Fetch course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Course>
        if (response.data) {
          state.currentCourse = response.data
        }
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch course'
      })
      // Fetch course applications
      .addCase(fetchCourseApplications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCourseApplications.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as PaginatedResponse<CourseApplication>
        state.applications = response.data
      })
      .addCase(fetchCourseApplications.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch course applications'
      })
      // Apply to course
      .addCase(applyToCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(applyToCourse.fulfilled, (state, action) => {
        state.loading = false
        // Handle successful application
      })
      .addCase(applyToCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to apply to course'
      })
  },
})

export const { clearError, setCurrentCourse, setSearchFilters, updateCourseInList } = courseSlice.actions
export default courseSlice.reducer
