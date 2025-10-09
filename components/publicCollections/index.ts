// Export all public collection components
export { CollegeDetailPage } from './CollegeDetailPage';
export { CollegeFilters } from './CollegeFilters';
export { CollegeGrid } from './CollegeGrid';
export { CollegeSearchHeader } from './CollegeSearchHeader';
export { LoadingSkeleton } from './LoadingSkeleton';

// Export institute components
export { InstituteCard } from './InstituteCard';
export { InstituteDetailPage } from './InstituteDetailPage';
export { InstituteFilters } from './InstituteFilters';
export { InstituteGrid } from './InstituteGrid';
export { InstituteSearchHeader } from './InstituteSearchHeader';

// Re-export types and functions from college recommendations
export type {
  College,
  FilterOptions,
  CollegeSearchParams,
  CollegeSearchResult
} from '@/lib/actions/college-recommendations';

export {
  getCollegeRecommendations,
  getCollegeDetails
} from '@/lib/actions/college-recommendations';

// Re-export types and functions from institute recommendations
export type {
  Institute,
  Course,
  InstituteFilterOptions,
  InstituteSearchParams,
  InstituteSearchResult,
  CourseSearchParams,
  CourseSearchResult
} from '@/types/institute';

export {
  getInstituteRecommendations,
  getInstituteDetails,
  getCourseDetails,
  getInstituteCourses
} from '@/lib/actions/institute-recommendations';
