"use server";

import { cache } from "react";
import { connectToDatabase } from "@/lib/db/mongoose";
import AdminInstitute, { IAdminInstitute } from "@/src/models/AdminInstitute";
import type { IInstitute as IAccountInstitute } from "@/src/models/Institute";
import { getInstituteBySlug } from "@/lib/actions/institute-actions";
import type {
  Institute as UiInstitute,
  Course as UiCourse,
  InstituteSearchParams,
  InstituteSearchResult,
  CourseSearchParams,
  CourseSearchResult,
} from "@/types/institute";
import { clearOrganizationError } from "../redux/slices/organizationSlice";

// Helper: escape regex
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Helper: normalize URLs (fix broken images when DB stores relative paths)
const ASSET_BASE = (process.env.NEXT_PUBLIC_ASSET_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
const normalizeUrl = (u?: string): string | undefined => {
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (!ASSET_BASE) return u; // fallback: return as-is if no base configured
  return `${ASSET_BASE}/${u.replace(/^\//, '')}`;
};

// Map AdminInstitute (DB) -> UI Institute type
function mapAdminToUiInstitute(admin: IAdminInstitute): UiInstitute {
  console.log("admin", admin);
  console.log("courses", admin.courses);

  // Merge legacy courses[] and new programmes[].course[]
  const mergedAdminCourses: any[] = [
    ...(Array.isArray((admin as any).courses) ? (admin as any).courses : []),
    ...((Array.isArray((admin as any).programmes)
      ? (admin as any).programmes.flatMap((p: any) => Array.isArray(p?.course) ? p.course : [])
      : []) as any[]),
  ]
console.log("adminadmin", admin);
  return {
    id: admin._id?.toString?.() || admin.id,
    name: admin.name,
    shortName: admin.shortName || admin.name,
    slug: admin.slug,
    establishedYear: admin.establishedYear || 0,
    type: admin.type || "",
    status: admin.status || "",
    logo: normalizeUrl(admin.logo),
    coverImage: normalizeUrl(admin.coverImage),
    accreditation: {
      naac: admin.accreditation?.naac
        ? {
            grade: admin.accreditation.naac.grade || "",
            cgpa: admin.accreditation.naac.cgpa || 0,
            validUntil: admin.accreditation.naac.validUntil || "",
            cycleNumber: admin.accreditation.naac.cycleNumber || 0,
          }
        : undefined,
      nirf: admin.accreditation?.nirf
        ? {
            overallRank: (admin.accreditation.nirf.overallRank as any) ?? undefined,
            engineeringRank: undefined,
            managementRank: (admin.accreditation.nirf.managementRank as any) ?? undefined,
            year: admin.accreditation.nirf.year || 0,
          }
        : undefined,
      ugc: admin.accreditation?.ugc
        ? {
            recognition: admin.accreditation.ugc.recognition || "",
            section: "",
          }
        : undefined,
      aicte: undefined,
    },
    location: {
      address: admin.location?.address || "",
      city: admin.location?.city || "",
      state: admin.location?.state || "",
      pincode: admin.location?.pincode || "",
      country: admin.location?.country || "",
      coordinates: {
        latitude: admin.location?.coordinates?.latitude || 0,
        longitude: admin.location?.coordinates?.longitude || 0,
      },
      nearbyLandmarks: admin.location?.nearbyLandmarks || [],
    },
    contact: {
      phone: admin.contact?.phone || [],
      email: admin.contact?.email || "",
      website: admin.contact?.website ? (admin.contact.website.startsWith('http') ? admin.contact.website : `https://${admin.contact.website}`) : "",
    },
    overview: {
      description: admin.overview?.description || "",
      vision: admin.overview?.vision || "",
      mission: admin.overview?.mission || "",
      motto: admin.overview?.motto || "",
      founder: admin.overview?.founder || "",
      chancellor: admin.overview?.chancellor || "",
      viceChancellor: admin.overview?.viceChancellor || "",
      stats: (admin.overview as any)?.stats || [],
    },
    campusDetails: {
      totalArea: "",
      builtUpArea: "",
      campusType: admin.campusDetails?.campusType || "",
      environment: admin.campusDetails?.environment || "",
      facilities: {
        academic: admin.campusDetails?.facilities?.academic || [],
        residential: admin.campusDetails?.facilities?.residential || [],
        recreational: admin.campusDetails?.facilities?.recreational || [],
        support: admin.campusDetails?.facilities?.support || [],
      },
    },
    academics: {
      totalStudents: admin.academics?.totalStudents || 0,
      totalFaculty: admin.academics?.totalFaculty || 0,
      studentFacultyRatio: admin.academics?.studentFacultyRatio || "",
      internationalStudents: admin.academics?.internationalStudents || 0,
      totalPrograms: admin.academics?.totalPrograms || 0,
      institutes: (admin.academics?.schools || []).map((s: { name: string; established?: number; programs?: string[] }) => ({
        name: s.name,
        established: s.established || 0,
        programs: s.programs || [],
      })),
    },
    admissions: {
      applicationDeadline: "",
      entranceExams: {},
      admissionProcess: admin.admissions?.admissionProcess || [],
      reservationPolicy: (admin.admissions?.reservationPolicy as any) || {
        sc: "",
        st: "",
        obc: "",
        ews: "",
        pwd: "",
      },
    },
    placements: {
      ...(admin.placements || {}),
    } as any,
    rankings: {
      national: admin.rankings?.national || [],
      international: [],
    },
    researchAndInnovation: {
      researchCenters: admin.researchAndInnovation?.researchCenters || 0,
      patentsFiled: admin.researchAndInnovation?.patentsFiled || 0,
      publicationsPerYear: admin.researchAndInnovation?.publicationsPerYear || 0,
      researchFunding: admin.researchAndInnovation?.researchFunding || "",
      phdScholars: admin.researchAndInnovation?.phdScholars || 0,
      incubationCenter: {
        name: admin.researchAndInnovation?.incubationCenter?.name || "",
        startupsFunded: admin.researchAndInnovation?.incubationCenter?.startupsFunded || 0,
        totalFunding: admin.researchAndInnovation?.incubationCenter?.totalFunding || "",
      },
      collaborations: admin.researchAndInnovation?.collaborations || [],
    },
    alumniNetwork: {
      totalAlumni: admin.alumniNetwork?.totalAlumni || 0,
      notableAlumni: admin.alumniNetwork?.notableAlumni || [],
      alumniInFortune500: admin.alumniNetwork?.alumniInFortune500 || 0,
      entrepreneursCreated: admin.alumniNetwork?.entrepreneursCreated || 0,
    },
    awards: admin.awards || [],
    courses: (mergedAdminCourses || []).map(c => ({
      id: (c as any)?._id?.toString?.() || c.seoUrl || c.name,
      name: c.name,
      degree: c.degree || "",
      slug: c.seoUrl || undefined,
      school: c.school,
      duration: c.duration || "",
      level: c.courseLevel || c.level || "",
      category: c.category || "",
      description: undefined,
      objectives: undefined,
      curriculum: undefined,
      admissionProcess: undefined,
      fees: ((): any => {
        if (typeof c.fees === 'object' && c.fees) {
          const f: any = c.fees as any;
          return {
            tuitionFee: f.tuitionFee?.toString?.() || "",
            hostelFee: "",
            messFee: "",
            otherFees: "",
            totalAnnualFee: "",
            totalFee: typeof f.totalFee === 'number' ? f.totalFee : undefined,
            scholarships: Array.isArray(f.scholarships) ? f.scholarships : [],
          };
        }
        return undefined;
      })(),
      facultyProfile: undefined,
      infrastructure: undefined,
      careerProspects: undefined,
      industryConnections: undefined,
      studentActivities: undefined,
      specializations: undefined,
      practicalTraining: undefined,
      barCouncilRecognition: undefined,
      totalSeats: c.totalSeats,
      placements: c.placements ? {
        averagePackage: c.placements.averagePackage || 0,
        highestPackage: c.placements.highestPackage || 0,
        placementRate: c.placements.placementRate || 0,
        topRecruiters: c.placements.topRecruiters || [],
      } : undefined,
      location: c.location ? {
        city: c.location.city,
        state: c.location.state,
        country: undefined,
        locality: c.location.locality,
      } : undefined,
      educationType: c.educationType,
      brochure: c.brochure ? { url: normalizeUrl(c.brochure.url) || '', name: undefined } : undefined,
      recognition: c.recognition?.map((r: string) => ({ name: r })) || [],
      reviewCount: c.reviewCount,
      questionsCount: c.questionsCount,
    } as UiCourse)),
    mediaGallery: admin.mediaGallery ? {
      photos: ((): any => {
        const p = admin.mediaGallery!.photos as any;
        if (!p) return undefined;
        // If photos is an object of arrays
        if (typeof p === 'object' && !Array.isArray(p)) {
          const out: Record<string, any[]> = {};
          for (const key of Object.keys(p)) {
            const arr = p[key] || [];
            out[key] = arr.map((item: any) => {
              if (typeof item === 'string') return normalizeUrl(item);
              if (item && typeof item === 'object') {
                return {
                  ...item,
                  thumbUrl: normalizeUrl(item.thumbUrl) || item.thumbUrl,
                  mediaUrl: normalizeUrl(item.mediaUrl) || item.mediaUrl,
                  widgetThumbUrl: normalizeUrl(item.widgetThumbUrl) || item.widgetThumbUrl,
                };
              }
              return item;
            });
          }
          return out;
        }
        // If photos is an array
        if (Array.isArray(p)) {
          return p.map((item: any) => {
            if (typeof item === 'string') return normalizeUrl(item);
            if (item && typeof item === 'object') {
              return {
                ...item,
                thumbUrl: normalizeUrl(item.thumbUrl) || item.thumbUrl,
                mediaUrl: normalizeUrl(item.mediaUrl) || item.mediaUrl,
                widgetThumbUrl: normalizeUrl(item.widgetThumbUrl) || item.widgetThumbUrl,
              };
            }
            return item;
          });
        }
        return p;
      })(),
      videos: admin.mediaGallery.videos?.map(
        (v: { url: string; title?: string; thumbnail?: string }) => ({
          url: normalizeUrl(v.url) || v.url,
          title: v.title,
          thumbnail: normalizeUrl(v.thumbnail) || v.thumbnail,
        })
      ) as any,
    } : undefined,
    programmes: (admin as any).programmes ? (admin as any).programmes.map((p: any) => ({
      id: p.id || p._id?.toString(),
      name: p.name,
      courseCount: p.courseCount,
      placementRating: p.placementRating,
      eligibilityExams: p.eligibilityExams || [],
      course: (Array.isArray(p.course) ? p.course : []).map((c: any) => ({
        id: c._id?.toString?.() || c.seoUrl || c.name,
        name: c.name,
        degree: c.degree || "",
        slug: c.seoUrl || undefined,
        school: c.school,
        duration: c.duration || "",
        level: c.courseLevel || c.level || "",
        category: c.category || "",
        description: undefined,
        objectives: undefined,
        curriculum: undefined,
        admissionProcess: undefined,
        fees: ((): any => {
          if (typeof c.fees === 'object' && c.fees) {
            const f: any = c.fees as any;
            return {
              tuitionFee: f.tuitionFee?.toString?.() || "",
              hostelFee: "",
              messFee: "",
              otherFees: "",
              totalAnnualFee: "",
              totalFee: typeof f.totalFee === 'number' ? f.totalFee : undefined,
              scholarships: Array.isArray(f.scholarships) ? f.scholarships : [],
            };
          }
          return undefined;
        })(),
        facultyProfile: undefined,
        infrastructure: undefined,
        careerProspects: undefined,
        industryConnections: undefined,
        studentActivities: undefined,
        specializations: undefined,
        practicalTraining: undefined,
        barCouncilRecognition: undefined,
        totalSeats: c.totalSeats,
        placements: c.placements ? {
          averagePackage: c.placements.averagePackage || 0,
          highestPackage: c.placements.highestPackage || 0,
          placementRate: c.placements.placementRate || 0,
          topRecruiters: c.placements.topRecruiters || [],
        } : undefined,
        location: c.location ? {
          city: c.location.city,
          state: c.location.state,
          country: undefined,
          locality: c.location.locality,
        } : undefined,
        educationType: c.educationType,
        brochure: c.brochure ? { url: normalizeUrl(c.brochure.url) || '', name: undefined } : undefined,
        recognition: c.recognition?.map((r: string) => ({ name: r })) || [],
        reviewCount: c.reviewCount,
        questionsCount: c.questionsCount,
      } as UiCourse)),
    })) : undefined,
  };
}

// Cache the function for better performance
export const getInstituteRecommendations = cache(
  async (params: InstituteSearchParams): Promise<InstituteSearchResult> => {
    await connectToDatabase();

    const {
      location,
      type,
      category, // NOTE: not directly modelled; kept for future use
      query,
      page = 1,
      sortBy = "popularity",
      establishedYear,
      accreditation, // NOTE: not fully implemented
    } = params;

    const mongoQuery: any = {};
    if (query && query.trim()) {
      const r = new RegExp(escapeRegex(query.trim()), "i");
      mongoQuery.$or = [
        { name: r },
        { "overview.description": r },
      ];
    }
    if (location && location.trim()) {
      const locations = location.split(',').map(l => new RegExp(escapeRegex(l.trim()), 'i'));
      if (locations.length > 0) {
        mongoQuery.$or = [...(mongoQuery.$or || []), { 'location.city': { $in: locations } }, { 'location.state': { $in: locations } }];
      }
    }
    if (type && type.trim()) {
      const types = type.split(',').filter(Boolean);
      if (types.length > 0) mongoQuery.type = { $in: types };
    }
    if (establishedYear) {
      const num = parseInt(establishedYear, 10);
      if (!isNaN(num)) mongoQuery.establishedYear = { $gte: num };
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
          { 'programmes.course.recognition': { $in: accreditations } },
        ];
      }
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const sort: any = (() => {
      switch (sortBy) {
        case "established":
          return { establishedYear: -1 };
        case "name":
          return { name: 1 };
        case "ranking":
          // Simplified: fall back to name as rankings are arrays
          return { name: 1 };
        case "popularity":
        default:
          return { name: 1 };
      }
    })();

    const aggregationPipeline: any[] = [
      { $match: mongoQuery },
      {
        $facet: {
          // Branch for paginated results
          paginatedResults: [
            { $sort: sort },
            { $skip: skip },
            { $limit: pageSize },
          ],
          // Branch for total count
          totalCount: [
            { $count: 'count' }
          ],
          // Branches for filter counts
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
            { $unwind: '$programmes' },
            { $unwind: '$programmes.course' },
            { $match: { 'programmes.course.category': { $ne: null } } },
            { $group: { _id: '$programmes.course.category', count: { $sum: 1 } } },
            { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
          ],
          accreditations: [
            { $match: { 'accreditation.naac.grade': { $ne: null } } },
            { $group: { _id: '$accreditation.naac.grade', count: { $sum: 1 } } },
            { $project: { _id: 0, value: '$_id', label: '$_id', count: 1 } }
          ]
        }
      }
    ];

    const results = await AdminInstitute.aggregate(aggregationPipeline).exec();
    const admins = results[0].paginatedResults;
    const total = results[0].totalCount[0]?.count || 0;

    const uiInstitutes: UiInstitute[] = admins.map(mapAdminToUiInstitute);

    const filters = {
      locations: results[0].locations,
      types: results[0].types,
      categories: results[0].categories,
      accreditations: results[0].accreditations,
    };

    const totalPages = Math.ceil(total / pageSize);
    return {
      institutes: uiInstitutes,
      total,
      totalPages,
      currentPage: page,
      filters,
    };
  }
);

