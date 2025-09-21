import { z } from "zod";
import type { IEducation } from "@/lib/redux/slices/profileSlice";

// Course levels for education
export const courseLevels = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctoral Degree",
  "Professional Degree",
  "Certificate",
  "Diploma",
  "Other"
] as const;

// Education level labels for display
export const educationLevelLabels: Record<string, string> = {
  "High School": "High School",
  "Associate Degree": "Associate's",
  "Bachelor's Degree": "Bachelor's",
  "Master's Degree": "Master's",
  "Doctoral Degree": "Doctorate",
  "Professional Degree": "Professional",
  "Certificate": "Certificate",
  "Diploma": "Diploma",
  "Other": "Other"
} as const;

// Fields of study
export const fieldsOfStudy = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Data Science",
  "Artificial Intelligence",
  "Cybersecurity",
  "Business Administration",
  "Marketing",
  "Finance",
  "Accounting",
  "Economics",
  "Management",
  "Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Medicine",
  "Nursing",
  "Psychology",
  "Education",
  "Law",
  "Arts",
  "Design",
  "Communications",
  "Journalism",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Other"
] as const;

// Single education entry schema
export const singleEducationSchema = z
  .object({
    id: z.string(),
    degree: z.string().min(1, "Course Level/Degree is required"),
    fieldOfStudy: z.string().min(1, "Field of study is required"),
    institution: z.string().min(1, "Institution name is required"),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date().nullable(),
    isCurrent: z.boolean().default(false),
    location: z.string().optional(),
    grade: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.isCurrent && !data.endDate) {
        return false;
      }
      if (data.endDate && data.startDate && data.endDate < data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date must be after start date, or mark as currently studying",
      path: ["endDate"],
    }
  );

// Multiple education entries schema
export const educationSchema = z.object({
  educations: z.array(singleEducationSchema).min(1, "At least one education entry is required"),
});

// Type definitions
export type SingleEducationFormData = z.infer<typeof singleEducationSchema>;
export type EducationFormData = z.infer<typeof educationSchema>;

// Props for the education form
export interface EducationFormProps {
  open: boolean;
  onClose: () => void;
  education?: IEducation;
  variant?: 'modal' | 'full-screen';
}

// Props for education display
export interface EducationDisplayProps {
  education: IEducation;
  onEdit?: (education: IEducation) => void;
  onDelete?: (educationId: string) => void;
  variant?: 'card' | 'timeline' | 'compact';
  showActions?: boolean;
}

// Props for education manager
export interface EducationManagerProps {
  variant?: 'card' | 'section';
  showAddButton?: boolean;
  maxEntries?: number;
}