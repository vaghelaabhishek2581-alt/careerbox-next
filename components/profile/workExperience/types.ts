import { z } from "zod";

export const positionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Job title is required").max(100, "Job title must be less than 100 characters"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional().nullable(),
  isCurrent: z.boolean().default(false),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "FREELANCE",
  ]),
  locationType: z.enum([
    "ONSITE",
    "REMOTE",
    "HYBRID",
  ]).default("ONSITE"),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
  skills: z.array(z.string()).optional(),
}).refine(
  (data) => {
    // Allow empty endDate while user is editing unless explicitly required on submit
    if (!data.isCurrent && (data.endDate === null || data.endDate === undefined)) {
      return false;
    }
    if (data.endDate && data.startDate) {
      const sY = data.startDate.getFullYear();
      const sM = data.startDate.getMonth();
      const eY = data.endDate.getFullYear();
      const eM = data.endDate.getMonth();
      const isEndBeforeStart = eY < sY || (eY === sY && eM < sM);
      if (isEndBeforeStart) return false;
    }
    return true;
  },
  {
    message: "End date must be after start date, or mark as current role",
    path: ["endDate"],
  }
);

export const workExperienceSchema = z.object({
  company: z.string().min(1, "Company name is required").max(100, "Company name must be less than 100 characters"),
  location: z.string().min(1, "Location is required").max(100, "Location must be less than 100 characters"),
  positions: z.array(positionSchema).min(1, "At least one position is required"),
});

export type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;
export type PositionFormData = z.infer<typeof positionSchema>;

// Employment type display names
export const employmentTypeLabels = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
} as const;

// Location type display names
export const locationTypeLabels = {
  ONSITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
} as const;

export interface WorkExperienceFormProps {
  open: boolean;
  onClose: () => void;
  experience?: any;
  variant?: 'modal' | 'full-screen';
  editingPositionId?: string; // ID of the specific position to edit
}