// Server action to get individual institute details
export const getInstituteDetails = cache(
  async (slug: string): Promise<UiInstitute | null> => {
    await connectToDatabase();
    const combined = await getInstituteBySlug(slug);
    if (!combined) return null;
    if (combined.admin) return mapAdminToUiInstitute(combined.admin as IAdminInstitute);

    // Fallback: if only account exists, map minimally
    const acc = combined.account as IAccountInstitute | null;
    if (!acc) return null;
    const fallback: UiInstitute = {
      id: acc._id.toString(),
      name: acc.name,
      shortName: acc.name,
      slug: acc.publicProfileId || slug,
      establishedYear: acc.establishmentYear || 0,
      type: "",
      status: acc.status,
      logo: acc.logo,
      coverImage: acc.coverImage,
      accreditation: {},
      location: {
        address: acc.address?.street || "",
        city: acc.address?.city || "",
        state: acc.address?.state || "",
        pincode: acc.address?.zipCode || "",
        country: acc.address?.country || "",
        coordinates: { latitude: 0, longitude: 0 },
        nearbyLandmarks: [],
      },
      contact: { phone: [acc.phone].filter(Boolean) as string[], email: acc.email, website: acc.website || "" },
      overview: { description: acc.description || "", vision: "", mission: "", motto: "", founder: "", chancellor: "", viceChancellor: "" },
      campusDetails: { totalArea: "", builtUpArea: "", campusType: "", environment: "", facilities: { academic: [], residential: [], recreational: [], support: [] } },
      academics: { totalStudents: acc.studentCount || 0, totalFaculty: acc.facultyCount || 0, studentFacultyRatio: "", internationalStudents: 0, totalPrograms: acc.courseCount || 0, institutes: [] },
      admissions: { applicationDeadline: "", entranceExams: {}, admissionProcess: [], reservationPolicy: { sc: "", st: "", obc: "", ews: "", pwd: "" } },
      placements: {},
      rankings: { national: [], international: [] },
      researchAndInnovation: { researchCenters: 0, patentsFiled: 0, publicationsPerYear: 0, researchFunding: "", phdScholars: 0, incubationCenter: { name: "", startupsFunded: 0, totalFunding: "" }, collaborations: [] },
      alumniNetwork: { totalAlumni: 0, notableAlumni: [], alumniInFortune500: 0, entrepreneursCreated: 0 },
      awards: [],
      courses: [],
      mediaGallery: undefined,
    };
    return fallback;
  }
);

