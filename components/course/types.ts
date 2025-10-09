import { z } from 'zod';

// Course form schema
export const courseFormSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Course description is required"),
  courseType: z.enum(["degree", "diploma", "certificate", "10th", "10th+2", "under_graduate", "post_graduate"]),
  duration: z.number().min(1, "Duration must be at least 1 year"),
  fee: z.number().min(0, "Fee must be 0 or greater"),
  maxStudents: z.number().min(1, "Maximum students must be at least 1"),
  specializations: z.array(z.string()).optional(),
  applicableStreams: z.array(z.string()).optional(),
  feesFrequency: z.string().optional(),
  feesAmount: z.number().optional(),
  modeOfStudy: z.enum(["online", "offline", "hybrid"]),
  highestPackageAmount: z.number().optional(),
  totalSeats: z.number().optional(),
  managementQuota: z.number().optional(),
  examsAccepted: z.array(z.string()).optional(),
  eligibilityRequirements: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
  syllabus: z.array(z.string()).optional(),
  assessmentMethods: z.array(z.string()).optional(),
  certificationType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.date({ required_error: "Course start date is required" }),
  endDate: z.date({ required_error: "Course end date is required" }),
  registrationDeadline: z.date({ required_error: "Registration deadline is required" }),
  enrollmentStartDate: z.date().optional(),
  enrollmentEndDate: z.date().optional(),
  courseStartDate: z.date().optional(),
  courseEndDate: z.date().optional(),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

export interface CourseFormProps {
  open: boolean;
  onClose: () => void;
  course?: any;
  onSuccess?: (course: any) => void;
  variant?: 'modal' | 'full-screen';
}

// Course categories
export const courseCategories = [
  'Technology',
  'Business',
  'Design',
  'Marketing',
  'Data Science',
  'Engineering',
  'Healthcare',
  'Education',
  'Arts',
  'Language',
  'Science',
  'Mathematics',
  'Other'
];

// Course levels
export const courseLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

// Course types
export const courseTypes = [
  { value: 'degree', label: 'Degree' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'certificate', label: 'Certificate' },
  { value: '10th', label: '10th' },
  { value: '10th+2', label: '10th+2' },
  { value: 'under_graduate', label: 'Under Graduate' },
  { value: 'post_graduate', label: 'Post Graduate' }
];

// Mode of study options
export const modeOfStudyOptions = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'hybrid', label: 'Hybrid' }
];

// Fees frequency options
export const feesFrequencyOptions = [
  'Per Year',
  'Per Semester',
  'One Time',
  'Per Month',
  'Per Quarter'
];

// Common exams accepted
export const commonExams = [
  'JEE Main',
  'JEE Advanced',
  'NEET',
  'CAT',
  'GATE',
  'CLAT',
  'UPSC',
  'SSC',
  'Banking PO',
  'IELTS',
  'TOEFL',
  'GRE',
  'GMAT',
  'SAT',
  'Other'
];

// Engineering specializations (example for diploma courses)
export const engineeringSpecializations = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Computer Engineering',
  'Electronics and Communication Engineering',
  'Automobile Engineering',
  'Mining Engineering',
  'Chemical Engineering',
  'Aeronautical Engineering',
  'Mechatronics Engineering',
  'Biomedical Engineering',
  'Marine Engineering',
  'Environmental Engineering',
  'Structural Engineering',
  'Software Engineering',
  'Robotics Engineering',
  'Petroleum Engineering',
  'Plastic Technology',
  'Textile Engineering'
];

// Assessment methods
export const assessmentMethods = [
  'Quizzes',
  'Assignments',
  'Projects',
  'Presentations',
  'Peer Review',
  'Final Exam',
  'Practical Tests',
  'Case Studies'
];

// Certificate types
export const certificateTypes = [
  { value: 'completion', label: 'Certificate of Completion' },
  { value: 'achievement', label: 'Certificate of Achievement' },
  { value: 'none', label: 'No Certificate' }
];

// Common course tags
export const commonTags = [
  'Online',
  'Self-paced',
  'Live Classes',
  'Beginner Friendly',
  'Hands-on',
  'Project-based',
  'Career-focused',
  'Industry Standard',
  'Certification Prep',
  'Updated Content'
];

// Utility functions
export const generateModuleId = () => `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const getDefaultCourseValues = (course?: any): CourseFormData => ({
  title: course?.title || '',
  description: course?.description || '',
  courseType: course?.courseType || 'diploma',
  duration: course?.duration || 3,
  fee: course?.fee || 0,
  maxStudents: course?.maxStudents || 50,
  specializations: course?.specializations || [],
  applicableStreams: course?.applicableStreams || [],
  feesFrequency: course?.feesFrequency || 'Per Year',
  feesAmount: course?.feesAmount || 0,
  modeOfStudy: course?.modeOfStudy || 'offline',
  highestPackageAmount: course?.highestPackageAmount || 0,
  totalSeats: course?.totalSeats || 50,
  managementQuota: course?.managementQuota || 0,
  examsAccepted: course?.examsAccepted || [],
  eligibilityRequirements: course?.eligibilityRequirements || [],
  isPublished: course?.isPublished || false,
  syllabus: course?.syllabus || [],
  assessmentMethods: course?.assessmentMethods || [],
  certificationType: course?.certificationType || 'completion',
  tags: course?.tags || [],
  startDate: course?.startDate ? new Date(course.startDate) : new Date(),
  endDate: course?.endDate ? new Date(course.endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  registrationDeadline: course?.registrationDeadline ? new Date(course.registrationDeadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  enrollmentStartDate: course?.enrollmentStartDate ? new Date(course.enrollmentStartDate) : undefined,
  enrollmentEndDate: course?.enrollmentEndDate ? new Date(course.enrollmentEndDate) : undefined,
  courseStartDate: course?.courseStartDate ? new Date(course.courseStartDate) : undefined,
  courseEndDate: course?.courseEndDate ? new Date(course.courseEndDate) : undefined,
});
