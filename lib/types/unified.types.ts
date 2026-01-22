// lib/types/unified.types.ts - Comprehensive unified type system
import { z } from "zod";

// ============================================================================
// BASE ENUMS AND TYPES
// ============================================================================

export type UserRole = "user" | "business" | "institute" | "admin";
export type UserType = "student" | "professional";
export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "FREELANCE";
export type LanguageLevel =
  | "BASIC"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "FLUENT"
  | "NATIVE";
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type ProfileStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending_verification";
export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

// ============================================================================
// PERSONAL DETAILS SCHEMA
// ============================================================================

export const PersonalDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  middleName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  professionalHeadline: z.string().max(200).optional(),
  publicProfileId: z
    .string()
    .min(3, "Profile ID must be at least 3 characters")
    .max(30)
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Profile ID can only contain letters, numbers, hyphens, and underscores"
    ),
  aboutMe: z.string().max(2000).optional(),
  phone: z.string().optional(),
  interests: z.array(z.string()).optional().default([]),
  professionalBadges: z.array(z.string()).optional().default([]),
  nationality: z.string().optional(),
  languages: z.array(z.string()).optional().default([]),
});

// ============================================================================
// WORK EXPERIENCE SCHEMA
// ============================================================================

export const WorkPositionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Position title is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "FREELANCE",
  ]),
  skills: z.array(z.string()).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
  salary: z
    .object({
      amount: z.number().optional(),
      currency: z.string().optional(),
      isPublic: z.boolean().default(false),
    })
    .optional(),
});

export const WorkExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company name is required"),
  location: z.string().optional(),
  positions: z
    .array(WorkPositionSchema)
    .min(1, "At least one position is required"),
  companyLogo: z.string().url().optional(),
  companyWebsite: z.string().url().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
});

// ============================================================================
// EDUCATION SCHEMA
// ============================================================================

export const EducationSchema = z.object({
  id: z.string(),
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution name is required"),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  location: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
  institutionLogo: z.string().url().optional(),
  institutionWebsite: z.string().url().optional(),
  accreditation: z.string().optional(),
  honors: z.array(z.string()).optional().default([]),
});

// ============================================================================
// SKILLS AND LANGUAGES SCHEMA
// ============================================================================

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Skill name is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  category: z.string().optional(),
  verified: z.boolean().default(false),
  endorsements: z.number().default(0),
  yearsOfExperience: z.number().optional(),
});

export const LanguageSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Language name is required"),
  level: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "FLUENT", "NATIVE"]),
  certifications: z.array(z.string()).optional().default([]),
  isNative: z.boolean().default(false),
});

// ============================================================================
// CERTIFICATIONS AND ACHIEVEMENTS
// ============================================================================

export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional(),
  skills: z.array(z.string()).optional().default([]),
  verified: z.boolean().default(false),
});

export const AchievementSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Achievement title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  issuer: z.string().optional(),
  category: z.string().optional(),
  evidence: z.string().url().optional(),
});

// ============================================================================
// CONTACT AND SOCIAL LINKS
// ============================================================================

export const ContactSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  isPrimary: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  type: z.enum(["personal", "work", "other"]).default("personal"),
});

export const SocialLinksSchema = z
  .object({
    linkedin: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    github: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    facebook: z.string().url().optional().or(z.literal("")),
    youtube: z.string().url().optional().or(z.literal("")),
    portfolio: z.string().url().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    behance: z.string().url().optional().or(z.literal("")),
    dribbble: z.string().url().optional().or(z.literal("")),
  })
  .optional();

// ============================================================================
// LOCATION AND ADDRESS
// ============================================================================

export const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().optional(),
  coordinates: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
    .optional(),
});

// ============================================================================
// STATS AND PROGRESS TRACKING
// ============================================================================

export const StatsSchema = z
  .object({
    completedCourses: z.number().default(0),
    skillsAssessed: z.number().default(0),
    careerGoals: z.number().default(0),
    networkSize: z.number().default(0),
    profileViews: z.number().default(0),
    connections: z.number().default(0),
    endorsements: z.number().default(0),
    recommendations: z.number().default(0),
  })
  .optional();

export const ProgressSchema = z
  .object({
    overall: z.number().min(0).max(100).default(0),
    skills: z.number().min(0).max(100).default(0),
    goals: z.number().min(0).max(100).default(0),
    profile: z.number().min(0).max(100).default(0),
  })
  .optional();

