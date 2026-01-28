"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Building2,
  Award,
  Users,
  Star,
  Clock,
  FileText,
  CheckCircle2,
  IndianRupee,
  Briefcase,
} from "lucide-react";

// Interface matching API response for programmes
interface ProgramData {
  _k?: string;
  type?: string;
  id?: string;
  slug?: string;
  pSlug?: string;
  name?: string;
  programme?: string;
  institute?:
    | string
    | {
        id?: string;
        name?: string;
        slug?: string;
        logo?: string;
        location?: { city?: string; state?: string };
      };
  logo?: string;
  city?: string;
  state?: string;
  courseCount?: number;
  placementRating?: number;
  eligibilityExams?: string[];
  courses?: Array<{
    id?: string;
    name?: string;
    degree?: string;
    slug?: string;
    duration?: string;
    fee?: number;
    feeF?: string;
    fees?: { totalFee?: number };
  }>;
  avgPackage?: number | null;
  avgPackageF?: string | null;
  url?: string;
}

interface ProgramCardProps {
  program: ProgramData;
  variant?: "default" | "compact" | "detailed";
}

export function ProgramCard({
  program,
  variant = "default",
}: ProgramCardProps) {
  const nf = new Intl.NumberFormat("en-IN");

  // Helper to check if value is valid
  const isValid = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (value === 0) return false;
    if (value === "") return false;
    if (value === "N/A" || value === "null") return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
  };

  // Extract institute info regardless of format
  const getInstituteInfo = () => {
    if (typeof program.institute === "string") {
      return {
        name: program.institute,
        slug: program.slug,
        logo: program.logo,
        city: program.city,
        state: program.state,
      };
    }
    if (program.institute && typeof program.institute === "object") {
      return {
        name: program.institute.name,
        slug: program.institute.slug || program.slug,
        logo: program.institute.logo || program.logo,
        city: program.institute.location?.city || program.city,
        state: program.institute.location?.state || program.state,
      };
    }
    return {
      name: undefined,
      slug: program.slug,
      logo: program.logo,
      city: program.city,
      state: program.state,
    };
  };

  const instituteInfo = getInstituteInfo();

  // Generate URLs
  const getProgramUrl = () => {
    if (program.url) return program.url;
    if (instituteInfo.slug && program.pSlug) {
      return `/recommendation-collections/${instituteInfo.slug}?programme=${program.pSlug}`;
    }
    if (instituteInfo.slug) {
      return `/recommendation-collections/${instituteInfo.slug}`;
    }
    return "#";
  };

  const getInstituteUrl = () => {
    if (instituteInfo.slug)
      return `/recommendation-collections/${instituteInfo.slug}`;
    return "#";
  };

  // Compact variant for list view
  if (variant === "compact") {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 shadow-sm hover:scale-[1.005] h-full bg-gradient-to-br from-white via-purple-50/10 to-indigo-50/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-md group-hover:border-purple-300 group-hover:shadow-lg transition-all bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              {isValid(instituteInfo.logo) ? (
                <img
                  src={instituteInfo.logo!}
                  alt={instituteInfo.name || "Institute"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <span
                className={`text-xl font-bold text-white ${isValid(instituteInfo.logo) ? "hidden" : ""}`}
              >
                {(program.name || instituteInfo.name)
                  ?.charAt(0)
                  ?.toUpperCase() || "P"}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Program Name */}
              <Link
                href={getProgramUrl()}
                className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors line-clamp-2 group-hover:text-purple-600"
              >
                {program.name || program.programme}
              </Link>

              {/* Institute Name */}
              {isValid(instituteInfo.name) && (
                <Link
                  href={getInstituteUrl()}
                  className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-purple-600" />
                  <span className="line-clamp-1">{instituteInfo.name}</span>
                </Link>
              )}

              {/* Location */}
              {(isValid(instituteInfo.city) ||
                isValid(instituteInfo.state)) && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span>
                    {[instituteInfo.city, instituteInfo.state]
                      .filter(isValid)
                      .join(", ")}
                  </span>
                </div>
              )}

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {isValid(program.courseCount) && program.courseCount! > 0 && (
                  <div className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200">
                    <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700">
                      {program.courseCount} Courses
                    </span>
                  </div>
                )}
                {isValid(program.placementRating) &&
                  program.placementRating! > 0 && (
                    <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1.5 rounded-lg border border-yellow-200">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-semibold text-yellow-700">
                        {program.placementRating}/5
                      </span>
                    </div>
                  )}
                {(isValid(program.avgPackage) ||
                  isValid(program.avgPackageF)) && (
                  <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200">
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">
                      {program.avgPackageF ||
                        `₹${nf.format(program.avgPackage!)}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Eligibility Exams */}
              {isValid(program.eligibilityExams) &&
                program.eligibilityExams!.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {program
                        .eligibilityExams!.slice(0, 5)
                        .map((exam, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {exam}
                          </Badge>
                        ))}
                      {program.eligibilityExams!.length > 5 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-gray-100 text-gray-600"
                        >
                          +{program.eligibilityExams!.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

              {/* Sample Courses */}
              {isValid(program.courses) && program.courses!.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">
                    Sample Courses:
                  </p>
                  <div className="space-y-1">
                    {program.courses!.slice(0, 2).map((course, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2 border border-gray-100"
                      >
                        <span className="flex-1 text-gray-700 font-medium line-clamp-1">
                          {course.degree || course.name}
                        </span>
                        {(isValid(course.fee) ||
                          isValid(course.feeF) ||
                          isValid(course.fees?.totalFee)) && (
                          <span className="font-bold text-green-600 whitespace-nowrap ml-2">
                            {course.feeF ||
                              `₹${nf.format(course.fee || course.fees?.totalFee || 0)}`}
                          </span>
                        )}
                      </div>
                    ))}
                    {program.courses!.length > 2 && (
                      <p className="text-xs text-purple-600 font-medium">
                        +{program.courses!.length - 2} more courses
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 whitespace-nowrap h-9 text-sm px-6 shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <Link href={getProgramUrl()}>View Details</Link>
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
      <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 shadow-md bg-gradient-to-br from-white via-purple-50/10 to-indigo-50/20">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-lg group-hover:border-purple-300 transition-all bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              {isValid(instituteInfo.logo) ? (
                <img
                  src={instituteInfo.logo!}
                  alt={instituteInfo.name || "Institute"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {(program.name || instituteInfo.name)
                    ?.charAt(0)
                    ?.toUpperCase() || "P"}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={getProgramUrl()}
                className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors group-hover:text-purple-600"
              >
                {program.name || program.programme}
              </Link>

              {isValid(instituteInfo.name) && (
                <Link
                  href={getInstituteUrl()}
                  className="flex items-center gap-1.5 mt-2 text-base text-gray-600 hover:text-purple-600 transition-colors font-medium"
                >
                  <Building2 className="h-4 w-4 text-purple-600" />
                  {instituteInfo.name}
                </Link>
              )}

              {(isValid(instituteInfo.city) ||
                isValid(instituteInfo.state)) && (
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {[instituteInfo.city, instituteInfo.state]
                    .filter(isValid)
                    .join(", ")}
                </div>
              )}
            </div>

            <Button
              size="sm"
              asChild
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-10 px-6 shadow-lg font-semibold"
            >
              <Link href={getProgramUrl()}>View Details</Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {isValid(program.courseCount) && program.courseCount! > 0 && (
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">
                    Courses
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {program.courseCount}
                </div>
              </div>
            )}

            {isValid(program.placementRating) &&
              program.placementRating! > 0 && (
                <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                  <div className="flex items-center gap-2 text-yellow-600 mb-1">
                    <Award className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase">
                      Rating
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-700 flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    {program.placementRating}/5
                  </div>
                </div>
              )}

            {(isValid(program.avgPackage) || isValid(program.avgPackageF)) && (
              <div className="bg-green-50 rounded-xl p-3 border border-green-100 col-span-2">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">
                    Avg Package
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {program.avgPackageF || `₹${nf.format(program.avgPackage!)}`}
                </div>
              </div>
            )}
          </div>

          {/* Eligibility Exams */}
          {isValid(program.eligibilityExams) &&
            program.eligibilityExams!.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Eligibility Exams
                </h4>
                <div className="flex flex-wrap gap-2">
                  {program.eligibilityExams!.map((exam, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      {exam}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Sample Courses */}
          {isValid(program.courses) && program.courses!.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-purple-600" />
                Sample Courses
              </h4>
              <div className="space-y-2">
                {program.courses!.slice(0, 4).map((course, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-700 truncate">
                        {course.degree || course.name}
                      </span>
                      {isValid(course.duration) && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-50 text-blue-600 border-blue-200 flex-shrink-0"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {course.duration}
                        </Badge>
                      )}
                    </div>
                    {(isValid(course.fee) ||
                      isValid(course.feeF) ||
                      isValid(course.fees?.totalFee)) && (
                      <span className="text-green-600 font-bold whitespace-nowrap ml-3">
                        {course.feeF ||
                          `₹${nf.format(course.fee || course.fees?.totalFee || 0)}`}
                      </span>
                    )}
                  </div>
                ))}
                {program.courses!.length > 4 && (
                  <p className="text-sm text-purple-600 font-medium text-center">
                    +{program.courses!.length - 4} more courses available
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant - Grid card
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 shadow-lg hover:scale-[1.02] h-full flex flex-col bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/30">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-md group-hover:border-purple-300 group-hover:shadow-lg transition-all bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            {isValid(instituteInfo.logo) ? (
              <img
                src={instituteInfo.logo!}
                alt={instituteInfo.name || "Institute"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-white">
                {(program.name || instituteInfo.name)
                  ?.charAt(0)
                  ?.toUpperCase() || "P"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={getProgramUrl()}
              className="text-base font-bold text-gray-900 hover:text-purple-600 transition-colors line-clamp-2 group-hover:text-purple-600"
            >
              {program.name || program.programme}
            </Link>
            {isValid(instituteInfo.name) && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-purple-600 flex-shrink-0" />
                {instituteInfo.name}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        {(isValid(instituteInfo.city) || isValid(instituteInfo.state)) && (
          <div className="flex items-center gap-1.5 mb-3 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            <span>
              {[instituteInfo.city, instituteInfo.state]
                .filter(isValid)
                .join(", ")}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {isValid(program.courseCount) && program.courseCount! > 0 && (
            <div className="bg-purple-50 rounded-lg p-2.5 border border-purple-100">
              <div className="flex items-center gap-1 text-purple-600 mb-0.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Courses</span>
              </div>
              <div className="text-lg font-bold text-purple-700">
                {program.courseCount}
              </div>
            </div>
          )}

          {isValid(program.placementRating) && program.placementRating! > 0 && (
            <div className="bg-yellow-50 rounded-lg p-2.5 border border-yellow-100">
              <div className="flex items-center gap-1 text-yellow-600 mb-0.5">
                <Star className="h-3.5 w-3.5 fill-yellow-500" />
                <span className="text-xs font-medium">Rating</span>
              </div>
              <div className="text-lg font-bold text-yellow-700">
                {program.placementRating}/5
              </div>
            </div>
          )}
        </div>

        {/* Avg Package */}
        {(isValid(program.avgPackage) || isValid(program.avgPackageF)) && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-3 border border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xs text-green-600 font-medium">
                  Avg Package
                </div>
                <div className="text-lg font-bold text-green-700">
                  {program.avgPackageF || `₹${nf.format(program.avgPackage!)}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Eligibility Exams */}
        {isValid(program.eligibilityExams) &&
          program.eligibilityExams!.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-600 mb-1.5">
                Eligibility:
              </p>
              <div className="flex flex-wrap gap-1">
                {program.eligibilityExams!.slice(0, 3).map((exam, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {exam}
                  </Badge>
                ))}
                {program.eligibilityExams!.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-gray-100 text-gray-600"
                  >
                    +{program.eligibilityExams!.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

        {/* Sample Courses Preview */}
        {isValid(program.courses) && program.courses!.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-600 mb-1.5">
              Courses:
            </p>
            <div className="space-y-1">
              {program.courses!.slice(0, 2).map((course, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-gray-50 rounded p-2 border border-gray-100 flex justify-between"
                >
                  <span className="text-gray-700 line-clamp-1">
                    {course.degree || course.name}
                  </span>
                  {(isValid(course.fee) || isValid(course.feeF)) && (
                    <span className="text-green-600 font-semibold ml-2">
                      {course.feeF || `₹${nf.format(course.fee!)}`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <Button
            asChild
            size="sm"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-9 text-sm shadow-md hover:shadow-lg transition-all font-semibold"
          >
            <Link href={getProgramUrl()}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
