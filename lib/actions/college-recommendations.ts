'use server'

import { cache } from 'react'

// Types for college data
export interface College {
  id: string
  name: string
  slug: string
  location: string
  state: string
  type: string
  specializations: string[]
  rating: number
  totalReviews: number
  establishedYear: number
  courses: number
  totalFees: string
  averagePackage: string
  highestPackage: string
  examsAccepted: string[]
  description: string
  image: string
  featured: boolean
  verified: boolean
  nirf_ranking?: number
  placement_percentage: number
  top_recruiters: string[]
}

export interface FilterOptions {
  locations: Array<{ value: string; label: string; count: number }>
  specializations: Array<{ value: string; label: string; count: number }>
  types: Array<{ value: string; label: string; count: number }>
  feeRanges: Array<{ value: string; label: string; count: number }>
}

export interface CollegeSearchParams {
  location?: string
  specialization?: string
  type?: string
  query?: string
  page?: number
  sortBy?: string
  feeRange?: string
}

export interface CollegeSearchResult {
  colleges: College[]
  total: number
  totalPages: number
  currentPage: number
  filters: FilterOptions
}

// Mock data for colleges
const mockColleges: College[] = [
  {
    id: '1',
    name: 'L D College of Engineering',
    slug: 'ld-college-engineering-ahmedabad',
    location: 'Ahmedabad',
    state: 'Gujarat',
    type: 'Government',
    specializations: ['Computer Science', 'Mechanical', 'Civil', 'Electrical'],
    rating: 4.3,
    totalReviews: 847,
    establishedYear: 1948,
    courses: 16,
    totalFees: '₹4.48 K',
    averagePackage: '₹5.75 LPA',
    highestPackage: '₹45 LPA',
    examsAccepted: ['JEE Main', 'GUJCET'],
    description: 'L.D. College of Engineering is one of the premier engineering institutions in Gujarat, known for its excellent academic programs and industry connections.',
    image: '/images/colleges/ld-college.jpg',
    featured: true,
    verified: true,
    nirf_ranking: 87,
    placement_percentage: 85,
    top_recruiters: ['TCS', 'Infosys', 'L&T', 'Wipro']
  },
  {
    id: '2',
    name: 'Institute of Technology, Nirma University',
    slug: 'nirma-university-ahmedabad',
    location: 'Ahmedabad',
    state: 'Gujarat',
    type: 'Private',
    specializations: ['Computer Science', 'Electronics', 'Mechanical', 'Chemical'],
    rating: 4.2,
    totalReviews: 623,
    establishedYear: 2000,
    courses: 8,
    totalFees: '₹10.2 L',
    averagePackage: '₹8.5 LPA',
    highestPackage: '₹55 LPA',
    examsAccepted: ['JEE Main', 'JEE Advanced'],
    description: 'Nirma University is a leading private university known for its state-of-the-art infrastructure and strong industry partnerships.',
    image: '/images/colleges/nirma-university.jpg',
    featured: true,
    verified: true,
    nirf_ranking: 45,
    placement_percentage: 92,
    top_recruiters: ['Microsoft', 'Amazon', 'Google', 'Adobe']
  },
  {
    id: '3',
    name: 'Sardar Vallabhbhai National Institute of Technology',
    slug: 'svnit-surat',
    location: 'Surat',
    state: 'Gujarat',
    type: 'Government',
    specializations: ['Computer Science', 'Electrical', 'Mechanical', 'Civil'],
    rating: 4.5,
    totalReviews: 1205,
    establishedYear: 1961,
    courses: 12,
    totalFees: '₹5.5 L',
    averagePackage: '₹12.5 LPA',
    highestPackage: '₹65 LPA',
    examsAccepted: ['JEE Main', 'JEE Advanced'],
    description: 'SVNIT Surat is a National Institute of Technology known for its excellent academic standards and research facilities.',
    image: '/images/colleges/svnit.jpg',
    featured: true,
    verified: true,
    nirf_ranking: 25,
    placement_percentage: 95,
    top_recruiters: ['Google', 'Microsoft', 'Samsung', 'Intel']
  },
  {
    id: '4',
    name: 'Dharmsinh Desai University',
    slug: 'ddu-nadiad',
    location: 'Nadiad',
    state: 'Gujarat',
    type: 'Private',
    specializations: ['Information Technology', 'Computer Science', 'Mechanical'],
    rating: 4.1,
    totalReviews: 456,
    establishedYear: 1968,
    courses: 10,
    totalFees: '₹8.5 L',
    averagePackage: '₹6.8 LPA',
    highestPackage: '₹35 LPA',
    examsAccepted: ['JEE Main', 'GUJCET'],
    description: 'DDU is known for its strong emphasis on practical learning and industry-oriented curriculum.',
    image: '/images/colleges/ddu.jpg',
    featured: false,
    verified: true,
    placement_percentage: 78,
    top_recruiters: ['TCS', 'Cognizant', 'Capgemini', 'HCL']
  },
  {
    id: '5',
    name: 'Pandit Deendayal Energy University',
    slug: 'pdeu-gandhinagar',
    location: 'Gandhinagar',
    state: 'Gujarat',
    type: 'Private',
    specializations: ['Petroleum Engineering', 'Computer Science', 'Electrical'],
    rating: 4.0,
    totalReviews: 342,
    establishedYear: 2007,
    courses: 8,
    totalFees: '₹12.8 L',
    averagePackage: '₹7.2 LPA',
    highestPackage: '₹42 LPA',
    examsAccepted: ['JEE Main', 'PDEU Entrance Test'],
    description: 'PDEU specializes in energy and petroleum engineering with modern facilities and industry connections.',
    image: '/images/colleges/pdeu.jpg',
    featured: false,
    verified: true,
    placement_percentage: 82,
    top_recruiters: ['Reliance', 'ONGC', 'Shell', 'BP']
  }
]

