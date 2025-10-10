import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/unified-auth";
import { connectToDatabase } from "@/lib/db/mongodb";
import {
  SearchFilters,
  SearchResponse,
  SearchResult,
} from "@/lib/types/search.types";
import { parseSearchQuery } from "@/lib/types/search.types";

// GET /api/search - Universal search endpoint
export async function GET(req: NextRequest) {
  const authResult = await getAuthenticatedUser(req);
  if (!authResult) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filters = parseSearchQuery(searchParams);

  await connectToDatabase();

  // TODO: This needs to be refactored to use Mongoose models instead of raw MongoDB collections
  return NextResponse.json(
    {
      error:
        "Search endpoint is currently under maintenance. Please use specific search endpoints.",
    },
    { status: 503 }
  );
}
//     const results: SearchResult[] = []
//     const facets: any = {}

//     // Search based on category
//     if (filters.category === 'all' || filters.category === 'users') {
//       const userResults = await searchUsers(db, filters)
//       results.push(...userResults)
//     }

//     if (filters.category === 'all' || filters.category === 'businesses') {
//       const businessResults = await searchBusinesses(db, filters)
//       results.push(...businessResults)
//     }

//     if (filters.category === 'all' || filters.category === 'institutes') {
//       const instituteResults = await searchInstitutes(db, filters)
//       results.push(...instituteResults)
//     }

//     if (filters.category === 'all' || filters.category === 'jobs') {
//       const jobResults = await searchJobs(db, filters)
//       results.push(...jobResults)
//     }

//     if (filters.category === 'all' || filters.category === 'courses') {
//       const courseResults = await searchCourses(db, filters)
//       results.push(...courseResults)
//     }

//     if (filters.category === 'all' || filters.category === 'exams') {
//       const examResults = await searchExams(db, filters)
//       results.push(...examResults)
//     }

//     // Sort results
//     results.sort((a, b) => {
//       switch (filters.sortBy) {
//         case 'date':
//           return filters.sortOrder === 'asc'
//             ? new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
//             : new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
//         case 'rating':
//           // Implement rating-based sorting
//           return 0
//         case 'salary':
//           // Implement salary-based sorting for jobs
//           return 0
//         case 'distance':
//           // Implement distance-based sorting
//           return 0
//         case 'popularity':
//           // Implement popularity-based sorting
//           return 0
//         default: // relevance
//           return (b.relevanceScore || 0) - (a.relevanceScore || 0)
//       }
//     })

//     // Pagination
//     const startIndex = (filters.page - 1) * filters.limit
//     const endIndex = startIndex + filters.limit
//     const paginatedResults = results.slice(startIndex, endIndex)

//     // Generate facets
//     facets.categories = generateFacets(results, 'category')
//     facets.locations = generateFacets(results, 'location')
//     facets.skills = generateFacets(results, 'skills')
//     facets.industries = generateFacets(results, 'industry')

//     const response: SearchResponse = {
//       results: paginatedResults,
//       total: results.length,
//       page: filters.page,
//       limit: filters.limit,
//       hasMore: endIndex < results.length,
//       filters,
//       facets
//     }

//     return NextResponse.json(response)
//   } catch (error) {
//     console.error('Search error:', error)
//     return NextResponse.json(
//       { error: 'Failed to perform search' },
//       { status: 500 }
//     )
//   }
// }

// // ============================================================================
// // SEARCH FUNCTIONS FOR EACH ENTITY
// // ============================================================================

// async function searchUsers(db: any, filters: SearchFilters): Promise<SearchResult[]> {
//   const query: any = { status: 'active' }

//   if (filters.query) {
//     query.$or = [
//       { name: { $regex: filters.query, $options: 'i' } },
//       { 'personalDetails.publicProfileId': { $regex: filters.query, $options: 'i' } },
//       { bio: { $regex: filters.query, $options: 'i' } }
//     ]
//   }

//   if (filters.location?.city) {
//     query['address.city'] = { $regex: filters.location.city, $options: 'i' }
//   }

//   if (filters.skills?.length) {
//     query.skills = { $in: filters.skills }
//   }

//   if (filters.verified !== undefined) {
//     query.verified = filters.verified
//   }

//   const users = await db.collection('users').find(query).limit(50).toArray()

