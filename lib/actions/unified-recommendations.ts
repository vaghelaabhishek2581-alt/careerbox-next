"use server";

import { cache } from "react";
import { connectToDatabase } from "@/lib/db/mongoose";
import AdminInstitute from "@/src/models/AdminInstitute";
import type { Institute as UiInstitute, Course as UiCourse } from "@/types/institute";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ASSET_BASE = (process.env.NEXT_PUBLIC_ASSET_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
const normalizeUrl = (u?: string): string | undefined => {
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (!ASSET_BASE) return u;
  return `${ASSET_BASE}/${u.replace(/^\//, '')}`;
};

export interface UnifiedSearchParams {
  type?: 'institutes' | 'programs' | 'courses';
  location?: string;
  instituteType?: string;
  category?: string;
  query?: string;
  page?: number;
  sortBy?: string;
  accreditation?: string;
  degree?: string;
  minFee?: number;
  maxFee?: number;
}

export interface ProgramResult {
  id: string;
  name: string;
  institute: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    location: {
      city: string;
      state: string;
    };
  };
  courseCount: number;
  placementRating?: number;
  eligibilityExams: string[];
  courses: UiCourse[];
}

export interface UnifiedSearchResult {
  institutes?: UiInstitute[];
  programs?: ProgramResult[];
  courses?: (UiCourse & { institute: { id: string; name: string; slug: string; logo?: string; location: { city: string; state: string } } })[];
  total: number;
  totalPages: number;
  currentPage: number;
  filters: {
    locations: { value: string; label: string; count: number }[];
    types: { value: string; label: string; count: number }[];
    categories: { value: string; label: string; count: number }[];
    accreditations: { value: string; label: string; count: number }[];
    degrees: { value: string; label: string; count: number }[];
  };
}

