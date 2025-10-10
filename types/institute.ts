// Institute Types and Interfaces

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  coordinates: Coordinates;
  nearbyLandmarks: string[];
}

export interface Contact {
  phone: string[];
  email: string;
  website: string;
  fax?: string;
  emergencyContact?: string;
}

export interface Accreditation {
  naac?: {
    grade: string;
    cgpa: number;
    validUntil: string;
    cycleNumber: number;
  };
  nirf?: {
    overallRank?: number;
    engineeringRank?: number;
    managementRank?: number;
    year: number;
  };
  ugc?: {
    recognition: string;
    section: string;
  };
  aicte?: {
    approved: boolean;
    validUntil: string;
  };
}

export interface Overview {
  description: string;
  vision: string;
  mission: string;
  motto: string;
  founder: string;
  chancellor: string;
  viceChancellor: string;
}

export interface CampusFacilities {
  academic: string[];
  residential: string[];
  recreational: string[];
  support: string[];
}

export interface CampusDetails {
  totalArea: string;
  builtUpArea: string;
  campusType: string;
  environment: string;
  facilities: CampusFacilities;
}

export interface InstituteProgram {
  name: string;
  established: number;
  programs: string[];
}

export interface Academics {
  totalStudents: number;
  totalFaculty: number;
  studentFacultyRatio: string;
  internationalStudents: number;
  totalPrograms: number;
  institutes: InstituteProgram[];
}

export interface AdmissionReservation {
  sc: string;
  st: string;
  obc: string;
  ews: string;
  pwd: string;
}

export interface EntranceExams {
  engineering?: string[];
  management?: string[];
  law?: string[];
  pharmacy?: string[];
  [key: string]: string[] | undefined;
}

export interface Admissions {
  applicationDeadline: string;
  entranceExams: EntranceExams;
  admissionProcess: string[];
  reservationPolicy: AdmissionReservation;
}

export interface PlacementData {
  overallPlacementRate?: string | number;
  averageSalary?: string | number;
  highestSalary?: string | number;
  medianSalary?: string | number;
  companiesVisited?: number;
  totalOffers?: number;
  topRecruiters?: string[];
  placementRate?: number;
  averagePackage?: number;
  highestPackage?: number;
}

export interface Placements {
  [key: string]: any;
  sectors?: string[];
  topRecruiters?: string[];
  // Direct placement data properties (new structure)
  overallPlacementRate?: string | number;
  averageSalary?: string | number;
  highestSalary?: string | number;
  medianSalary?: string | number;
  companiesVisited?: number;
  totalOffers?: number;
  placementRate?: number;
  averagePackage?: number;
  highestPackage?: number;
}

export interface Ranking {
  agency: string;
  category: string;
  rank: number | string;
  year: number;
}

export interface Rankings {
  national: Ranking[];
  international: Ranking[];
}

export interface IncubationCenter {
  name: string;
  startupsFunded: number;
  totalFunding: string;
}

export interface ResearchAndInnovation {
  researchCenters: number;
  patentsFiled: number;
  publicationsPerYear: number;
  researchFunding: string;
  phdScholars: number;
  incubationCenter: IncubationCenter;
  collaborations: string[];
}

export interface AlumniNetwork {
  totalAlumni: number;
  notableAlumni: string[];
  alumniInFortune500: number;
  entrepreneursCreated: number;
}

// Course Related Types
export interface SemesterSubjects {
  semester: number;
  subjects: string[];
}

export interface YearSubjects {
  year: number;
  subjects: string[];
}

export interface Curriculum {
  totalCredits: number;
  coreCredits: number;
  electiveCredits: number;
  projectCredits?: number;
  practicalCredits?: number;
  semesterStructure?: SemesterSubjects[];
  yearStructure?: YearSubjects[];
}

export interface EligibilityCriteria {
  academicRequirement: string;
  minimumMarks: string;
  entranceExam: string[];
  workExperience?: string;
  ageLimit: string;
}

export interface CourseFees {
  tuitionFee: string;
  hostelFee: string;
  messFee: string;
  otherFees: string;
  totalAnnualFee: string;
  totalFee?: number; // Added for InstituteDetailPage compatibility
  scholarships: string[];
}

export interface FacultyProfile {
  totalFaculty: number;
  professors: number;
  associateProfessors: number;
  assistantProfessors: number;
  phdHolders: number;
  industryExperience?: string;
  practitionerFaculty?: number;
  notableFaculty: string[];
}

export interface CourseInfrastructure {
  laboratories?: string[];
  classrooms?: string[];
  facilities?: string[];
  software?: string[];
  hardware?: string[];
  resources?: string[];
}