//   return users.map((user: any) => ({
//     id: user._id.toString(),
//     type: 'user' as const,
//     title: user.name,
//     description: user.bio || '',
//     category: 'users',
//     name: user.name,
//     role: user.role,
//     userType: user.userType,
//     location: user.location || user.address?.city,
//     skills: user.skills || [],
//     profileImage: user.profileImage,
//     verified: user.verified || false,
//     stats: {
//       connections: user.stats?.connections || 0,
//       endorsements: user.stats?.endorsements || 0
//     },
//     relevanceScore: calculateRelevanceScore(user, filters),
//     createdAt: user.createdAt,
//     updatedAt: user.updatedAt
//   }))
// }

// async function searchBusinesses(db: any, filters: SearchFilters): Promise<SearchResult[]> {
//   const query: any = { status: 'active' }

//   if (filters.query) {
//     query.$or = [
//       { companyName: { $regex: filters.query, $options: 'i' } },
//       { description: { $regex: filters.query, $options: 'i' } },
//       { industry: { $regex: filters.query, $options: 'i' } }
//     ]
//   }

//   if (filters.location?.city) {
//     query['headquarters.city'] = { $regex: filters.location.city, $options: 'i' }
//   }

//   if (filters.industries?.length) {
//     query.industry = { $in: filters.industries }
//   }

//   if (filters.verified !== undefined) {
//     query.isVerified = filters.verified
//   }

//   const businesses = await db.collection('businesses').find(query).limit(50).toArray()

//   return businesses.map((business: any) => ({
//     id: business._id.toString(),
//     type: 'business' as const,
//     title: business.companyName,
//     description: business.description,
//     category: 'businesses',
//     companyName: business.companyName,
//     industry: business.industry,
//     location: business.headquarters?.city,
//     size: business.size,
//     logo: business.logo,
//     verified: business.isVerified || false,
//     stats: {
//       jobPostings: business.stats?.jobPostings || 0,
//       employees: business.employeeCount || 0
//     },
//     relevanceScore: calculateRelevanceScore(business, filters),
//     createdAt: business.createdAt,
//     updatedAt: business.updatedAt
//   }))
// }

// async function searchInstitutes(db: any, filters: SearchFilters): Promise<SearchResult[]> {
//   const query: any = { status: 'active' }

//   if (filters.query) {
//     query.$or = [
//       { instituteName: { $regex: filters.query, $options: 'i' } },
//       { description: { $regex: filters.query, $options: 'i' } },
//       { type: { $regex: filters.query, $options: 'i' } }
//     ]
//   }

//   if (filters.location?.city) {
//     query['address.city'] = { $regex: filters.location.city, $options: 'i' }
//   }

//   if (filters.verified !== undefined) {
//     query.isVerified = filters.verified
//   }

//   const institutes = await db.collection('institutes').find(query).limit(50).toArray()

//   return institutes.map((institute: any) => ({
//     id: institute._id.toString(),
//     type: 'institute' as const,
//     title: institute.instituteName,
//     description: institute.description,
//     category: 'institutes',
//     instituteName: institute.instituteName,
//     type: institute.type,
//     location: institute.address?.city,
//     logo: institute.logo,
//     verified: institute.isVerified || false,
//     stats: {
//       courses: institute.stats?.courses || 0,
//       students: institute.studentCount || 0
//     },
//     relevanceScore: calculateRelevanceScore(institute, filters),
//     createdAt: institute.createdAt,
//     updatedAt: institute.updatedAt
//   }))
// }

// async function searchJobs(db: any, filters: SearchFilters): Promise<SearchResult[]> {
//   const query: any = { status: 'active' }

//   if (filters.query) {
//     query.$or = [
//       { title: { $regex: filters.query, $options: 'i' } },
//       { description: { $regex: filters.query, $options: 'i' } },
//       { location: { $regex: filters.query, $options: 'i' } }
//     ]
//   }

//   if (filters.location?.city) {
//     query.location = { $regex: filters.location.city, $options: 'i' }
//   }

//   if (filters.skills?.length) {
//     query.skills = { $in: filters.skills }
//   }

//   if (filters.salary?.min) {
//     query['salaryRange.min'] = { $gte: filters.salary.min }
//   }

//   if (filters.salary?.max) {
//     query['salaryRange.max'] = { $lte: filters.salary.max }
//   }

//   if (filters.jobTypes?.length) {
//     query.employmentType = { $in: filters.jobTypes }
//   }

//   const jobs = await db.collection('jobs').find(query).limit(50).toArray()

