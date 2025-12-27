import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Institute, InstituteProfile, InstituteAnalytics, CreateInstituteRequest, UpdateInstituteRequest, InstituteSearchFilters, InstituteSearchResponse } from '@/lib/types/institute.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'
import { API } from '@/lib/api/services'

// Create a simplified interface for Institute that works with Redux
export interface InstituteData {
  _id: string
  userId: string
  registrationIntentId: string
  
  // Basic Information
  id?: string
  name: string
  shortName?: string
  slug?: string
  publicProfileId?: string
  establishmentYear?: number
  establishedYear?: number // Alias for establishmentYear
  type?: 'Public/Government' | 'Private' | 'Deemed' | 'Autonomous' | 'Central University' | 'State University'
  status: 'Active' | 'Inactive' | 'Suspended' | 'Under Review' | 'under review' | 'active' | 'inactive' | 'suspended' | 'Rejected' | 'rejected' // Support both formats
  logo?: string
  coverImage?: string
  website?: string
  
  // Contact Information
  email: string
  contactPerson: string
  phone: string
  contact?: {
    phone?: string[]
    email?: string
    website?: string
    admissionsEmail?: string
  }
  
  // Location
  address: {
    street?: string
    city: string
    state: string
    country: string
    zipCode?: string
  }
  location?: {
    address?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
    nearbyLandmarks?: string[]
  }
  
  // Overview
  description?: string
  overview?: {
    description?: string
    vision?: string
    mission?: string
    motto?: string
    founder?: string
    chancellor?: string
    viceChancellor?: string
  }
  
  // Enhanced Accreditation
  accreditation?: {
    naac?: {
      grade?: string
      category?: string
      cgpa?: number
      validUntil?: string
      cycleNumber?: number
    }
    nirf?: {
      overallRank?: string
      universityRank?: string
      managementRank?: string
      year?: number
    }
    ugc?: {
      recognition?: string
    }
  } | string[] // Support both formats
  
  socialMedia: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  
  // Academic Statistics
  studentCount: number
  facultyCount: number
  courseCount: number
  totalStudents?: number
  totalFaculty?: number
  totalPrograms?: number
  studentFacultyRatio?: string
  internationalStudents?: number
  isVerified: boolean
  
  // Campus Details
  campusDetails?: {
    campusType?: 'Urban' | 'Rural' | 'Suburban'
    environment?: string
    facilities?: {
      academic?: string[]
      residential?: string[]
      recreational?: string[]
      support?: string[]
    }
  }
  
  // Schools/Departments
  schools?: {
    name: string
    established?: number
    programs?: string[]
  }[]
  
  // Enhanced Rankings
  rankings?: {
    national?: {
      agency?: string
      category?: string
      rank?: string | number
      year?: number
    }[]
    rankingsDescription?: string
  }
  
  // Admissions
  admissions?: {
    courseWiseAdmissions?: {
      name?: string
      duration?: string
      courseRating?: number
      ratingCount?: number
      totalSeats?: number
      courseCount?: number
      fees?: {
        min?: number
        max?: number
      }
      medianSalary?: {
        min?: number
        max?: number
      }
      eligibility?: {
        minXII?: number
        maxXII?: number
        minGraduation?: number
        maxGraduation?: number
      }
      courseLevel?: 'UG' | 'PG' | 'Diploma' | 'Certificate'
      url?: string
    }[]
    admissionProcess?: string[]
    reservationPolicy?: {
      sc?: string
      st?: string
      obc?: string
      ews?: string
      pwd?: string
    }
  }
  
  // Placements
  placements?: {
    latestYear?: {
      overallPlacementRate?: string
      averageSalary?: string
      highestSalary?: string
      medianSalary?: string
      companiesVisited?: number
      totalOffers?: number
    }
    topRecruiters?: string[]
    sectors?: string[]
  }
  
  // Research and Innovation
  researchAndInnovation?: {
    researchCenters?: number
    patentsFiled?: number
    publicationsPerYear?: number
    researchFunding?: string
    phdScholars?: number
    incubationCenter?: {
      name?: string
      startupsFunded?: number
      totalFunding?: string
    }
    collaborations?: string[]
  }
  