// Generate more mock data for different locations
const generateMockColleges = (): College[] => {
  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata']
  const additionalColleges: College[] = []

  locations.forEach((location, index) => {
    additionalColleges.push({
      id: `${6 + index}`,
      name: `${location} Institute of Technology`,
      slug: `${location.toLowerCase()}-institute-technology`,
      location,
      state: location === 'Mumbai' ? 'Maharashtra' : location === 'Delhi' ? 'Delhi' : 'Karnataka',
      type: index % 2 === 0 ? 'Government' : 'Private',
      specializations: ['Computer Science', 'Electronics', 'Mechanical'],
      rating: 3.8 + Math.random() * 0.7,
      totalReviews: Math.floor(Math.random() * 800) + 200,
      establishedYear: 1960 + Math.floor(Math.random() * 50),
      courses: Math.floor(Math.random() * 10) + 6,
      totalFees: `₹${(Math.random() * 10 + 3).toFixed(1)} L`,
      averagePackage: `₹${(Math.random() * 8 + 4).toFixed(1)} LPA`,
      highestPackage: `₹${(Math.random() * 30 + 25).toFixed(0)} LPA`,
      examsAccepted: ['JEE Main', 'State CET'],
      description: `${location} Institute of Technology is a premier engineering institution known for its academic excellence.`,
      image: `/images/colleges/${location.toLowerCase()}-tech.jpg`,
      featured: Math.random() > 0.7,
      verified: true,
      placement_percentage: Math.floor(Math.random() * 20) + 70,
      top_recruiters: ['TCS', 'Infosys', 'Wipro', 'Accenture']
    })
  })

  return [...mockColleges, ...additionalColleges]
}

