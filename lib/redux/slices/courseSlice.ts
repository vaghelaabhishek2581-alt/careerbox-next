import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { API } from '@/lib/api/services'

// Types
export interface Course {
  _id: string
  id?: string // Alias for _id for compatibility
  title: string
  description: string
  courseType: string
  duration: number
  fee: number
  maxStudents: number
  specializations?: string[]
  applicableStreams?: string[]
  feesFrequency?: string
  feesAmount?: number
  modeOfStudy: 'online' | 'offline' | 'hybrid'
  highestPackageAmount?: number
  totalSeats?: number
  managementQuota?: number
  examsAccepted?: string[]
  eligibilityRequirements?: string[]
  isPublished: boolean
  status?: 'draft' | 'active' | 'archived' | 'completed'
  syllabus?: string[]
  assessmentMethods?: string[]
  certificationType?: string
  tags?: string[]
  instituteId: string
  currentEnrollments?: number
  startDate?: string | Date
  registrationDeadline?: string | Date
  
  // Optional legacy fields for backward compatibility
  instructor?: string | { name: string; _id?: string }
  category?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  price?: number
  currency?: string
  thumbnail?: string
  enrollmentCount?: number
  rating?: number
  createdAt?: string
  updatedAt?: string
}

export interface CourseApplication {
  _id: string
  courseId: string
  userId: string
  status: 'pending' | 'accepted' | 'rejected'
  applicationData: any
  submittedAt: string
  reviewedAt?: string
}

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
  searchFilters: any
}

const initialState: CourseState = {
  courses: [] as Course[],
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

// Async thunks using API client
export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async (params: { page?: number; limit?: number; category?: string; level?: string; instituteId?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await API.courses.getCourses(
        params.page || 1,
        params.limit || 10,
        {
          category: params.category,
          level: params.level,
          instituteId: params.instituteId
        }
      )

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch courses')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch courses')
    }
  }
)

export const searchCourses = createAsyncThunk(
  'course/searchCourses',
  async (filters: any, { rejectWithValue }) => {
    try {
      const response = await API.courses.getCourses(
        filters.page || 1,
        filters.limit || 10,
        filters
      )

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to search courses')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search courses')
    }
  }
)

export const fetchCourseById = createAsyncThunk(
  'course/fetchCourseById',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await API.courses.getCourse(courseId)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch course')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch course')
    }
  }
)

export const createCourse = createAsyncThunk(
  'course/createCourse',
  async (courseData: any, { rejectWithValue }) => {
    try {
      const response = await API.courses.createCourse(courseData)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to create course')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create course')
    }
  }
)

export const updateCourse = createAsyncThunk(
  'course/updateCourse',
  async ({ courseId, courseData }: { courseId: string; courseData: any }, { rejectWithValue }) => {
    try {
      const response = await API.courses.updateCourse(courseId, courseData)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to update course')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update course')
    }
  }
)

export const deleteCourse = createAsyncThunk(
  'course/deleteCourse',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await API.courses.deleteCourse(courseId)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to delete course')
      }

      return courseId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete course')
    }
  }
)

export const applyToCourse = createAsyncThunk(
  'course/applyToCourse',
  async ({ courseId, applicationData }: { courseId: string; applicationData: any }, { rejectWithValue }) => {
    try {
      // TODO: Implement applyToCourse API method
      const response: { success: boolean; data?: CourseApplication; error?: string } = {
        success: true,
        data: {
          _id: `temp_${Date.now()}`,
          courseId,
          userId: 'temp_user',
          status: 'pending',
          applicationData,
          submittedAt: new Date().toISOString()
        }
      }

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to apply to course')
      }

      return response.data!
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to apply to course')
    }
  }
)

export const fetchCourseApplications = createAsyncThunk(
  'course/fetchCourseApplications',
  async (courseId: string | undefined, { rejectWithValue }) => {
    try {
      // TODO: Implement getCourseApplications API method
      const response: { success: boolean; data?: CourseApplication[]; error?: string } = {
        success: true,
        data: []
      }

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch course applications')
      }

      return response.data!
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch course applications')
    }
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
    setSearchFilters: (state, action: PayloadAction<any>) => {
      state.searchFilters = action.payload
    },
    clearCourses: (state) => {
      state.courses = []
      state.currentCourse = null
      state.applications = []
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch courses
    builder.addCase(fetchCourses.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchCourses.fulfilled, (state, action) => {
      state.loading = false
      // Handle PaginatedResponse format from API
      if (action.payload.data) {
        state.courses = action.payload.data
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
          hasMore: action.payload.hasMore || false
        }
      } else {
        // Fallback for direct array response
        state.courses = Array.isArray(action.payload) ? action.payload : action.payload.courses || []
      }
    })
    builder.addCase(fetchCourses.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Search courses
    builder.addCase(searchCourses.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(searchCourses.fulfilled, (state, action) => {
      state.loading = false
      // Handle PaginatedResponse format from API
      if (action.payload.data) {
        state.courses = action.payload.data
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
          hasMore: action.payload.hasMore || false
        }
      } else {
        // Fallback for direct array response
        state.courses = Array.isArray(action.payload) ? action.payload : action.payload.courses || []
      }
    })
    builder.addCase(searchCourses.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch course by ID
    builder.addCase(fetchCourseById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchCourseById.fulfilled, (state, action) => {
      state.loading = false
      state.currentCourse = action.payload
    })
    builder.addCase(fetchCourseById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Create course
    builder.addCase(createCourse.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createCourse.fulfilled, (state, action) => {
      state.loading = false
      state.courses.unshift(action.payload)
    })
    builder.addCase(createCourse.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Update course
    builder.addCase(updateCourse.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateCourse.fulfilled, (state, action) => {
      state.loading = false
      const index = state.courses.findIndex(course => course._id === action.payload._id)
      if (index !== -1) {
        state.courses[index] = action.payload
      }
      if (state.currentCourse?._id === action.payload._id) {
        state.currentCourse = action.payload
      }
    })
    builder.addCase(updateCourse.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Delete course
    builder.addCase(deleteCourse.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(deleteCourse.fulfilled, (state, action) => {
      state.loading = false
      state.courses = state.courses.filter(course => course._id !== action.payload)
      if (state.currentCourse?._id === action.payload) {
        state.currentCourse = null
      }
    })
    builder.addCase(deleteCourse.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Apply to course
    builder.addCase(applyToCourse.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(applyToCourse.fulfilled, (state, action) => {
      state.loading = false
      if (action.payload) {
        state.applications.push(action.payload)
      }
    })
    builder.addCase(applyToCourse.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch course applications
    builder.addCase(fetchCourseApplications.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchCourseApplications.fulfilled, (state, action) => {
      state.loading = false
      state.applications = action.payload
    })
    builder.addCase(fetchCourseApplications.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  }
})

export const { clearError, setCurrentCourse, setSearchFilters, clearCourses } = courseSlice.actions
export default courseSlice.reducer