  // Alumni Network
  alumniNetwork?: {
    totalAlumni?: number
    notableAlumni?: string[]
    alumniInFortune500?: number
    entrepreneursCreated?: number
  }
  
  // Media Gallery
  mediaGallery?: {
    photos?: any // Object with category keys
    videos?: {
      url?: string
      title?: string
      thumbnail?: string
    }[]
  }
  
  // Enhanced Courses
  courses?: {
    id?: string
    name?: string
    degree?: string
    school?: string
    duration?: string
    level?: string
    category?: string
    totalSeats?: number
    reviewCount?: number
    questionsCount?: number
    fees?: {
      tuitionFee?: number
      totalFee?: number
      currency?: string
    }
    brochure?: {
      url?: string
      year?: number
    }
    seoUrl?: string
    location?: {
      state?: string
      city?: string
      locality?: string
    }
    educationType?: string
    deliveryMethod?: string
    courseLevel?: string
    placements?: {
      averagePackage?: number
      highestPackage?: number
      placementRate?: number
      topRecruiters?: string[]
    }
    recognition?: string[]
    affiliatedUniversity?: string
  }[]
  
  subscriptionId?: string
  createdAt: Date | string
  updatedAt: Date | string
  city?: string // shortcut for address.city
  state?: string // shortcut for address.state
}

// Enhanced interfaces for new features
export interface RegistrationDetails {
  panNumber: string
  gstNumber: string
  cinNumber: string
  tanNumber: string
  tradeLicenseNumber: string
  licenseExpiryDate: string
  msmeRegistrationNumber: string
  importExportCode: string
}

export interface DocumentInfo {
  id: string
  type: string
  name: string
  url?: string
  uploadedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface Highlight {
  id: string
  title: string
  value: string
  description: string
  example: string
}

export interface Location {
  id: string
  type: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  isPrimary: boolean
}

export interface Facility {
  id: string
  name: string
  description: string
  capacity: string
  images: string[]
  amenities: string[]
  status: 'active' | 'inactive'
}

export interface PlacementProcess {
  id: string
  title: string
  description: string
  percentage: number
}

export interface Ranking {
  id: string
  title: string
  type: string
  organization: string
  year: string
  rank: string
  description: string
  certificateImage?: string
  verificationUrl?: string
  isFeatured: boolean
}

export interface Award {
  id: string
  title: string
  category: string
  issuer: string
  year: string
  description: string
  certificateImage?: string
  verificationUrl?: string
  isFeatured: boolean
}

export interface Scholarship {
  id: string
  title: string
  type: string
  position: string
  year: string
  amount: string
  numberOfAwards: string
  actDate: string
  verificationUrl: string
  description: string
  eligibilityCriteria: string
  applicationUrl: string
  isFeatured: boolean
}

export interface FacultyMember {
  _id: string
  employeeId: string
  personalInfo: {
    firstName: string
    lastName: string
    middleName?: string
    email: string
    phone: string
    alternatePhone?: string
    dateOfBirth?: string
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
    address: {
      street?: string
      city: string
      state: string
      country: string
      zipCode?: string
    }
  }
  department: string
  designation: string
  employmentType: 'full-time' | 'part-time' | 'visiting' | 'adjunct' | 'emeritus'
  joiningDate: string
  qualifications: {
    degree: string
    field: string
    institution: string
    year: number
    grade?: string
  }[]
  specialization: string[]
  researchInterests: string[]
  teachingExperience: number
  totalExperience: number
  industryExperience: number
  profileImage?: string
  status: 'active' | 'inactive' | 'on-leave' | 'retired'
  subjectsTaught: string[]
  publications: {
    title: string
    journal: string
    year: number
    authors: string[]
    doi?: string
    url?: string
  }[]
  researchProjects: {
    title: string
    fundingAgency?: string
    amount?: number
    startDate?: string
    endDate?: string
    status: 'ongoing' | 'completed' | 'submitted' | 'approved'
  }[]
  awards: {
    title: string
    organization: string
    year: number
    description?: string
  }[]
  bio?: string
  socialMedia?: {
    linkedin?: string
    twitter?: string
    researchGate?: string
    googleScholar?: string
    orcid?: string
  }
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

interface InstituteState {
  institutes: Institute[]
  currentInstitute: Institute | null
  userInstitutes: InstituteData[]  // All institutes belonging to the user
  selectedInstitute: InstituteData | null  // Currently selected institute for operations
  instituteProfile: InstituteProfile | null
  registrationDetails: RegistrationDetails | null
  documents: DocumentInfo[]
  highlights: Highlight[]
  locations: Location[]
  facilities: Facility[]
  placementProcesses: PlacementProcess[]
  rankings: Ranking[]
  awards: Award[]
  scholarships: Scholarship[]
  faculty: FacultyMember[]
  loading: boolean
  isUploadingImage: boolean  // For image upload loading state
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  searchFilters: InstituteSearchFilters
}

const initialState: InstituteState = {
  institutes: [],
  currentInstitute: null,
  userInstitutes: [],
  selectedInstitute: null,
  instituteProfile: null,
  registrationDetails: null,
  documents: [],
  highlights: [],
  locations: [],
  facilities: [],
  placementProcesses: [],
  rankings: [],
  awards: [],
  scholarships: [],
  faculty: [],
  loading: false,
  isUploadingImage: false,
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
export const fetchInstitutes = createAsyncThunk(
  'institute/fetchInstitutes',
  async (
    params: { page?: number; limit?: number; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await API.institutes.getInstitutes(params.page, params.limit, params)
      return response
    } catch (error) {
      console.error('Error fetching institutes:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch institutes')
    }
  }
)

export const searchInstitutes = createAsyncThunk(
  'institute/searchInstitutes',
  async (
    searchParams: { query?: string; filters?: InstituteSearchFilters; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch('/api/institutes/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to search institutes')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error searching institutes:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search institutes')
    }
  }
)

export const createInstitute = createAsyncThunk(
  'institute/createInstitute',
  async (instituteData: CreateInstituteRequest, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/institutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instituteData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create institute')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating institute:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create institute')
    }
  }
)

export const updateInstitute = createAsyncThunk(
  'institute/updateInstitute',
  async ({ instituteId, instituteData }: { instituteId: string; instituteData: UpdateInstituteRequest }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/institutes/${instituteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instituteData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update institute')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating institute:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update institute')
    }
  }
)

