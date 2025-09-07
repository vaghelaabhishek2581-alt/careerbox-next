import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
    const response = await fetch(`/api/admin/organizations?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }
    
    return await response.json();
  }
);

export const fetchOrganizationMembers = createAsyncThunk(
  'organization/fetchMembers',
  async (organizationId: string) => {
    const response = await fetch(`/api/organization/${organizationId}/members`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch organization members');
    }
    
    return await response.json();
  }
);

export const createOrganization = createAsyncThunk(
  'organization/create',
  async (organizationData: Partial<Organization>) => {
    const response = await fetch('/api/admin/organizations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(organizationData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create organization');
    }
    
    return await response.json();
  }
);

export const updateOrganization = createAsyncThunk(
  'organization/update',
  async ({ id, data }: { id: string; data: Partial<Organization> }) => {
    const response = await fetch(`/api/organization/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update organization');
    }
    
    return await response.json();
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