// ============================================================================
// MAIN USER PROFILE SCHEMA
// ============================================================================

export const UserProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email().optional(),
  role: z.enum(["user", "business", "institute", "admin"]).optional(),
  userType: z.enum(["student", "professional"]).optional(),

  // Profile Images
  profileImage: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  avatar: z.string().url().optional(), // For backward compatibility

  // Basic Info
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),

  // Verification and Status
  verified: z.boolean().default(false),
  emailVerified: z.boolean().default(false),
  status: z
    .enum(["active", "inactive", "suspended", "pending_verification"])
    .default("active"),
  verificationStatus: z
    .enum(["unverified", "pending", "verified", "rejected"])
    .default("unverified"),

  // Social Metrics
  followers: z.number().default(0),
  following: z.number().default(0),

  // Extended Profile Data
  personalDetails: PersonalDetailsSchema.optional(),
  skills: z.array(SkillSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  workExperiences: z.array(WorkExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  achievements: z.array(AchievementSchema).default([]),
  contacts: z.array(ContactSchema).default([]),
  socialLinks: SocialLinksSchema,
  address: AddressSchema.optional(),
  stats: StatsSchema,
  progress: ProgressSchema,

  // System Fields
  roles: z.array(z.string()).default([]),
  activeRole: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  needsOnboarding: z.boolean().default(false),
  needsRoleSelection: z.boolean().default(false),
  provider: z.string().default("credentials"),

  // Privacy Settings
  privacySettings: z
    .object({
      profileVisibility: z
        .enum(["public", "connections", "private"])
        .default("public"),
      showEmail: z.boolean().default(false),
      showPhone: z.boolean().default(false),
      showLocation: z.boolean().default(true),
      allowMessages: z.boolean().default(true),
      showOnlineStatus: z.boolean().default(true),
    })
    .optional(),

  // Notification Preferences
  notificationPreferences: z
    .object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      inApp: z.boolean().default(true),
      types: z
        .record(
          z.object({
            email: z.boolean().default(true),
            push: z.boolean().default(true),
            inApp: z.boolean().default(true),
          })
        )
        .optional(),
    })
    .optional(),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  lastActiveAt: z.date().optional(),
  onboardingCompletedAt: z.date().optional(),
});

// ============================================================================
// BUSINESS PROFILE SCHEMA
// ============================================================================

export const BusinessProfileSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  size: z.enum(["startup", "small", "medium", "large", "enterprise"]),
  description: z.string().min(50, "Description must be at least 50 characters"),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  publicProfileId: z.string().optional(),

  // Business Details
  foundedYear: z.number().optional(),
  revenue: z.string().optional(),
  employeeCount: z.number().optional(),
  jobPostings: z.number().default(0),
  headquarters: AddressSchema.optional(),

  // Contact Information
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }),

  // Business Features
  services: z.array(z.string()).default([]),
  awards: z
    .array(
      z.object({
        name: z.string(),
        year: z.number(),
        description: z.string().optional(),
      })
    )
    .default([]),

  // Verification
  isVerified: z.boolean().default(false),
  verificationDocuments: z.array(z.string()).default([]),

  // Status
  status: z
    .enum(["active", "inactive", "suspended", "pending_verification"])
    .default("active"),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ============================================================================
// INSTITUTE PROFILE SCHEMA
// ============================================================================

export const InstituteProfileSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  instituteName: z.string().min(1, "Institute name is required"),
  type: z.enum([
    "university",
    "college",
    "technical_institute",
    "vocational_school",
    "online_university",
    "research_institute",
    "training_center",
    "academy",
    "school",
  ]),
  description: z.string().min(50, "Description must be at least 50 characters"),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  publicProfileId: z.string().optional(),

  // Institute Details
  establishedYear: z.number().optional(),
  accreditation: z.array(z.string()).default([]),
  ranking: z.string().optional(),
  studentCount: z.number().optional(),
  facultyCount: z.number().optional(),

  // Location
  address: AddressSchema.optional(),
  campuses: z
    .array(
      z.object({
        name: z.string(),
        address: AddressSchema,
        isMain: z.boolean().default(false),
      })
    )
    .default([]),

  // Contact Information
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }),

  // Academic Information
  programs: z.array(z.string()).default([]),
  departments: z.array(z.string()).default([]),
  facilities: z.array(z.string()).default([]),

  // Verification
  isVerified: z.boolean().default(false),
  verificationDocuments: z.array(z.string()).default([]),

  // Status
  status: z
    .enum(["active", "inactive", "suspended", "pending_verification"])
    .default("active"),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ============================================================================