export const fetchInstituteById = createAsyncThunk(
  'institute/fetchInstituteById',
  async (instituteId: string, { rejectWithValue }) => {
    try {
      const response = await API.institutes.getInstitute(instituteId)
      return response
    } catch (error) {
      console.error('Error fetching institute by ID:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch institute')
    }
  }
)

export const fetchInstituteProfile = createAsyncThunk(
  'institute/fetchInstituteProfile',
  async (instituteId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/institutes/${instituteId}/profile`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch institute profile')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching institute profile:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch institute profile')
    }
  }
)

export const fetchMyInstitute = createAsyncThunk(
  'institute/fetchMyInstitute',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Redux: Calling API.institutes.getActiveInstitute()');
      const response = await API.institutes.getActiveInstitute();

      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to fetch active institute');
      }

      // Transform the API response to match Institute interface
      const apiData = response.data;
      const institute: Institute = {
        id: apiData._id,
        userId: apiData.userId,
        instituteName: apiData.name,
        type: 'University', // Default type, could be derived from other fields
        accreditation: apiData.accreditation || [],
        website: apiData.website,
        description: apiData.description || '',
        logo: apiData.logo,
        address: {
          street: apiData.address?.street || '',
          city: apiData.address?.city || '',
          state: apiData.address?.state || '',
          country: apiData.address?.country || '',
          zipCode: apiData.address?.zipCode || ''
        },
        contactInfo: {
          email: apiData.email,
          phone: apiData.phone,
          linkedin: apiData.socialMedia?.linkedin,
          twitter: apiData.socialMedia?.twitter
        },
        socialMedia: {
          linkedin: apiData.socialMedia?.linkedin,
          twitter: apiData.socialMedia?.twitter,
          facebook: apiData.socialMedia?.facebook,
          instagram: apiData.socialMedia?.instagram
        },
        establishedYear: apiData.establishmentYear,
        studentCount: apiData.studentCount || 0,
        facultyCount: apiData.facultyCount || 0,
        isVerified: apiData.isVerified,
        subscriptionId: apiData.subscriptionId,
        status: apiData.status || 'active',
        createdAt: new Date(apiData.createdAt),
        updatedAt: new Date(apiData.updatedAt)
      };

      return {
        success: true,
        data: institute
      };
    } catch (error) {
      console.error('Redux: Error fetching active institute:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch active institute'
      );
    }
  }
)

// Fetch all institutes belonging to the current user
export const fetchUserInstitutes = createAsyncThunk(
  'institute/fetchUserInstitutes',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Redux: Calling API.institutes.getUserInstitutes()');
      const response = await API.institutes.getUserInstitutes();
      console.log('Redux: API response received:', response);
      return response;
    } catch (error) {
      console.error('Redux: API call failed:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch institutes');
    }
  }
)

// Fetch data for a specific institute by ID
export const fetchInstituteData = createAsyncThunk(
  'institute/fetchInstituteData',
  async (instituteId: string) => {
    const response = await API.institutes.getInstitute(instituteId);
    return response;
  }
)

export const verifyInstitute = createAsyncThunk(
  'institute/verifyInstitute',
  async ({ instituteId, isVerified }: { instituteId: string; isVerified: boolean }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/institutes/${instituteId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVerified }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to verify institute')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error verifying institute:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to verify institute')
    }
  }
)

// New async thunks for enhanced features
export const updateRegistrationDetails = createAsyncThunk(
  'institute/updateRegistrationDetails',
  async (registrationData: RegistrationDetails, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { institute: InstituteState }
      const instituteId = state.institute.selectedInstitute?._id
      
      if (!instituteId) {
        throw new Error('No institute selected')
      }

      const response = await fetch(`/api/institutes/${instituteId}/registration-details`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update registration details')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating registration details:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update registration details')
    }
  }
)

export const uploadDocument = createAsyncThunk(
  'institute/uploadDocument',
  async ({ file, type, name, description }: { file: File; type: string; name: string; description?: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { institute: InstituteState }
      const instituteId = state.institute.selectedInstitute?._id
      
      if (!instituteId) {
        throw new Error('No institute selected')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('name', name)
      if (description) formData.append('description', description)

      const response = await fetch(`/api/institutes/${instituteId}/documents`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload document')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error uploading document:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload document')
    }
  }
)

export const addHighlight = createAsyncThunk(
  'institute/addHighlight',
  async (highlight: Omit<Highlight, 'id'>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { institute: InstituteState }
      const instituteId = state.institute.selectedInstitute?._id
      
      if (!instituteId) {
        throw new Error('No institute selected')
      }

      const response = await fetch(`/api/institutes/${instituteId}/highlights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(highlight),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add highlight')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding highlight:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add highlight')
    }
  }
)

