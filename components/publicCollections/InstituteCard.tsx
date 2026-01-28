"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Users,
  GraduationCap,
  Award,
  Star,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  TrendingUp,
  BookOpen,
  Globe,
  Briefcase,
  School,
  Wifi,
  CheckCircle2,
  Trophy,
} from "lucide-react";

// Interface for API response
interface InstituteData {
  _k?: string;
  type?: string;
  id?: string;
  _id?: string;
  slug?: string;
  name?: string;
  shortName?: string;
  logo?: string;
  city?: string;
  state?: string;
  location?: {
    city?: string;
    state?: string;
    address?: string;
  };
  establishedYear?: number | string;
  instituteType?: string;
  status?: string;
  naacGrade?: string;
  nirfRank?: number;
  accreditation?: {
    naac?: { grade?: string; score?: number };
    nirf?: { overallRank?: number; categoryRanks?: any };
    aicte?: { approved?: boolean };
    nba?: { approved?: boolean };
  };
  placements?: {
    averageSalary?: number;
    highestSalary?: number;
    overallPlacementRate?: number;
    companiesVisited?: number;
    topRecruiters?: string[];
    sectors?: string[];
    [key: string]: any;
  };
  programmes?: Array<{
    name?: string;
    slug?: string;
    courseCount?: number;
    placementRating?: number;
    eligibilityExams?: string[];
    course?: Array<{
      name?: string;
      degree?: string;
      duration?: string;
      fee?: number;
    }>;
  }>;
  courses?: Array<{
    id?: string;
    name?: string;
    slug?: string;
    degree?: string;
  }>;
  campusDetails?: {
    facilities?: string[];
    area?: string;
  };
  contact?: {
    phone?: string[];
    email?: string[];
    website?: string;
  };
  rawOverview?: Array<{ key?: string; value?: string }>;
  overview?: {
    description?: string;
    stats?: Array<{ description?: string }>;
  };
  description?: string;
  faculty_student_ratio?: {
    students?: Array<{ key?: string; value?: string }>;
  };
  totalCourses?: number | any;
  avgPackage?: number | null;
  avgPackageF?: string | null;
  url?: string;
}

interface InstituteCardProps {
  institute: InstituteData;
  variant?: "default" | "compact" | "detailed";
  showCourses?: boolean;
}