export interface CareerProspects {
  averageSalary: string;
  highestSalary: string;
  placementRate: string;
  jobRoles?: string[];
  careerPaths?: string[];
  topRecruiters: string[];
  higherStudyOptions?: string[];
  sectorsHiring?: string[];
}

export interface IndustryConnections {
  internshipPartners: string[];
  collaborativeProjects?: number;
  liveProjects?: number;
  industryMentors: number;
  guestLectures?: number;
  corporateEvents?: number;
}

export interface StudentActivities {
  clubs?: string[];
  technicalClubs?: string[];
  competitions: string[];
  workshops?: string[];
  conferences?: string[];
  publications?: string[];
}

export interface PracticalTraining {
  mootCourts?: string[];
  internships: string[];
  clinicalPrograms?: string[];
}

export interface BarCouncilRecognition {
  bciApproval: string;
  enrollmentEligible: string;
  barExamEligible: string;
}

export interface CoursePlacement {
  averagePackage: number;
  highestPackage: number;
  placementRate: number;
  topRecruiters: string[];
}

export interface Course {
  id: string;
  name: string;
  degree: string;
  slug?: string;
  institute?: string;
  school?: string;
  duration: string;
  level: string;
  category: string;
  description?: string;
  objectives?: string[];
  curriculum?: Curriculum;
  eligibilityCriteria?: EligibilityCriteria;
  admissionProcess?: string[];
  fees?: CourseFees | { tuitionFee: number; totalFee: number; currency: string };
  facultyProfile?: FacultyProfile;
  infrastructure?: CourseInfrastructure;
  careerProspects?: CareerProspects;
  industryConnections?: IndustryConnections;
  studentActivities?: StudentActivities;
  specializations?: string[];
  practicalTraining?: PracticalTraining;
  barCouncilRecognition?: BarCouncilRecognition;
  totalSeats?: number;
  placements?: CoursePlacement;
  
  // Additional optional properties used in InstituteDetailPage
  educationType?: string;
  brochure?: {
    url: string;
    name?: string;
  };
  recognition?: Array<{
    name: string;
    type?: string;
  }>;
  reviewCount?: number;
  questionsCount?: number;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    locality?: string;
  };
}

export interface MediaGallery {
  photos?: {
    [category: string]: string[] | Array<{
      mediaId?: number;
      thumbUrl?: string;
      mediaUrl: string;
      widgetThumbUrl?: string;
      mediaTitle?: string;
      altText?: string;
    }>;
  };
  videos?: Array<{
    url?: string;
    mediaUrl?: string;
    title?: string;
    mediaTitle?: string;
    thumbnail?: string;
    thumbUrl?: string;
  }>;
}

export interface Institute {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  establishedYear: number;
  type: string;
  status: string;
  logo?: string;
  coverImage?: string;
  accreditation: Accreditation;
  location: Location;
  contact: Contact;
  overview: Overview;
  campusDetails: CampusDetails;
  academics: Academics;
  admissions: Admissions;
  placements: Placements;
  rankings: Rankings;
  researchAndInnovation: ResearchAndInnovation;
  alumniNetwork: AlumniNetwork;
  awards: string[];
  courses: Course[];
  mediaGallery?: MediaGallery;
}

// Search and Filter Types
export interface InstituteSearchParams {
  location?: string;
  type?: string;
  category?: string;
  query?: string;
  page?: number;
  sortBy?: string;
  establishedYear?: string;
  accreditation?: string;
}

export interface InstituteFilterOptions {
  locations: Array<{ value: string; label: string; count: number }>;
  types: Array<{ value: string; label: string; count: number }>;
  categories: Array<{ value: string; label: string; count: number }>;
  accreditations: Array<{ value: string; label: string; count: number }>;
}

export interface InstituteSearchResult {
  institutes: Institute[];
  total: number;
  totalPages: number;
  currentPage: number;
  filters: InstituteFilterOptions;
}

// Course Search Types
export interface CourseSearchParams {
  institute?: string;
  degree?: string;
  category?: string;
  level?: string;
  duration?: string;
  query?: string;
  page?: number;
  sortBy?: string;
}

export interface CourseFilterOptions {
  degrees: Array<{ value: string; label: string; count: number }>;
  categories: Array<{ value: string; label: string; count: number }>;
  levels: Array<{ value: string; label: string; count: number }>;
  durations: Array<{ value: string; label: string; count: number }>;
}

export interface CourseSearchResult {
  courses: Course[];
  total: number;
  totalPages: number;
  currentPage: number;
  filters: CourseFilterOptions;
}

// Entity Type for differentiation
export type EntityType = 'institute' | 'course';

export interface EntityMetadata {
  type: EntityType;
  featured?: boolean;
  verified?: boolean;
  rating?: number;
  totalReviews?: number;
}
