"use server";

import { cache } from "react";
import {
  InstituteSearchParams,
  InstituteSearchResult,
  CourseSearchParams,
  CourseSearchResult,
} from "@/types/institute";
import gujaratUniversityData from "./enhanced-gujarat-university.json";

// Define types that exactly match the JSON structure
type JsonInstitute = typeof gujaratUniversityData;
type JsonCourse = typeof gujaratUniversityData.courses[0];

// Use the JSON data directly without any casting or conversion
const gujaratUniversity: JsonInstitute = gujaratUniversityData;
const allInstitutes: JsonInstitute[] = [gujaratUniversity];

// Simple function to get all institutes (just Gujarat University for now)
const getAllInstitutes = (): JsonInstitute[] => {
  return allInstitutes;
};

// Cache the function for better performance
export const getInstituteRecommendations = cache(
  async (params: InstituteSearchParams): Promise<InstituteSearchResult> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const {
      location,
      type,
      category,
      query,
      page = 1,
      sortBy = "popularity",
      establishedYear,
      accreditation,
    } = params;

    let filteredInstitutes = getAllInstitutes();

    // Apply filters
    if (location) {
      filteredInstitutes = filteredInstitutes.filter(
        (institute: JsonInstitute) =>
          institute.location.city
            .toLowerCase()
            .includes(location.toLowerCase()) ||
          institute.location.state
            .toLowerCase()
            .includes(location.toLowerCase())
      );
    }

    if (type) {
      filteredInstitutes = filteredInstitutes.filter(
        (institute: JsonInstitute) => institute.type.toLowerCase() === type.toLowerCase()
      );
    }

    if (query) {
      filteredInstitutes = filteredInstitutes.filter(
        (institute: JsonInstitute) =>
          institute.name.toLowerCase().includes(query.toLowerCase()) ||
          institute.location.city.toLowerCase().includes(query.toLowerCase()) ||
          institute.overview.description
            .toLowerCase()
            .includes(query.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "ranking":
        filteredInstitutes.sort((a: JsonInstitute, b: JsonInstitute) => {
          const aRank = typeof a.rankings.national[0]?.rank === 'string' ? 
            parseInt(a.rankings.national[0].rank.toString().replace(/[^0-9]/g, '')) || 999 : 
            a.rankings.national[0]?.rank || 999;
          const bRank = typeof b.rankings.national[0]?.rank === 'string' ? 
            parseInt(b.rankings.national[0].rank.toString().replace(/[^0-9]/g, '')) || 999 : 
            b.rankings.national[0]?.rank || 999;
          return aRank - bRank;
        });
        break;
      case "established":
        filteredInstitutes.sort(
          (a: JsonInstitute, b: JsonInstitute) => b.establishedYear - a.establishedYear
        );
        break;
      case "name":
        filteredInstitutes.sort((a: JsonInstitute, b: JsonInstitute) => a.name.localeCompare(b.name));
        break;
      case "popularity":
      default:
        // Use a default sorting since we don't have totalStudents in JSON
        filteredInstitutes.sort((a: JsonInstitute, b: JsonInstitute) => a.name.localeCompare(b.name));
    }

    // Pagination
    const pageSize = 10;
    const totalPages = Math.ceil(filteredInstitutes.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedInstitutes = filteredInstitutes.slice(
      startIndex,
      startIndex + pageSize
    );

    // Generate filter options
    const allInstitutes = getAllInstitutes();
    const filters = {
      locations: Array.from(
        new Set(allInstitutes.map((i: JsonInstitute) => i.location.city))
      ).map((city: string) => ({
        value: city.toLowerCase(),
        label: city,
        count: allInstitutes.filter((i: JsonInstitute) => i.location.city === city).length,
      })),
      types: Array.from(new Set(allInstitutes.map((i: JsonInstitute) => i.type))).map(
        (type: string) => ({
          value: type.toLowerCase(),
          label: type,
          count: allInstitutes.filter((i: JsonInstitute) => i.type === type).length,
        })
      ),
      categories: [
        {
          value: "engineering",
          label: "Engineering",
          count: allInstitutes.length,
        },
        {
          value: "management",
          label: "Management",
          count: Math.floor(allInstitutes.length * 0.3),
        },
        {
          value: "law",
          label: "Law",
          count: Math.floor(allInstitutes.length * 0.2),
        },
      ],
      accreditations: [
        {
          value: "naac-a+",
          label: "NAAC A+",
          count: Math.floor(allInstitutes.length * 0.3),
        },
        {
          value: "naac-a",
          label: "NAAC A",
          count: Math.floor(allInstitutes.length * 0.4),
        },
        {
          value: "aicte",
          label: "AICTE Approved",
          count: allInstitutes.length,
        },
      ],
    };

    return {
      institutes: paginatedInstitutes as any,
      total: filteredInstitutes.length,
      totalPages,
      currentPage: page,
      filters,
    };
  }
);

// Server action to get individual institute details
export const getInstituteDetails = cache(
  async (slug: string): Promise<JsonInstitute | null> => {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const allInstitutes = getAllInstitutes();
    return allInstitutes.find((institute: JsonInstitute) => institute.slug === slug) || null;
  }
);

// Server action to get course details
export const getCourseDetails = cache(
  async (instituteSlug: string, courseSlug: string): Promise<JsonCourse | null> => {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const institute = await getInstituteDetails(instituteSlug);
    if (!institute) return null;

    return (
      institute.courses.find((course: JsonCourse) => 
        course.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === courseSlug
      ) || null
    );
  }
);

// Server action to get courses for an institute
export const getInstituteCourses = cache(
  async (
    instituteSlug: string,
    params: CourseSearchParams = {}
  ): Promise<CourseSearchResult> => {
    await new Promise((resolve) => setTimeout(resolve, 50));

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
        (course: JsonCourse) => course.degree.toLowerCase() === params.degree?.toLowerCase()
      );
    }

    if (params.category) {
      filteredCourses = filteredCourses.filter(
        (course: JsonCourse) =>
          course.category.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params.query) {
      filteredCourses = filteredCourses.filter(
        (course: JsonCourse) =>
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
      degrees: Array.from(new Set(institute.courses.map((c: JsonCourse) => c.degree))).map(
        (degree: string) => ({
          value: degree.toLowerCase(),
          label: degree,
          count: institute.courses.filter((c: JsonCourse) => c.degree === degree).length,
        })
      ),
      categories: Array.from(
        new Set(institute.courses.map((c: JsonCourse) => c.category))
      ).map((category: string) => ({
        value: category.toLowerCase(),
        label: category,
        count: institute.courses.filter((c: JsonCourse) => c.category === category).length,
      })),
      levels: Array.from(new Set(institute.courses.map((c: JsonCourse) => c.level))).map(
        (level: string) => ({
          value: level.toLowerCase(),
          label: level,
          count: institute.courses.filter((c: JsonCourse) => c.level === level).length,
        })
      ),
      durations: Array.from(
        new Set(institute.courses.map((c: JsonCourse) => c.duration))
      ).map((duration: string) => ({
        value: duration.toLowerCase().replace(/\s+/g, "-"),
        label: duration,
        count: institute.courses.filter((c: JsonCourse) => c.duration === duration).length,
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