// Cache the function for better performance
export const getCollegeRecommendations = cache(async (
  params: CollegeSearchParams
): Promise<CollegeSearchResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))

  const {
    location,
    specialization,
    type,
    query,
    page = 1,
    sortBy = 'popularity',
    feeRange
  } = params

  let filteredColleges = generateMockColleges()

  // Apply filters
  if (location) {
    filteredColleges = filteredColleges.filter(college => 
      college.location.toLowerCase().includes(location.toLowerCase()) ||
      college.state.toLowerCase().includes(location.toLowerCase())
    )
  }

  if (specialization) {
    filteredColleges = filteredColleges.filter(college =>
      college.specializations.some(spec => 
        spec.toLowerCase().includes(specialization.toLowerCase())
      )
    )
  }

  if (type) {
    filteredColleges = filteredColleges.filter(college =>
      college.type.toLowerCase() === type.toLowerCase()
    )
  }

  if (query) {
    filteredColleges = filteredColleges.filter(college =>
      college.name.toLowerCase().includes(query.toLowerCase()) ||
      college.location.toLowerCase().includes(query.toLowerCase()) ||
      college.specializations.some(spec => 
        spec.toLowerCase().includes(query.toLowerCase())
      )
    )
  }

  // Apply sorting
  switch (sortBy) {
    case 'rating':
      filteredColleges.sort((a, b) => b.rating - a.rating)
      break
    case 'fees-low':
      filteredColleges.sort((a, b) => {
        const aFee = parseFloat(a.totalFees.replace(/[₹LK\s]/g, ''))
        const bFee = parseFloat(b.totalFees.replace(/[₹LK\s]/g, ''))
        return aFee - bFee
      })
      break
    case 'fees-high':
      filteredColleges.sort((a, b) => {
        const aFee = parseFloat(a.totalFees.replace(/[₹LK\s]/g, ''))
        const bFee = parseFloat(b.totalFees.replace(/[₹LK\s]/g, ''))
        return bFee - aFee
      })
      break
    case 'popularity':
    default:
      filteredColleges.sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return b.totalReviews - a.totalReviews
      })
  }

  // Pagination
  const pageSize = 10
  const totalPages = Math.ceil(filteredColleges.length / pageSize)
  const startIndex = (page - 1) * pageSize
  const paginatedColleges = filteredColleges.slice(startIndex, startIndex + pageSize)

  // Generate filter options
  const allColleges = generateMockColleges()
  const filters: FilterOptions = {
    locations: Array.from(new Set(allColleges.map(c => c.location)))
      .map(loc => ({
        value: loc.toLowerCase(),
        label: loc,
        count: allColleges.filter(c => c.location === loc).length
      })),
    specializations: Array.from(new Set(allColleges.flatMap(c => c.specializations)))
      .map(spec => ({
        value: spec.toLowerCase().replace(/\s+/g, '-'),
        label: spec,
        count: allColleges.filter(c => c.specializations.includes(spec)).length
      })),
    types: Array.from(new Set(allColleges.map(c => c.type)))
      .map(type => ({
        value: type.toLowerCase(),
        label: type,
        count: allColleges.filter(c => c.type === type).length
      })),
    feeRanges: [
      { value: '0-5', label: 'Under ₹5L', count: allColleges.filter(c => parseFloat(c.totalFees.replace(/[₹LK\s]/g, '')) < 5).length },
      { value: '5-10', label: '₹5L - ₹10L', count: allColleges.filter(c => { const fee = parseFloat(c.totalFees.replace(/[₹LK\s]/g, '')); return fee >= 5 && fee < 10; }).length },
      { value: '10-15', label: '₹10L - ₹15L', count: allColleges.filter(c => { const fee = parseFloat(c.totalFees.replace(/[₹LK\s]/g, '')); return fee >= 10 && fee < 15; }).length },
      { value: '15+', label: 'Above ₹15L', count: allColleges.filter(c => parseFloat(c.totalFees.replace(/[₹LK\s]/g, '')) >= 15).length }
    ]
  }

  return {
    colleges: paginatedColleges,
    total: filteredColleges.length,
    totalPages,
    currentPage: page,
    filters
  }
})

// Server action to get individual college details
export const getCollegeDetails = cache(async (slug: string): Promise<College | null> => {
  await new Promise(resolve => setTimeout(resolve, 50))
  
  const allColleges = generateMockColleges()
  return allColleges.find(college => college.slug === slug) || null
})