export const addLocation = createAsyncThunk(
  'institute/addLocation',
  async (location: Omit<Location, 'id'>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { institute: InstituteState }
      const instituteId = state.institute.selectedInstitute?._id
      
      if (!instituteId) {
        throw new Error('No institute selected')
      }

      const response = await fetch(`/api/institutes/${instituteId}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add location')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding location:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add location')
    }
  }
)

export const addFacility = createAsyncThunk(
  'institute/addFacility',
  async (facility: Omit<Facility, 'id'>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { institute: InstituteState }
      const instituteId = state.institute.selectedInstitute?._id
      
      if (!instituteId) {
        throw new Error('No institute selected')
      }

      const response = await fetch(`/api/institutes/${instituteId}/facilities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facility),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add facility')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding facility:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add facility')
    }
  }
)

export const addRanking = createAsyncThunk(
  'institute/addRanking',
  async (ranking: Omit<Ranking, 'id'>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { institute: InstituteState }
      const instituteId = state.institute.selectedInstitute?._id
      
      if (!instituteId) {
        throw new Error('No institute selected')
      }

      const response = await fetch(`/api/institutes/${instituteId}/rankings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ranking),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add ranking')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding ranking:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add ranking')
    }
  }
)

export const addAward = createAsyncThunk(
  'institute/addAward',
  async (award: Omit<Award, 'id'>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { institute: InstituteState }
      const instituteId = state.institute.selectedInstitute?._id
      
      if (!instituteId) {
        throw new Error('No institute selected')
      }

      const response = await fetch(`/api/institutes/${instituteId}/awards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(award),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add award')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding award:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add award')
    }
  }
)

