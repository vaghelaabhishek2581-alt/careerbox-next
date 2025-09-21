import type { IEducation } from "@/lib/redux/slices/profileSlice";
import type { EducationFormData, SingleEducationFormData } from "./types";

// Helper function to generate unique IDs
export const generateUniqueId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Helper function to get default values for the form
export const getDefaultValues = (education?: IEducation): SingleEducationFormData => {
  if (education) {
    // Convert existing education to form format
    return {
      id: education.id,
      degree: education.degree || "",
      fieldOfStudy: education.fieldOfStudy || "",
      institution: education.institution || "",
      startDate: education.startDate ? new Date(education.startDate) : new Date(),
      endDate: education.endDate ? new Date(education.endDate) : null,
      isCurrent: education.isCurrent || false,
      location: education.location || "",
      grade: education.grade || "",
      description: education.description || "",
    };
  }

  // Default values for new education
  return {
    id: generateUniqueId(),
    degree: "",
    fieldOfStudy: "",
    institution: "",
    startDate: new Date(),
    endDate: null,
    isCurrent: false,
    location: "",
    grade: "",
    description: "",
  };
};

// Helper function to format education data for submission to API
export const formatEducationForSubmission = (
  education: SingleEducationFormData, 
  educationId?: string
): Omit<IEducation, 'id'> => {
  return {
    degree: education.degree,
    fieldOfStudy: education.fieldOfStudy,
    institution: education.institution,
    startDate: education.startDate.toISOString(),
    endDate: education.endDate ? education.endDate.toISOString() : undefined,
    isCurrent: education.isCurrent,
    location: education.location || undefined,
    grade: education.grade || undefined,
    description: education.description || undefined,
  };
};

// Helper function to format date for display
export const formatDateForDisplay = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "";
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
};

// Helper function to calculate duration
export const calculateDuration = (
  startDate: Date | string,
  endDate: Date | string | null | undefined,
  isCurrent: boolean = false
): string => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : new Date();
  
  if (isNaN(start.getTime())) return "";
  
  const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  
  if (diffInMonths < 1) {
    return "Less than 1 month";
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffInMonths / 12);
    const months = diffInMonths % 12;
    
    let result = `${years} year${years > 1 ? 's' : ''}`;
    if (months > 0) {
      result += ` ${months} month${months > 1 ? 's' : ''}`;
    }
    
    return result;
  }
};

// Helper function to sort education entries (current first, then by date)
export const sortEducationEntries = (educations: IEducation[]): IEducation[] => {
  return [...educations].sort((a, b) => {
    // Current education first
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    
    // Then sort by start date (newest first)
    const aDate = new Date(a.startDate);
    const bDate = new Date(b.startDate);
    
    return bDate.getTime() - aDate.getTime();
  });
};

// Helper function to validate education data
export const validateEducationData = (education: SingleEducationFormData): string[] => {
  const errors: string[] = [];
  
  if (!education.institution.trim()) {
    errors.push("Institution name is required");
  }
  
  if (!education.degree.trim()) {
    errors.push("Course level/degree is required");
  }
  
  if (!education.fieldOfStudy.trim()) {
    errors.push("Field of study is required");
  }
  
  if (!education.isCurrent && !education.endDate) {
    errors.push("End date is required if not currently studying");
  }
  
  if (education.endDate && education.startDate && education.endDate < education.startDate) {
    errors.push("End date must be after start date");
  }
  
  return errors;
};