export function InstituteCard({
  institute,
  variant = "default",
  showCourses = false,
}: InstituteCardProps) {
  const nf = new Intl.NumberFormat("en-IN");

  // Helper to check if value is valid
  const isValid = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (value === 0) return false;
    if (value === "") return false;
    if (value === "N/A" || value === "null" || value === "None") return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
  };

  // Get location info
  const getLocation = () => {
    const city = institute.location?.city || institute.city;
    const state = institute.location?.state || institute.state;
    return { city, state };
  };

  const location = getLocation();

  // Generate institute URL
  const getInstituteUrl = () => {
    if (institute.url) return institute.url;
    if (institute.slug) return `/recommendation-collections/${institute.slug}`;
    return "#";
  };

  // Get accreditation badges
  const getAccreditationBadges = () => {
    const badges: React.ReactNode[] = [];

    // NAAC Grade
    const naacGrade =
      institute.accreditation?.naac?.grade || institute.naacGrade;
    if (isValid(naacGrade)) {
      badges.push(
        <Badge
          key="naac"
          variant="secondary"
          className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200 shadow-sm font-semibold"
        >
          <Award className="h-3 w-3 mr-1" />
          NAAC {naacGrade}
        </Badge>,
      );
    }

    // NIRF Rank
    const nirfRank =
      institute.accreditation?.nirf?.overallRank || institute.nirfRank;
    if (isValid(nirfRank)) {
      badges.push(
        <Badge
          key="nirf"
          variant="secondary"
          className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200 shadow-sm font-semibold"
        >
          <Trophy className="h-3 w-3 mr-1" />
          NIRF #{nirfRank}
        </Badge>,
      );
    }

    // AICTE Approved
    if (institute.accreditation?.aicte?.approved) {
      badges.push(
        <Badge
          key="aicte"
          variant="secondary"
          className="bg-gradient-to-r from-purple-50 to-violet-50 text-purple-800 border border-purple-200 shadow-sm font-semibold"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          AICTE
        </Badge>,
      );
    }

    // NBA Approved
    if (institute.accreditation?.nba?.approved) {
      badges.push(
        <Badge
          key="nba"
          variant="secondary"
          className="bg-gradient-to-r from-orange-50 to-amber-50 text-orange-800 border border-orange-200 shadow-sm font-semibold"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          NBA
        </Badge>,
      );
    }

    return badges;
  };

  // Get placement data
  const getPlacementData = () => {
    if (!institute.placements) return null;

    // Direct placement data
    if ("averageSalary" in institute.placements) {
      return institute.placements;
    }

    // Year-based placement data
    const latestYear = Object.keys(institute.placements).find(
      (key) =>
        key !== "sectors" && key !== "topRecruiters" && !isNaN(Number(key)),
    );
    if (latestYear && institute.placements[latestYear]) {
      const data = institute.placements[latestYear];
      if (typeof data === "object" && !Array.isArray(data)) {
        return data;
      }
    }

    return null;
  };

  // Get total courses count
  const getTotalCourses = () => {
    if (isValid(institute.totalCourses)) return institute.totalCourses;

    if (institute.programmes && Array.isArray(institute.programmes)) {
      return institute.programmes.reduce(
        (acc, p) => acc + (p.courseCount || 0),
        0,
      );
    }

    // Check rawOverview
    if (institute.rawOverview) {
      const coursesItem = institute.rawOverview.find((item) =>
        item.key?.toLowerCase().includes("courses offered"),
      );
      if (coursesItem?.value) {
        const match = coursesItem.value.match(/\d+/);
        if (match) return parseInt(match[0]);
      }
    }

    return 0;
  };

  // Get description
  const getDescription = () => {
    // Try faculty_student_ratio.students
    if (institute.faculty_student_ratio?.students) {
      const descItem = institute.faculty_student_ratio.students.find(
        (item) => item.key?.toLowerCase() === "description",
      );
      if (descItem?.value && isValid(descItem.value)) return descItem.value;
    }

    // Try overview.stats[0].description
    if (institute.overview?.stats?.[0]?.description) {
      return institute.overview.stats[0].description;
    }

    // Try overview.description
    if (institute.overview?.description) return institute.overview.description;

    // Try direct description
    if (institute.description) return institute.description;

    return "";
  };

  // Get top recruiters
  const getTopRecruiters = () => {
    if (
      institute.placements?.topRecruiters &&
      Array.isArray(institute.placements.topRecruiters)
    ) {
      return institute.placements.topRecruiters.filter((r) => isValid(r));
    }
    return [];
  };

  // Get facilities count
  const getFacilitiesCount = () => {
    if (
      institute.campusDetails?.facilities &&
      Array.isArray(institute.campusDetails.facilities)
    ) {
      return institute.campusDetails.facilities.length;
    }
    return 0;
  };

  const placementData = getPlacementData();
  const accreditationBadges = getAccreditationBadges();
  const description = getDescription();
  const totalCourses: any = getTotalCourses();
  const topRecruiters = getTopRecruiters();

  // Compact variant
  if (variant === "compact") {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 shadow-sm hover:scale-[1.005] h-full bg-gradient-to-br from-white via-blue-50/10 to-indigo-50/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-md group-hover:border-blue-300 group-hover:shadow-lg transition-all bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              {isValid(institute.logo) ? (
                <img
                  src={institute.logo!}
                  alt={institute.name || "Institute"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <span
                className={`text-xl font-bold text-white ${isValid(institute.logo) ? "hidden" : ""}`}
              >
                {institute.name?.charAt(0)?.toUpperCase() || "I"}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={getInstituteUrl()}
                className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 group-hover:text-blue-600"
              >
                {institute.name}
              </Link>

              {(isValid(location.city) || isValid(location.state)) && (
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-600">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" />
                  <span>
                    {[location.city, location.state].filter(isValid).join(", ")}
                  </span>
                </div>
              )}

              {/* Type and Established */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {isValid(institute.instituteType) && (
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-200 text-blue-700 bg-blue-50 font-medium"
                  >
                    {institute.instituteType}
                  </Badge>
                )}
                {isValid(institute.establishedYear) && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    <Calendar className="h-3 w-3" />
                    Est. {institute.establishedYear}
                  </div>
                )}
              </div>

              {/* Accreditation Badges */}
              {accreditationBadges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {accreditationBadges.slice(0, 3)}
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {totalCourses > 0 && (
                  <div className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200">
                    <School className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700">
                      {totalCourses} Courses
                    </span>
                  </div>
                )}
                {getFacilitiesCount() > 0 && (
                  <div className="flex items-center gap-1.5 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-200">
                    <Wifi className="h-3.5 w-3.5 text-teal-600" />
                    <span className="text-xs font-semibold text-teal-700">
                      {getFacilitiesCount()} Facilities
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              {/* Placement Stats */}
              {placementData?.averageSalary &&
                isValid(placementData.averageSalary) && (
                  <div className="text-right bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200 shadow-sm">
                    <div className="text-xs text-green-600 font-semibold uppercase tracking-wide">
                      Avg Package
                    </div>
                    <div className="text-lg font-bold text-green-700 mt-0.5">
                      ₹
                      {typeof placementData.averageSalary === "number"
                        ? nf.format(placementData.averageSalary)
                        : placementData.averageSalary}
                    </div>
                  </div>
                )}

              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 whitespace-nowrap h-9 text-sm px-6 shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <Link href={getInstituteUrl()}>View Details</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant
  if (variant === "detailed") {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 shadow-md bg-gradient-to-br from-white via-blue-50/10 to-indigo-50/20">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-lg group-hover:border-blue-300 transition-all bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              {isValid(institute.logo) ? (
                <img
                  src={institute.logo!}
                  alt={institute.name || "Institute"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {institute.name?.charAt(0)?.toUpperCase() || "I"}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={getInstituteUrl()}
                    className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 group-hover:text-blue-600"
                  >
                    {institute.name}
                  </Link>
                  {isValid(institute.shortName) && (
                    <p className="text-sm text-gray-500 font-medium mt-0.5">
                      ({institute.shortName})
                    </p>
                  )}
                </div>
                <Button
                  asChild
                  size="sm"
                  className="h-9 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md font-semibold flex-shrink-0"
                >
                  <Link href={getInstituteUrl()}>View Details</Link>
                </Button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {accreditationBadges}
                {isValid(institute.instituteType) && (
                  <Badge
                    variant="outline"
                    className="border-orange-200 text-orange-700 bg-orange-50 font-medium"
                  >
                    <Building2 className="h-3 w-3 mr-1" />
                    {institute.instituteType}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-gray-600 text-sm leading-relaxed mt-3 line-clamp-3">
              {description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-4">
          {/* Location & Contact Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {(isValid(location.city) || isValid(location.state)) && (
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 bg-blue-50 border-blue-200 text-blue-700 px-3 py-1"
              >
                <MapPin className="h-3.5 w-3.5" />
                {[location.city, location.state].filter(isValid).join(", ")}
              </Badge>
            )}
            {isValid(institute.establishedYear) && (
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 bg-purple-50 border-purple-200 text-purple-700 px-3 py-1"
              >
                <Calendar className="h-3.5 w-3.5" />
                Est. {institute.establishedYear}
              </Badge>
            )}
            {institute.contact?.phone?.[0] &&
              isValid(institute.contact.phone[0]) && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5 bg-green-50 border-green-200 text-green-700 px-3 py-1"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {institute.contact.phone[0]}
                </Badge>
              )}
          </div>

          {/* Academic Stats */}
          {(totalCourses > 0 || getFacilitiesCount() > 0) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <h4 className="font-bold text-gray-900 text-sm">
                  Academic Overview
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {totalCourses > 0 && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-3 py-1">
                    <span className="text-base font-bold">{totalCourses}</span>
                    <span className="ml-1.5 text-xs">Courses</span>
                  </Badge>
                )}
                {getFacilitiesCount() > 0 && (
                  <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 px-3 py-1">
                    <span className="text-base font-bold">
                      {getFacilitiesCount()}
                    </span>
                    <span className="ml-1.5 text-xs">Facilities</span>
                  </Badge>
                )}
                {institute.programmes && institute.programmes.length > 0 && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1">
                    <span className="text-base font-bold">
                      {institute.programmes.length}
                    </span>
                    <span className="ml-1.5 text-xs">Programs</span>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Placement Stats */}
          {placementData &&
            (isValid(placementData.averageSalary) ||
              isValid(placementData.highestSalary) ||
              isValid(placementData.overallPlacementRate)) && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h4 className="font-bold text-gray-900 text-sm">
                    Placements
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isValid(placementData.averageSalary) && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 border-green-200 text-green-700 px-3 py-1"
                    >
                      Avg: ₹
                      {typeof placementData.averageSalary === "number"
                        ? nf.format(placementData.averageSalary)
                        : placementData.averageSalary}
                    </Badge>
                  )}
                  {isValid(placementData.highestSalary) && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 border-blue-200 text-blue-700 px-3 py-1"
                    >
                      Highest: ₹
                      {typeof placementData.highestSalary === "number"
                        ? nf.format(placementData.highestSalary)
                        : placementData.highestSalary}
                    </Badge>
                  )}
                  {isValid(placementData.overallPlacementRate) && (
                    <Badge
                      variant="outline"
                      className="bg-purple-50 border-purple-200 text-purple-700 px-3 py-1"
                    >
                      {typeof placementData.overallPlacementRate === "number"
                        ? `${placementData.overallPlacementRate}%`
                        : placementData.overallPlacementRate}{" "}
                      Placed
                    </Badge>
                  )}
                  {isValid(placementData.companiesVisited) && (
                    <Badge
                      variant="outline"
                      className="bg-orange-50 border-orange-200 text-orange-700 px-3 py-1"
                    >
                      {typeof placementData.companiesVisited === "number"
                        ? nf.format(placementData.companiesVisited)
                        : placementData.companiesVisited}{" "}
                      Companies
                    </Badge>
                  )}
                </div>
              </div>
            )}

          {/* Top Recruiters */}
          {topRecruiters.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-indigo-600" />
                <h4 className="font-bold text-gray-900 text-sm">
                  Top Recruiters
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topRecruiters.slice(0, 8).map((recruiter, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs bg-indigo-50 border-indigo-200 text-indigo-700 px-2 py-1"
                  >
                    {recruiter}
                  </Badge>
                ))}
                {topRecruiters.length > 8 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1"
                  >
                    +{topRecruiters.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Programmes */}
          {institute.programmes && institute.programmes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-purple-600" />
                  <h4 className="font-bold text-gray-900 text-sm">Programs</h4>
                </div>
                {institute.programmes.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{institute.programmes.length - 3} more
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {institute.programmes.slice(0, 3).map((program, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-blue-900">
                          {program.name}
                        </h5>
                        {isValid(program.courseCount) &&
                          program.courseCount! > 0 && (
                            <Badge
                              variant="outline"
                              className="h-5 px-2 text-xs bg-blue-100 border-blue-300 text-blue-700"
                            >
                              {program.courseCount} courses
                            </Badge>
                          )}
                      </div>
                      {isValid(program.placementRating) &&
                        program.placementRating! > 0 && (
                          <Badge className="bg-green-500 text-white border-0 px-2 py-0.5 text-xs">
                            <Star className="h-3 w-3 mr-0.5 fill-white" />
                            {program.placementRating}/5
                          </Badge>
                        )}
                    </div>
                    {/* Eligibility Exams */}
                    {program.eligibilityExams &&
                      program.eligibilityExams.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {program.eligibilityExams
                            .slice(0, 4)
                            .map((exam, examIdx) => (
                              <Badge
                                key={examIdx}
                                variant="outline"
                                className="h-5 px-2 text-xs bg-white border-gray-200 text-gray-700"
                              >
                                {exam}
                              </Badge>
                            ))}
                          {program.eligibilityExams.length > 4 && (
                            <Badge
                              variant="outline"
                              className="h-5 px-2 text-xs bg-gray-100 border-gray-300 text-gray-500"
                            >
                              +{program.eligibilityExams.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant - Grid card
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 shadow-lg hover:scale-[1.02] h-full flex flex-col bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-md group-hover:border-blue-300 group-hover:shadow-lg transition-all bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            {isValid(institute.logo) ? (
              <img
                src={institute.logo!}
                alt={institute.name || "Institute"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-white">
                {institute.name?.charAt(0)?.toUpperCase() || "I"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={getInstituteUrl()}
              className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 group-hover:text-blue-600"
            >
              {institute.name}
            </Link>
            {(isValid(location.city) || isValid(location.state)) && (
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-blue-500 flex-shrink-0" />
                {[location.city, location.state].filter(isValid).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Type Badge */}
        {isValid(institute.instituteType) && (
          <Badge
            variant="outline"
            className="w-fit mb-3 text-xs border-blue-200 text-blue-700 bg-blue-50 font-medium"
          >
            <Building2 className="h-3 w-3 mr-1" />
            {institute.instituteType}
          </Badge>
        )}

        {/* Accreditation */}
        {accreditationBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {accreditationBadges.slice(0, 3)}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {isValid(institute.establishedYear) && (
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="flex items-center gap-1 text-gray-500 mb-0.5">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">Established</span>
              </div>
              <div className="text-sm font-bold text-gray-700">
                {institute.establishedYear}
              </div>
            </div>
          )}
          {totalCourses > 0 && (
            <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
              <div className="flex items-center gap-1 text-purple-600 mb-0.5">
                <School className="h-3 w-3" />
                <span className="text-xs">Courses</span>
              </div>
              <div className="text-sm font-bold text-purple-700">
                {totalCourses}
              </div>
            </div>
          )}
        </div>

        {/* Placement Stats */}
        {placementData &&
          (isValid(placementData.averageSalary) ||
            isValid(placementData.overallPlacementRate)) && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-3 border border-green-200">
              <div className="grid grid-cols-2 gap-3">
                {isValid(placementData.averageSalary) && (
                  <div>
                    <div className="text-xs text-green-600 font-medium">
                      Avg Package
                    </div>
                    <div className="text-base font-bold text-green-700">
                      ₹
                      {typeof placementData.averageSalary === "number"
                        ? nf.format(placementData.averageSalary)
                        : placementData.averageSalary}
                    </div>
                  </div>
                )}
                {isValid(placementData.overallPlacementRate) && (
                  <div>
                    <div className="text-xs text-blue-600 font-medium">
                      Placement Rate
                    </div>
                    <div className="text-base font-bold text-blue-700">
                      {typeof placementData.overallPlacementRate === "number"
                        ? `${placementData.overallPlacementRate}%`
                        : placementData.overallPlacementRate}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Top Recruiters */}
        {topRecruiters.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
              Top Recruiters:
            </p>
            <div className="flex flex-wrap gap-1">
              {topRecruiters.slice(0, 4).map((recruiter, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs bg-indigo-50 border-indigo-200 text-indigo-700"
                >
                  {recruiter}
                </Badge>
              ))}
              {topRecruiters.length > 4 && (
                <span className="text-xs text-gray-500 px-1">
                  +{topRecruiters.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <Button
            asChild
            size="sm"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-9 text-sm shadow-md hover:shadow-lg transition-all font-semibold"
          >
            <Link href={getInstituteUrl()}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