export const addScholarship = createAsyncThunk(
  'institute/addScholarship',
  async (scholarship: Omit<Scholarship, 'id'>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { institute: InstituteState }
      const instituteId = state.institute.selectedInstitute?._id
      
      if (!instituteId) {
        throw new Error('No institute selected')
      }

      const response = await fetch(`/api/institutes/${instituteId}/scholarships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scholarship),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add scholarship')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding scholarship:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add scholarship')
    }
  }
)

// Upload institute image (logo or cover)
export const uploadInstituteImage = createAsyncThunk(
  'institute/uploadInstituteImage',
  async ({ instituteId, type, file }: { instituteId: string, type: 'logo' | 'cover', file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('instituteId', instituteId)

      const response = await fetch(`/api/institutes/${instituteId}/upload-image`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upload image')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Upload institute image error:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to upload image')
    }
  }
)

// Faculty Management Async Thunks
export const fetchFaculty = createAsyncThunk(
  'institute/fetchFaculty',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { institute: InstituteState }
      const instituteId = state.institute.selectedInstitute?._id
      
      if (!instituteId) {
        throw new Error('No institute selected')
      }

      const response = await fetch(`/api/institutes/${instituteId}/faculty`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch faculty')
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Fetch faculty error:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch faculty')
    }
  }
)

export const createFaculty = createAsyncThunk(
  'institute/createFaculty',
  async (facultyData: Omit<FacultyMember, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { institute: InstituteState }
      const instituteId = state.institute.selectedInstitute?._id
      
      if (!instituteId) {
        throw new Error('No institute selected')
      }

      const response = await fetch(`/api/institutes/${instituteId}/faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facultyData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create faculty')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Create faculty error:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create faculty')
    }
  }
)

export const updateFaculty = createAsyncThunk(
  'institute/updateFaculty',
  async ({ facultyId, facultyData }: { facultyId: string, facultyData: Partial<FacultyMember> }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { institute: InstituteState }
      const instituteId = state.institute.selectedInstitute?._id
      
      if (!instituteId) {
        throw new Error('No institute selected')
      }

      const response = await fetch(`/api/institutes/${instituteId}/faculty/${facultyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facultyData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update faculty')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update faculty error:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update faculty')
    }
  }
)

export const deleteFaculty = createAsyncThunk(
  'institute/deleteFaculty',
  async (facultyId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { institute: InstituteState }
      const instituteId = state.institute.selectedInstitute?._id
      
      if (!instituteId) {
        throw new Error('No institute selected')
      }

      const response = await fetch(`/api/institutes/${instituteId}/faculty/${facultyId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete faculty')
      }
      
      const data = await response.json()
      return { ...data, facultyId }
    } catch (error) {
      console.error('Delete faculty error:', error)
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete faculty')
    }
  }
)