// SEARCH AND FILTER SCHEMAS
// ============================================================================

export const SearchFiltersSchema = z.object({
  query: z.string().optional(),
  category: z
    .enum([
      "all",
      "users",
      "businesses",
      "institutes",
      "jobs",
      "courses",
      "exams",
    ])
    .default("all"),
  location: z.string().optional(),
  radius: z.number().optional(),
  skills: z.array(z.string()).optional(),
  experience: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  salary: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().optional(),
    })
    .optional(),
  dateRange: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
  verified: z.boolean().optional(),
  sortBy: z
    .enum(["relevance", "date", "rating", "salary", "distance"])
    .default("relevance"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PersonalDetails = z.infer<typeof PersonalDetailsSchema>;
export type WorkPosition = z.infer<typeof WorkPositionSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type SocialLinks = z.infer<typeof SocialLinksSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Stats = z.infer<typeof StatsSchema>;
export type Progress = z.infer<typeof ProgressSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;
export type InstituteProfile = z.infer<typeof InstituteProfileSchema>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

// ============================================================================
// UPDATE SCHEMAS
// ============================================================================

export const UserProfileUpdateSchema = UserProfileSchema.partial();
export const BusinessProfileUpdateSchema = BusinessProfileSchema.partial();
export const InstituteProfileUpdateSchema = InstituteProfileSchema.partial();

// ============================================================================
// DATABASE DOCUMENT INTERFACES
// ============================================================================

export interface UserDocument {
  _id: any;
  name: string;
  email: string;
  password?: string | null;
  role: UserRole;
  roles?: string[];
  activeRole?: string | null;
  userType?: UserType;
  organizationId?: any;
  avatar?: string | null;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  skills?: string[];
  languages?: Language[];
  interests?: string[];
  socialLinks?: Record<string, string>;
  permissions?: string[];
  needsOnboarding?: boolean;
  needsRoleSelection?: boolean;
  provider?: string;
  profileImage?: string;
  coverImage?: string;
  verified?: boolean;
  emailVerified?: boolean;
  status?: ProfileStatus;
  verificationStatus?: VerificationStatus;

  // Extended profile data
  personalDetails?: PersonalDetails;
  workExperiences?: WorkExperience[];
  education?: Education[];
  certifications?: Certification[];
  achievements?: Achievement[];
  contacts?: Contact[];
  address?: Address;
  stats?: Stats;
  progress?: Progress;

  // Privacy and notifications
  privacySettings?: UserProfile["privacySettings"];
  notificationPreferences?: UserProfile["notificationPreferences"];

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  lastActiveAt?: Date;
  onboardingCompletedAt?: Date;
}

// ============================================================================
// PUBLIC INTERFACES (for API responses)
// ============================================================================

export interface PublicUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  roles: string[];
  activeRole: string | null;
  userType?: UserType;
  avatar?: string | null;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  skills: Skill[];
  languages: Language[];
  interests: string[];
  socialLinks: Record<string, string>;
  verified: boolean;
  emailVerified: boolean;
  status: ProfileStatus;
  verificationStatus: VerificationStatus;

  // Extended profile fields
  personalDetails?: PersonalDetails;
  workExperiences?: WorkExperience[];
  education?: Education[];
  certifications?: Certification[];
  achievements?: Achievement[];
  address?: Address;
  stats?: Stats;
  progress?: Progress;

  // Images
  profileImage?: string;
  coverImage?: string;

  // System fields
  organizationId?: string;
  permissions: string[];
  needsOnboarding: boolean;
  needsRoleSelection: boolean;
  provider: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  lastActiveAt?: Date;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getDisplayName(profile: UserProfile | null): string {
  if (!profile) return "Guest User";

  if (profile.personalDetails?.firstName && profile.personalDetails?.lastName) {
    return `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`;
  }

  return profile.name || "Unnamed User";
}

export function getInitials(profile: UserProfile | null): string {
  if (!profile) return "GU";

  if (profile.personalDetails?.firstName && profile.personalDetails?.lastName) {
    return `${profile.personalDetails.firstName.charAt(
      0
    )}${profile.personalDetails.lastName.charAt(0)}`.toUpperCase();
  }

  if (profile.name) {
    const nameParts = profile.name.split(" ");
    return nameParts.length > 1
      ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
      : profile.name.charAt(0).toUpperCase();
  }

  return "UN";
}

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id?.toString?.() ?? user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    roles: user.roles || [user.role],
    activeRole: user.activeRole || user.role || null,
    userType: user.userType,
    avatar: user.avatar,
    bio: user.bio || "",
    location: user.location || "",
    company: user.company || "",
    website: user.website || "",
    skills: (user.skills || []).map((skill, index) => ({
      id: `skill-${index}`,
      name: skill,
      level: "INTERMEDIATE" as const,
      verified: false,
      endorsements: 0,
    })),
    languages: user.languages || [],
    interests: user.interests || [],
    socialLinks: user.socialLinks || {},
    verified: user.verified || false,
    emailVerified: user.emailVerified || false,
    status: user.status || "active",
    verificationStatus: user.verificationStatus || "unverified",
    personalDetails: user.personalDetails,
    workExperiences: user.workExperiences || [],
    education: user.education || [],
    certifications: user.certifications || [],
    achievements: user.achievements || [],
    address: user.address,
    stats: user.stats,
    progress: user.progress,
    profileImage: user.profileImage,
    coverImage: user.coverImage,
    organizationId: user.organizationId?.toString?.(),
    permissions: user.permissions || [],
    needsOnboarding: user.needsOnboarding ?? false,
    needsRoleSelection: user.needsRoleSelection ?? false,
    provider: user.provider || "credentials",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastActiveAt: user.lastActiveAt,
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const EMPLOYMENT_TYPE_LABELS = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
} as const;

