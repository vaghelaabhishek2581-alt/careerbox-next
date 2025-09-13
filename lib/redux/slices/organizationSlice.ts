import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API } from '@/lib/api/services';

interface Organization {
  id: string;
  name: string;
  code: string;
  type: 'university' | 'school' | 'institute' | 'company';
  status: 'active' | 'inactive' | 'pending';
  memberCount: number;
  createdAt: string;
  settings: {
    allowSelfRegistration: boolean;
    requireApproval: boolean;
    customBranding: boolean;
  };
}

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  totalOrganizations: number;
  isLoading: boolean;
  error: string | null;
  members: any[];
  memberStats: {
    total: number;
    active: number;
    pending: number;
  };
}

const initialState: OrganizationState = {
  organizations: [],
  currentOrganization: null,
  totalOrganizations: 0,
  isLoading: false,
  error: null,
  members: [],
  memberStats: {
    total: 0,
    active: 0,
    pending: 0,
  },
};

export const fetchOrganizations = createAsyncThunk(
  'organization/fetchAll',
  async ({ page, limit }: { page: number; limit: number }) => {
    const response = await API.admin.getOrganizations({ page, limit });
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch organizations');
    }
    return response.data;
  }
);

export const fetchOrganizationMembers = createAsyncThunk(
  'organization/fetchMembers',
  async (organizationId: string) => {
    const response = await API.organizations.getMembers(organizationId);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch organization members');
    }
    return response.data;
  }
);

export const createOrganization = createAsyncThunk(
  'organization/create',
  async (organizationData: Partial<Organization>) => {
    const response = await API.admin.createOrganization(organizationData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create organization');
    }
    return response.data;
  }
);

export const updateOrganization = createAsyncThunk(
  'organization/update',
  async ({ id, data }: { id: string; data: Partial<Organization> }) => {
    const response = await API.organizations.updateOrganization(id, data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update organization');
    }
    return response.data;
  }
);

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload;
    },
    clearOrganizationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrganizations.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOrganizations.fulfilled, (state, action) => {
      state.isLoading = false;
      state.organizations = action.payload.organizations;
      state.totalOrganizations = action.payload.total;
    });
    builder.addCase(fetchOrganizations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch organizations';
    });

    builder.addCase(fetchOrganizationMembers.fulfilled, (state, action) => {
      state.members = action.payload.members;
      state.memberStats = action.payload.stats;
    });

    builder.addCase(createOrganization.fulfilled, (state, action) => {
      state.organizations.unshift(action.payload.organization);
      state.totalOrganizations += 1;
    });

    builder.addCase(updateOrganization.fulfilled, (state, action) => {
      const index = state.organizations.findIndex(org => org.id === action.payload.organization.id);
      if (index !== -1) {
        state.organizations[index] = action.payload.organization;
      }
      if (state.currentOrganization?.id === action.payload.organization.id) {
        state.currentOrganization = action.payload.organization;
      }
    });
  },
});

export const { setCurrentOrganization, clearOrganizationError } = organizationSlice.actions;
export default organizationSlice.reducer;