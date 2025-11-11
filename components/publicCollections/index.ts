// Export institute components
export { InstituteCard } from "./InstituteCard";
export { InstituteDetailPage } from "./InstituteDetailPage";
export { ProgramCard } from "./ProgramCard";
export { CourseCard } from "./CourseCard";
export { UnifiedFilters } from "./UnifiedFilters";

// Re-export types and functions from institute recommendations
export type {
  Institute,
  Course,
  InstituteFilterOptions,
  InstituteSearchParams,
  InstituteSearchResult,
  CourseSearchParams,
  CourseSearchResult,
} from "@/types/institute";

export {
  getInstituteRecommendations,
  getInstituteDetails,
  getCourseDetails,
  getInstituteCourses,
} from "@/lib/actions/institute-recommendations";