export const SKILL_LEVEL_LABELS = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
} as const;

export const LANGUAGE_LEVEL_LABELS = {
  BASIC: "Basic",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  FLUENT: "Fluent",
  NATIVE: "Native",
} as const;

export const GENDER_LABELS = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
} as const;

export const PROFILE_STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
  pending_verification: "Pending Verification",
} as const;

export const VERIFICATION_STATUS_LABELS = {
  unverified: "Unverified",
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
} as const;

// ============================================================================
// SKILL CATEGORIES
// ============================================================================

export const SKILL_CATEGORIES = {
  Programming: [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Express.js",
    "Next.js",
    "Laravel",
    "Django",
    "Spring Boot",
  ],
  Design: [
    "UI/UX Design",
    "Graphic Design",
    "Web Design",
    "Mobile Design",
    "Product Design",
    "Figma",
    "Adobe Creative Suite",
    "Sketch",
    "InVision",
    "Canva",
    "Photoshop",
    "Illustrator",
  ],
  Marketing: [
    "Digital Marketing",
    "SEO",
    "SEM",
    "Content Marketing",
    "Social Media Marketing",
    "Email Marketing",
    "Influencer Marketing",
    "Brand Management",
    "Market Research",
  ],
  Business: [
    "Project Management",
    "Business Analysis",
    "Strategy Planning",
    "Leadership",
    "Team Management",
    "Sales",
    "Finance",
    "Operations",
    "Product Management",
    "Business Development",
  ],
  "Data & Analytics": [
    "Data Analysis",
    "Machine Learning",
    "Artificial Intelligence",
    "Data Science",
    "Big Data",
    "SQL",
    "NoSQL",
    "Excel",
    "Tableau",
    "Power BI",
    "Google Analytics",
    "Statistical Analysis",
  ],
  "Cloud & DevOps": [
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "DevOps",
    "Infrastructure",
    "Monitoring",
    "Security",
  ],
} as const;

export const DEGREE_TYPES = [
  "High School Diploma",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "MBA",
  "PhD",
  "Certificate",
  "Diploma",
  "Professional Certification",
] as const;

export const USER_ROLES = [
  "student",
  "professional",
  "freelancer",
  "entrepreneur",
  "business_owner",
  "recruiter",
  "mentor",
  "investor",
  "job_seeker",
] as const;

export const USER_TYPES = ["student", "professional"] as const;
