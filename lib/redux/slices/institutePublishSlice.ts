import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@/lib/redux/store'

interface PublishState {
  slug?: string
  published: boolean
  publishLockedByAdmin: boolean
  lastPublishChangedBy?: 'admin' | 'institute_admin' | null
  lastPublishedAt?: string | null
  lastUnpublishedAt?: string | null
  loading: boolean
  error: string | null
}

const initialState: PublishState = {
  published: true,
  publishLockedByAdmin: false,
  lastPublishChangedBy: null,
  lastPublishedAt: null,
  lastUnpublishedAt: null,
  loading: false,
  error: null
}

export const fetchInstitutePublishStatus = createAsyncThunk(
  'publish/fetch',
  async (slug: string, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `/api/institutes/${encodeURIComponent(slug)}/publish-status`
      )
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        if (res.status === 401) throw new Error('Unauthorized')
        throw new Error('Unexpected response')
      }
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch publish status')
      }
      return json.data
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch publish status')
    }
  }
)

export const updateInstitutePublishStatus = createAsyncThunk(
  'publish/update',
  async (
    { slug, published }: { slug: string; published: boolean },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `/api/institutes/${encodeURIComponent(slug)}/publish-status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ published })
        }
      )
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        if (res.status === 401) throw new Error('Unauthorized')
        throw new Error('Unexpected response')
      }
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update publish status')
      }
      return json.data
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to update publish status')
    }
  }
)

const institutePublishSlice = createSlice({
  name: 'institutePublish',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchInstitutePublishStatus.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInstitutePublishStatus.fulfilled, (state, action) => {
        state.loading = false
        state.slug = action.payload.slug
        state.published = action.payload.published
        state.publishLockedByAdmin = action.payload.publishLockedByAdmin
        state.lastPublishChangedBy = action.payload.lastPublishChangedBy
        state.lastPublishedAt = action.payload.lastPublishedAt
        state.lastUnpublishedAt = action.payload.lastUnpublishedAt
      })
      .addCase(fetchInstitutePublishStatus.rejected, (state, action) => {
        state.loading = false
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to fetch publish status'
      })
      .addCase(updateInstitutePublishStatus.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInstitutePublishStatus.fulfilled, (state, action) => {
        state.loading = false
        state.slug = action.payload.slug
        state.published = action.payload.published
        state.publishLockedByAdmin = action.payload.publishLockedByAdmin
        state.lastPublishChangedBy = action.payload.lastPublishChangedBy
        state.lastPublishedAt = action.payload.lastPublishedAt
        state.lastUnpublishedAt = action.payload.lastUnpublishedAt
      })
      .addCase(updateInstitutePublishStatus.rejected, (state, action) => {
        state.loading = false
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to update publish status'
      })
  }
})

export default institutePublishSlice.reducer
export const selectPublishState = (s: RootState) => s.institutePublish