// Server action to get course details
export const getCourseDetails = cache(
  async (instituteSlug: string, courseSlug: string): Promise<UiCourse | null> => {
    await connectToDatabase();
    const institute = await getInstituteDetails(instituteSlug);
    if (!institute) return null;
    return (
      institute.courses.find((course) => (course.slug || course.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) === courseSlug) ||
      null
    );
  }
);

// Server action to get courses for an institute
export const getInstituteCourses = cache(
  async (
    instituteSlug: string,
    params: CourseSearchParams = {}
  ): Promise<CourseSearchResult> => {
    await connectToDatabase();
    const institute = await getInstituteDetails(instituteSlug);
    if (!institute) {
      return {
        courses: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
        filters: {
          degrees: [],
          categories: [],
          levels: [],
          durations: [],
        },
      };
    }

    let filteredCourses = institute.courses;

    // Apply filters
    if (params.degree) {
      filteredCourses = filteredCourses.filter(
        (course) => course.degree.toLowerCase() === params.degree?.toLowerCase()
      );
    }

    if (params.category) {
      filteredCourses = filteredCourses.filter(
        (course) =>
          course.category.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params.query) {
      filteredCourses = filteredCourses.filter(
        (course) =>
          course.name.toLowerCase().includes(params.query!.toLowerCase()) ||
          (course.name && course.name.toLowerCase().includes(params.query!.toLowerCase()))
      );
    }

    // Pagination
    const pageSize = 10;
    const page = params.page || 1;
    const totalPages = Math.ceil(filteredCourses.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedCourses = filteredCourses.slice(
      startIndex,
      startIndex + pageSize
    );

    // Generate filter options
    const filters = {
      degrees: Array.from(new Set(institute.courses.map((c) => c.degree))).map(
        (degree: string) => ({
          value: degree.toLowerCase(),
          label: degree,
          count: institute.courses.filter((c) => c.degree === degree).length,
        })
      ),
      categories: Array.from(new Set(institute.courses.map((c) => c.category))).map((category: string) => ({
        value: category.toLowerCase(),
        label: category,
        count: institute.courses.filter((c) => c.category === category).length,
      })),
      levels: Array.from(new Set(institute.courses.map((c) => c.level))).map(
        (level: string) => ({
          value: level.toLowerCase(),
          label: level,
          count: institute.courses.filter((c) => c.level === level).length,
        })
      ),
      durations: Array.from(new Set(institute.courses.map((c) => c.duration))).map((duration: string) => ({
        value: duration.toLowerCase().replace(/\s+/g, "-"),
        label: duration,
        count: institute.courses.filter((c) => c.duration === duration).length,
      })),
    };

    return {
      courses: paginatedCourses as any,
      total: filteredCourses.length,
      totalPages,
      currentPage: page,
      filters,
    };
  }
);