const instituteSlice = createSlice({
  name: 'institute',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentInstitute: (state, action: PayloadAction<Institute | null>) => {
      state.currentInstitute = action.payload
    },
    setSelectedInstitute: (state, action: PayloadAction<InstituteData | null>) => {
      state.selectedInstitute = action.payload
      // Also update the current institute if it matches
      if (action.payload && state.currentInstitute?.id === action.payload._id.toString()) {
        state.currentInstitute = {
          ...state.currentInstitute,
          id: action.payload._id
        } as Institute
      }
    },
    setUserInstitutes: (state, action: PayloadAction<InstituteData[]>) => {
      state.userInstitutes = action.payload
      // Auto-select if only one institute
      if (action.payload.length === 1 && !state.selectedInstitute) {
        state.selectedInstitute = action.payload[0]
      }
    },
    setSearchFilters: (state, action: PayloadAction<InstituteSearchFilters>) => {
      state.searchFilters = action.payload
    },
    updateInstituteInList: (state, action: PayloadAction<Institute>) => {
      const index = state.institutes.findIndex(institute => institute.id === action.payload.id)
      if (index !== -1) {
        state.institutes[index] = action.payload
      }
    },
    // New reducers for enhanced features
    removeDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(doc => doc.id !== action.payload)
    },
    updateDocument: (state, action: PayloadAction<DocumentInfo>) => {
      const index = state.documents.findIndex(doc => doc.id === action.payload.id)
      if (index !== -1) {
        state.documents[index] = action.payload
      }
    },
    removeHighlight: (state, action: PayloadAction<string>) => {
      state.highlights = state.highlights.filter(highlight => highlight.id !== action.payload)
    },
    updateHighlight: (state, action: PayloadAction<Highlight>) => {
      const index = state.highlights.findIndex(highlight => highlight.id === action.payload.id)
      if (index !== -1) {
        state.highlights[index] = action.payload
      }
    },
    removeLocation: (state, action: PayloadAction<string>) => {
      state.locations = state.locations.filter(location => location.id !== action.payload)
    },
    updateLocation: (state, action: PayloadAction<Location>) => {
      const index = state.locations.findIndex(location => location.id === action.payload.id)
      if (index !== -1) {
        state.locations[index] = action.payload
      }
    },
    removeFacility: (state, action: PayloadAction<string>) => {
      state.facilities = state.facilities.filter(facility => facility.id !== action.payload)
    },
    updateFacility: (state, action: PayloadAction<Facility>) => {
      const index = state.facilities.findIndex(facility => facility.id === action.payload.id)
      if (index !== -1) {
        state.facilities[index] = action.payload
      }
    },
    removeRanking: (state, action: PayloadAction<string>) => {
      state.rankings = state.rankings.filter(ranking => ranking.id !== action.payload)
    },
    updateRanking: (state, action: PayloadAction<Ranking>) => {
      const index = state.rankings.findIndex(ranking => ranking.id === action.payload.id)
      if (index !== -1) {
        state.rankings[index] = action.payload
      }
    },
    removeAward: (state, action: PayloadAction<string>) => {
      state.awards = state.awards.filter(award => award.id !== action.payload)
    },
    updateAward: (state, action: PayloadAction<Award>) => {
      const index = state.awards.findIndex(award => award.id === action.payload.id)
      if (index !== -1) {
        state.awards[index] = action.payload
      }
    },
    removeScholarship: (state, action: PayloadAction<string>) => {
      state.scholarships = state.scholarships.filter(scholarship => scholarship.id !== action.payload)
    },
    updateScholarship: (state, action: PayloadAction<Scholarship>) => {
      const index = state.scholarships.findIndex(scholarship => scholarship.id === action.payload.id)
      if (index !== -1) {
        state.scholarships[index] = action.payload
      }
    },
    // Faculty reducers
    removeFacultyMember: (state, action: PayloadAction<string>) => {
      state.faculty = state.faculty.filter(member => member._id !== action.payload)
    },
    updateFacultyMember: (state, action: PayloadAction<FacultyMember>) => {
      const index = state.faculty.findIndex(member => member._id === action.payload._id)
      if (index !== -1) {
        state.faculty[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch institutes
      .addCase(fetchInstitutes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInstitutes.fulfilled, (state, action) => {
        state.loading = false
        // Handle ApiResponse wrapping PaginatedResponse from API service
        const apiResponse = action.payload as ApiResponse<PaginatedResponse<Institute>>
        if (apiResponse.success && apiResponse.data) {
          const paginatedResponse = apiResponse.data
          state.institutes = paginatedResponse.data
          state.pagination = {
            page: paginatedResponse.page,
            limit: paginatedResponse.limit,
            total: paginatedResponse.total,
            hasMore: paginatedResponse.hasMore,
          }
        }
      })
      .addCase(fetchInstitutes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch institutes'
      })
      // Search institutes
      .addCase(searchInstitutes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchInstitutes.fulfilled, (state, action) => {
        state.loading = false
        const apiResponse = action.payload as ApiResponse<PaginatedResponse<Institute>>
        if (apiResponse.success && apiResponse.data) {
          const paginatedResponse = apiResponse.data
          state.institutes = paginatedResponse.data
          state.pagination = {
            page: paginatedResponse.page,
            limit: paginatedResponse.limit,
            total: paginatedResponse.total,
            hasMore: paginatedResponse.hasMore,
          }
        }
      })
      .addCase(searchInstitutes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to search institutes'
      })
      // Create institute
      .addCase(createInstitute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createInstitute.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Institute>
        if (response.data) {
          state.institutes.unshift(response.data)
          state.currentInstitute = response.data
        }
      })
      .addCase(createInstitute.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create institute'
      })
      // Update institute
      .addCase(updateInstitute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInstitute.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Institute>
        if (response.data) {
          const index = state.institutes.findIndex(institute => institute.id === response.data!.id)
          if (index !== -1) {
            state.institutes[index] = response.data!
          }
          if (state.currentInstitute?.id === response.data!.id) {
            state.currentInstitute = response.data!
          }
        }
      })
      .addCase(updateInstitute.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update institute'
      })
      // Fetch institute by ID
      .addCase(fetchInstituteById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInstituteById.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Institute>
        if (response.data) {
          state.currentInstitute = response.data
        }
      })
      .addCase(fetchInstituteById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch institute'
      })
      // Fetch institute profile
      .addCase(fetchInstituteProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInstituteProfile.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<InstituteProfile>
        if (response.data) {
          state.instituteProfile = response.data
        }
      })
      .addCase(fetchInstituteProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch institute profile'
      })
      // Fetch my institute
      .addCase(fetchMyInstitute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyInstitute.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Institute>
        if (response.data) {
          state.currentInstitute = response.data
        }
      })
      .addCase(fetchMyInstitute.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch my institute'
      })
      // Verify institute
      .addCase(verifyInstitute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyInstitute.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<Institute>
        if (response.data) {
          const index = state.institutes.findIndex(institute => institute.id === response.data!.id)
          if (index !== -1) {
            state.institutes[index] = response.data!
          }
          if (state.currentInstitute?.id === response.data!.id) {
            state.currentInstitute = response.data!
          }
        }
      })
      .addCase(verifyInstitute.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to verify institute'
      })
      // Registration Details
      .addCase(updateRegistrationDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRegistrationDetails.fulfilled, (state, action) => {
        state.loading = false
        state.registrationDetails = action.payload.data
      })
      .addCase(updateRegistrationDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update registration details'
      })
      // Upload Document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false
        state.documents.push(action.payload.data)
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to upload document'
      })
      // Add Highlight
      .addCase(addHighlight.fulfilled, (state, action) => {
        state.highlights.push(action.payload.data)
      })
      // Add Location
      .addCase(addLocation.fulfilled, (state, action) => {
        state.locations.push(action.payload.data)
      })
      // Add Facility
      .addCase(addFacility.fulfilled, (state, action) => {
        state.facilities.push(action.payload.data)
      })
      // Add Ranking
      .addCase(addRanking.fulfilled, (state, action) => {
        state.rankings.push(action.payload.data)
      })
      // Add Award
      .addCase(addAward.fulfilled, (state, action) => {
        state.awards.push(action.payload.data)
      })
      // Add Scholarship
      .addCase(addScholarship.fulfilled, (state, action) => {
        state.scholarships.push(action.payload.data)
      })
      // Fetch User Institutes
      .addCase(fetchUserInstitutes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserInstitutes.fulfilled, (state, action) => {
        console.log('Redux: fetchUserInstitutes.fulfilled called with payload:', action.payload);
        state.loading = false
        
        // Handle double-wrapped API response
        const outerResponse = action.payload as ApiResponse<any>
        console.log('Redux: Outer response:', outerResponse);
        
        if (outerResponse.success && outerResponse.data) {
          // The actual API response is nested in outerResponse.data
          const actualResponse = outerResponse.data
          console.log('Redux: Actual API response:', actualResponse);
          
          if (actualResponse.success && actualResponse.data) {
            console.log('Redux: Setting userInstitutes to:', actualResponse.data);
            state.userInstitutes = actualResponse.data
            console.log('Redux: State userInstitutes after setting:', state.userInstitutes);
            
            // Auto-select if only one institute
            if (actualResponse.data.length === 1 && !state.selectedInstitute) {
              console.log('Redux: Auto-selecting single institute:', actualResponse.data[0]);
              state.selectedInstitute = actualResponse.data[0]
              console.log('Redux: State selectedInstitute after setting:', state.selectedInstitute);
            }
          } else {
            console.log('Redux: Actual response not successful or no data');
          }
        } else {
          console.log('Redux: Outer response not successful or no data');
        }
      })
      .addCase(fetchUserInstitutes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch user institutes'
      })
      // Fetch Institute Data by ID
      .addCase(fetchInstituteData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInstituteData.fulfilled, (state, action) => {
        state.loading = false
        const response = action.payload as ApiResponse<InstituteData>
        if (response.success && response.data) {
          // Update the selected institute with fresh data
          if (state.selectedInstitute?._id === response.data._id) {
            state.selectedInstitute = response.data
          }
          // Also update in userInstitutes array
          const index = state.userInstitutes.findIndex(inst => inst._id === response.data!._id)
          if (index !== -1) {
            state.userInstitutes[index] = response.data!
          }
        }
      })
      .addCase(fetchInstituteData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch institute data'
      })
      // Upload Institute Image
      .addCase(uploadInstituteImage.pending, (state) => {
        state.isUploadingImage = true
        state.error = null
      })
      .addCase(uploadInstituteImage.fulfilled, (state, action) => {
        state.isUploadingImage = false
        if (action.payload && action.payload.imageUrl) {
          // Update the selected institute with new image
          if (state.selectedInstitute && state.selectedInstitute._id === action.payload.instituteId) {
            if (action.payload.type === 'logo') {
              state.selectedInstitute.logo = action.payload.imageUrl
            } else if (action.payload.type === 'cover') {
              state.selectedInstitute.coverImage = action.payload.imageUrl
            }
          }
          // Also update in userInstitutes array
          const index = state.userInstitutes.findIndex(inst => inst._id === action.payload.instituteId)
          if (index !== -1) {
            if (action.payload.type === 'logo') {
              state.userInstitutes[index].logo = action.payload.imageUrl
            } else if (action.payload.type === 'cover') {
              state.userInstitutes[index].coverImage = action.payload.imageUrl
            }
          }
        }
        state.error = null
      })
      .addCase(uploadInstituteImage.rejected, (state, action) => {
        state.isUploadingImage = false
        state.error = action.payload as string
      })
      // Faculty Management
      .addCase(fetchFaculty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFaculty.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.success) {
          state.faculty = action.payload.faculty
        }
        state.error = null
      })
      .addCase(fetchFaculty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createFaculty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createFaculty.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.success) {
          state.faculty.push(action.payload.faculty)
        }
        state.error = null
      })
      .addCase(createFaculty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateFaculty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFaculty.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.success) {
          const index = state.faculty.findIndex(member => member._id === action.payload.faculty._id)
          if (index !== -1) {
            state.faculty[index] = action.payload.faculty
          }
        }
        state.error = null
      })
      .addCase(updateFaculty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deleteFaculty.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteFaculty.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.success) {
          state.faculty = state.faculty.filter(member => member._id !== action.payload.facultyId)
        }
        state.error = null
      })
      .addCase(deleteFaculty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { 
  clearError, 
  setCurrentInstitute,
  setSelectedInstitute,
  setUserInstitutes, 
  setSearchFilters, 
  updateInstituteInList,
  removeDocument,
  updateDocument,
  removeHighlight,
  updateHighlight,
  removeLocation,
  updateLocation,
  removeFacility,
  updateFacility,
  removeRanking,
  updateRanking,
  removeAward,
  updateAward,
  removeScholarship,
  updateScholarship,
  removeFacultyMember,
  updateFacultyMember,
} = instituteSlice.actions
export default instituteSlice.reducer