export const getUnifiedRecommendations = cache(
  async (params: UnifiedSearchParams): Promise<UnifiedSearchResult> => {
    await connectToDatabase();

    const {
      type = 'institutes',
      location,
      instituteType,
      category,
      query,
      page = 1,
      sortBy = "popularity",
      accreditation,
      degree,
      minFee,
      maxFee,
    } = params;

    const pageSize = 20; // Increased from 12 for better performance
    const skip = (page - 1) * pageSize;

    // Build base query with optimized regex
    const mongoQuery: any = {};

    if (query && query.trim()) {
      // Use text search for better performance if available
      const searchTerm = query.trim();
      mongoQuery.$text = { $search: searchTerm };
    }

    if (location && location.trim()) {
      const locationParts = location.split(',').map(s => s.trim());
      if (locationParts.length === 1) {
        // Use exact match for better index utilization
        const loc = locationParts[0];
        mongoQuery.$or = [
          ...(mongoQuery.$or || []),
          { "location.city": loc },
          { "location.state": loc },
          { "location.city": new RegExp(escapeRegex(loc), "i") },
          { "location.state": new RegExp(escapeRegex(loc), "i") },
        ];
      } else {
        mongoQuery["location.city"] = locationParts[0];
      }
    }

    if (instituteType && instituteType.trim()) {
      const types = instituteType.split(',').filter(Boolean);
      if (types.length > 0) mongoQuery.type = { $in: types };
    }

    if (category && category.trim()) {
      const categories = category.split(',').filter(Boolean);
      if (categories.length > 0) mongoQuery['programmes.course.category'] = { $in: categories };
    }

    if (accreditation && accreditation.trim()) {
      const accreditations = accreditation.split(',').filter(Boolean);
      if (accreditations.length > 0) {
        mongoQuery.$or = [
          ...(mongoQuery.$or || []),
          { 'accreditation.naac.grade': { $in: accreditations } },
        ];
      }
    }

    if (degree && degree.trim()) {
      const degrees = degree.split(',').filter(Boolean);
      if (degrees.length > 0) mongoQuery['programmes.course.degree'] = { $in: degrees };
    }

    // Sorting
    const sort: any = (() => {
      switch (sortBy) {
        case "established":
          return { establishedYear: -1 };
        case "name":
          return { name: 1 };
        case "ranking":
          return { 'accreditation.nirf.overallRank': 1 };
        case "popularity":
        default:
          return { 'accreditation.nirf.overallRank': 1, name: 1 };
      }
    })();

    if (type === 'institutes') {
      // Optimized: Use projection to limit fields and improve performance
      const projection = {
        name: 1,
        shortName: 1,
        slug: 1,
        establishedYear: 1,
        type: 1,
        status: 1,
        logo: 1,
        coverImage: 1,
        'accreditation.naac': 1,
        'accreditation.nirf': 1,
        'location.city': 1,
        'location.state': 1,
        'contact.phone': 1,
        'contact.email': 1,
        'contact.website': 1,
        'overview.description': 1,
        'academics.totalPrograms': 1,
        'academics.totalStudents': 1,
        'placements.averagePackage': 1,
        'placements.highestPackage': 1,
        'placements.placementRate': 1
      };

      // Fetch institutes
      const aggregationPipeline: any[] = [
        { $match: mongoQuery },
        // Add text score if using text search
        ...(query ? [{ $addFields: { searchScore: { $meta: "textScore" } } }] : []),
        { $project: projection }, // Add projection early to reduce data
        {
          $facet: {
            paginatedResults: [
              // Sort by text score first if searching, then by other criteria
              ...(query ? [{ $sort: { searchScore: -1, ...sort } }] : [{ $sort: sort }]),
              { $skip: skip },
              { $limit: pageSize },
            ],
            totalCount: [{ $count: 'count' }],
            locations: [
              { $match: { 'location.city': { $exists: true, $ne: null, $nin: ['', null] } } },
              { $group: { _id: '$location.city', count: { $sum: 1 } } },
              { $sort: { count: -1 } }, // Sort by most common first
              { $limit: 50 }, // Limit filter options
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ],
            types: [
              { $match: { type: { $exists: true, $ne: null, $nin: ['', null] } } },
              { $group: { _id: '$type', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 20 },
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ],
            accreditations: [
              { $match: { 'accreditation.naac.grade': { $exists: true, $ne: null, $nin: ['', null] } } },
              { $group: { _id: '$accreditation.naac.grade', count: { $sum: 1 } } },
              { $sort: { _id: -1 } }, // Sort A+ to C
              { $limit: 10 },
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ]
          }
        }
      ];

      const results = await AdminInstitute.aggregate(aggregationPipeline).exec();
      
      if (!results || results.length === 0 || !results[0]) {
        return {
          institutes: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
          filters: {
            locations: [],
            types: [],
            categories: [],
            accreditations: [],
            degrees: [],
          },
        };
      }

      const institutes = results[0].paginatedResults || [];
      const total = results[0].totalCount?.[0]?.count || 0;

      return {
        institutes: institutes.map((inst: any) => ({
          id: inst._id?.toString(),
          name: inst.name,
          shortName: inst.shortName || inst.name,
          slug: inst.slug,
          establishedYear: inst.establishedYear || 0,
          type: inst.type || "",
          status: inst.status || "",
          logo: normalizeUrl(inst.logo),
          coverImage: normalizeUrl(inst.coverImage),
          accreditation: inst.accreditation || {},
          location: inst.location || {},
          contact: inst.contact || {},
          overview: inst.overview || {},
          campusDetails: inst.campusDetails || {},
          academics: inst.academics || {},
          admissions: inst.admissions || {},
          placements: inst.placements || {},
          rankings: inst.rankings || {},
          researchAndInnovation: inst.researchAndInnovation || {},
          alumniNetwork: inst.alumniNetwork || {},
          awards: inst.awards || [],
          courses: [],
          mediaGallery: inst.mediaGallery,
        })),
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        filters: {
          locations: results[0].locations || [],
          types: results[0].types || [],
          categories: [], // Removed expensive unwind operation for performance
          accreditations: results[0].accreditations || [],
          degrees: [], // Removed expensive unwind operation for performance
        },
      };
    } else if (type === 'programs') {
      // Fetch programs
      const aggregationPipeline: any[] = [
        { $match: mongoQuery },
        { $unwind: '$programmes' },
        {
          $facet: {
            paginatedResults: [
              { $skip: skip },
              { $limit: pageSize },
            ],
            totalCount: [{ $count: 'count' }],
            locations: [
              { $match: { 'location.city': { $ne: null } } },
              { $group: { _id: '$location.city', count: { $sum: 1 } } },
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ],
            types: [
              { $match: { type: { $ne: null } } },
              { $group: { _id: '$type', count: { $sum: 1 } } },
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ],
            categories: [
              { $unwind: '$programmes.course' },
              { $match: { 'programmes.course.category': { $ne: null } } },
              { $group: { _id: '$programmes.course.category', count: { $sum: 1 } } },
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ],
            accreditations: [
              { $match: { 'accreditation.naac.grade': { $ne: null } } },
              { $group: { _id: '$accreditation.naac.grade', count: { $sum: 1 } } },
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ],
            degrees: [
              { $unwind: '$programmes.course' },
              { $match: { 'programmes.course.degree': { $ne: null } } },
              { $group: { _id: '$programmes.course.degree', count: { $sum: 1 } } },
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ]
          }
        }
      ];

      const results = await AdminInstitute.aggregate(aggregationPipeline).exec();
      
      if (!results || results.length === 0 || !results[0]) {
        return {
          programs: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
          filters: {
            locations: [],
            types: [],
            categories: [],
            accreditations: [],
            degrees: [],
          },
        };
      }

      const programs = results[0].paginatedResults || [];
      const total = results[0].totalCount?.[0]?.count || 0;

      return {
        programs: programs.map((item: any) => ({
          id: item.programmes._id?.toString() || item.programmes.id,
          name: item.programmes.name,
          institute: {
            id: item._id?.toString(),
            name: item.name,
            slug: item.slug,
            logo: normalizeUrl(item.logo),
            location: {
              city: item.location?.city || '',
              state: item.location?.state || '',
            },
          },
          courseCount: item.programmes.courseCount || 0,
          placementRating: item.programmes.placementRating,
          eligibilityExams: item.programmes.eligibilityExams || [],
          courses: (item.programmes.course || []).map((c: any) => ({
            id: c._id?.toString() || c.seoUrl || c.name,
            name: c.name,
            degree: c.degree || "",
            slug: c.seoUrl,
            duration: c.duration || "",
            level: c.courseLevel || c.level || "",
            category: c.category || "",
            fees: c.fees,
            totalSeats: c.totalSeats,
            placements: c.placements,
            location: c.location,
            educationType: c.educationType,
          })),
        })),
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        filters: {
          locations: results[0].locations || [],
          types: results[0].types || [],
          categories: results[0].categories || [],
          accreditations: results[0].accreditations || [],
          degrees: results[0].degrees || [],
        },
      };
    } else {
      // Fetch courses
      const aggregationPipeline: any[] = [
        { $match: mongoQuery },
        { $unwind: '$programmes' },
        { $unwind: '$programmes.course' },
        {
          $facet: {
            paginatedResults: [
              { $skip: skip },
              { $limit: pageSize },
            ],
            totalCount: [{ $count: 'count' }],
            locations: [
              { $match: { 'location.city': { $ne: null } } },
              { $group: { _id: '$location.city', count: { $sum: 1 } } },
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ],
            types: [
              { $match: { type: { $ne: null } } },
              { $group: { _id: '$type', count: { $sum: 1 } } },
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ],
            categories: [
              { $match: { 'programmes.course.category': { $ne: null } } },
              { $group: { _id: '$programmes.course.category', count: { $sum: 1 } } },
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ],
            accreditations: [
              { $match: { 'accreditation.naac.grade': { $ne: null } } },
              { $group: { _id: '$accreditation.naac.grade', count: { $sum: 1 } } },
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ],
            degrees: [
              { $match: { 'programmes.course.degree': { $ne: null } } },
              { $group: { _id: '$programmes.course.degree', count: { $sum: 1 } } },
              { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
            ]
          }
        }
      ];

      const results = await AdminInstitute.aggregate(aggregationPipeline).exec();
      
      if (!results || results.length === 0 || !results[0]) {
        return {
          courses: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
          filters: {
            locations: [],
            types: [],
            categories: [],
            accreditations: [],
            degrees: [],
          },
        };
      }

      const courses = results[0].paginatedResults || [];
      const total = results[0].totalCount?.[0]?.count || 0;

      return {
        courses: courses.map((item: any) => ({
          id: item.programmes.course._id?.toString() || item.programmes.course.seoUrl || item.programmes.course.name,
          name: item.programmes.course.name,
          degree: item.programmes.course.degree || "",
          slug: item.programmes.course.seoUrl,
          duration: item.programmes.course.duration || "",
          level: item.programmes.course.courseLevel || item.programmes.course.level || "",
          category: item.programmes.course.category || "",
          fees: item.programmes.course.fees,
          totalSeats: item.programmes.course.totalSeats,
          placements: item.programmes.course.placements,
          location: item.programmes.course.location,
          educationType: item.programmes.course.educationType,
          institute: {
            id: item._id?.toString(),
            name: item.name,
            slug: item.slug,
            logo: normalizeUrl(item.logo),
            location: {
              city: item.location?.city || '',
              state: item.location?.state || '',
            },
          },
        })),
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        filters: {
          locations: results[0].locations || [],
          types: results[0].types || [],
          categories: results[0].categories || [],
          accreditations: results[0].accreditations || [],
          degrees: results[0].degrees || [],
        },
      };
    }
  }
);