//   return jobs.map((job: any) => ({
//     id: job._id.toString(),
//     type: 'job' as const,
//     title: job.title,
//     description: job.description,
//     category: 'jobs',
//     title: job.title,
//     company: job.companyName || 'Unknown Company',
//     location: job.location,
//     employmentType: job.employmentType,
//     salaryRange: job.salaryRange,
//     skills: job.skills || [],
//     applicationDeadline: job.applicationDeadline,
//     stats: {
//       applications: job.applicationsCount || 0
//     },
//     relevanceScore: calculateRelevanceScore(job, filters),
//     createdAt: job.createdAt,
//     updatedAt: job.updatedAt
//   }))
// }

// async function searchCourses(db: any, filters: SearchFilters): Promise<SearchResult[]> {
//   const query: any = { status: 'active' }

//   if (filters.query) {
//     query.$or = [
//       { title: { $regex: filters.query, $options: 'i' } },
//       { description: { $regex: filters.query, $options: 'i' } },
//       { category: { $regex: filters.query, $options: 'i' } }
//     ]
//   }

//   if (filters.courseCategories?.length) {
//     query.category = { $in: filters.courseCategories }
//   }

//   const courses = await db.collection('courses').find(query).limit(50).toArray()

//   return courses.map((course: any) => ({
//     id: course._id.toString(),
//     type: 'course' as const,
//     title: course.title,
//     description: course.description,
//     category: 'courses',
//     title: course.title,
//     institute: course.instituteName || 'Unknown Institute',
//     category: course.category,
//     level: course.level,
//     duration: course.duration,
//     fee: course.fee,
//     currency: course.currency,
//     instructor: course.instructor?.name,
//     stats: {
//       enrollments: course.currentEnrollments || 0,
//       rating: course.rating
//     },
//     relevanceScore: calculateRelevanceScore(course, filters),
//     createdAt: course.createdAt,
//     updatedAt: course.updatedAt
//   }))
// }

// async function searchExams(db: any, filters: SearchFilters): Promise<SearchResult[]> {
//   const query: any = { status: 'active' }

//   if (filters.query) {
//     query.$or = [
//       { title: { $regex: filters.query, $options: 'i' } },
//       { description: { $regex: filters.query, $options: 'i' } },
//       { type: { $regex: filters.query, $options: 'i' } }
//     ]
//   }

//   if (filters.examTypes?.length) {
//     query.type = { $in: filters.examTypes }
//   }

//   const exams = await db.collection('exams').find(query).limit(50).toArray()

//   return exams.map((exam: any) => ({
//     id: exam._id.toString(),
//     type: 'exam' as const,
//     title: exam.title,
//     description: exam.description,
//     category: 'exams',
//     title: exam.title,
//     createdBy: exam.createdByName || 'Unknown',
//     type: exam.type,
//     duration: exam.duration,
//     fee: exam.fee,
//     examDate: exam.examDate,
//     stats: {
//       registrations: exam.registrationsCount || 0
//     },
//     relevanceScore: calculateRelevanceScore(exam, filters),
//     createdAt: exam.createdAt,
//     updatedAt: exam.updatedAt
//   }))
// }

// // ============================================================================
// // UTILITY FUNCTIONS
// // ============================================================================

// function calculateRelevanceScore(item: any, filters: SearchFilters): number {
//   let score = 0

//   // Text match scoring
//   if (filters.query) {
//     const query = filters.query.toLowerCase()
//     const title = (item.title || item.name || item.companyName || '').toLowerCase()
//     const description = (item.description || '').toLowerCase()

//     if (title.includes(query)) score += 10
//     if (description.includes(query)) score += 5
//     if (title.startsWith(query)) score += 5
//   }

//   // Verification bonus
//   if (item.verified || item.isVerified) score += 3

//   // Recency bonus
//   if (item.createdAt) {
//     const daysSinceCreated = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
//     if (daysSinceCreated < 7) score += 2
//     else if (daysSinceCreated < 30) score += 1
//   }

//   return score
// }

// function generateFacets(results: SearchResult[], field: string): Record<string, number> {
//   const facets: Record<string, number> = {}

//   results.forEach(result => {
//     let value: any

//     switch (field) {
//       case 'category':
//         value = result.category
//         break
//       case 'location':
//         value = (result as any).location
//         break
//       case 'skills':
//         value = (result as any).skills
//         break
//       case 'industry':
//         value = (result as any).industry
//         break
//       default:
//         value = (result as any)[field]
//     }

//     if (Array.isArray(value)) {
//       value.forEach(v => {
//         if (v) {
//           facets[v] = (facets[v] || 0) + 1
//         }
//       })
//     } else if (value) {
//       facets[value] = (facets[value] || 0) + 1
//     }
//   })

//   return facets
