import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { API } from '@/lib/api/services'

// Types
export interface Course {
  _id: string
  title: string
  description: string
  instructor: string
  instituteId: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  price: number
  currency: string
  thumbnail?: string
  isPublished: boolean
  enrollmentCount: number
  rating: number
  createdAt: string
  updatedAt: string
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
      const response = await API.courses.applyToCourse(courseId, applicationData)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to apply to course')
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to apply to course')
    }
  }
)

export const fetchCourseApplications = createAsyncThunk(
  'course/fetchCourseApplications',
  async (courseId?: string, { rejectWithValue }) => {
    try {
      const response = await API.courses.getCourseApplications(courseId)

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch course applications')
      }

      return response.data
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
      state.courses = action.payload.courses || action.payload
      state.pagination = action.payload.pagination || state.pagination
    })
    builder.addCase(fetchCourses.rejected, (state, action) => {
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
      state.applications.push(action.payload)
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
