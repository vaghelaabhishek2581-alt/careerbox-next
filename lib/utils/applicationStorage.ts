// Utility functions for managing application data in localStorage

interface AppliedCourse {
  instituteId: string
  instituteName: string
  courseId?: string
  courseName: string
  appliedAt: string
}

interface EligibilityExam {
  exam: string
  score: string
}

const APPLIED_COURSES_KEY = 'careerbox_applied_courses'
const ELIGIBILITY_EXAMS_KEY = 'careerbox_eligibility_exams'

// Applied Courses Management
export function saveAppliedCourse(application: AppliedCourse): void {
  if (typeof window === 'undefined') return
  
  try {
    const existing = getAppliedCourses()
    const key = `${application.instituteId}-${application.courseName}`
    const updated = { ...existing, [key]: application }
    localStorage.setItem(APPLIED_COURSES_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving applied course:', error)
  }
}

export function getAppliedCourses(): Record<string, AppliedCourse> {
  if (typeof window === 'undefined') return {}
  
  try {
    const data = localStorage.getItem(APPLIED_COURSES_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Error loading applied courses:', error)
    return {}
  }
}

export function hasAppliedToCourse(instituteId: string, courseName: string): boolean {
  if (typeof window === 'undefined') return false
  
  const applied = getAppliedCourses()
  const key = `${instituteId}-${courseName}`
  return key in applied
}

// Eligibility Exams Management
export function saveEligibilityExams(exams: EligibilityExam[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ELIGIBILITY_EXAMS_KEY, JSON.stringify(exams))
  } catch (error) {
    console.error('Error saving eligibility exams:', error)
  }
}

export function loadEligibilityExams(): EligibilityExam[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(ELIGIBILITY_EXAMS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading eligibility exams:', error)
    return []
  }
}

export function clearEligibilityExams(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(ELIGIBILITY_EXAMS_KEY)
  } catch (error) {
    console.error('Error clearing eligibility exams:', error)
  }
}
