export interface IBusiness {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  size: string;
  website?: string;
  description: string;
  logo?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    linkedin?: string;
    twitter?: string;
  };
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  foundedYear?: number;
  employeeCount?: number;
  revenue?: string;
  isVerified: boolean;
  subscriptionId?: string;
  status: "active" | "inactive" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessProfile {
  business: IBusiness;
  jobs: any[]; // Job[]
  exams: any[]; // Exam[]
  analytics: BusinessAnalytics;
}

export interface BusinessAnalytics {
  totalJobsPosted: number;
  activeJobs: number;
  totalApplications: number;
  totalExamsCreated: number;
  activeExams: number;
  totalExamRegistrations: number;
  monthlyViews: number;
  profileCompleteness: number;
}

export interface CreateBusinessRequest {
  companyName: string;
  industry: string;
  size: string;
  website?: string;
  description: string;
  logo?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    linkedin?: string;
    twitter?: string;
  };
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  foundedYear?: number;
  employeeCount?: number;
  revenue?: string;
}

export interface UpdateBusinessRequest extends Partial<CreateBusinessRequest> {
  status?: "active" | "inactive" | "suspended";
  isVerified?: boolean;
}

export interface BusinessSearchFilters {
  industry?: string[];
  size?: string[];
  location?: string;
  isVerified?: boolean;
  foundedYearFrom?: number;
  foundedYearTo?: number;
}

export interface BusinessSearchResponse {
  businesses: IBusiness[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
