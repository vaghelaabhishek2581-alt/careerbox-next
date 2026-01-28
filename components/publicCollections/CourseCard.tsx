"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  GraduationCap,
  TrendingUp,
  Building2,
  Users,
  IndianRupee,
  Award,
  BookOpen,
  FileText,
  Briefcase,
  Star,
  Calendar,
  CheckCircle2,
} from "lucide-react";

// This interface matches the actual API response
interface CourseData {
  _k?: string;
  type?: string;
  id?: string;
  slug?: string;
  pSlug?: string;
  cSlug?: string;
  name?: string;
  programme?: string;
  institute?: string;
  logo?: string;
  city?: string;
  state?: string;
  avgPackage?: number | null;
  avgPackageF?: string | null;
  duration?: string;
  level?: string;
  fee?: number | null;
  feeF?: string | null;
  tuitionFee?: number | null;
  educationType?: string;
  totalSeats?: number | null;
  eligibilityExams?: string[];
  url?: string;
  programmeDetails?: {
    name?: string;
    slug?: string;
    courseCount?: number;
    placementRating?: number;
    eligibilityExams?: string[];
  };
}

interface CourseCardProps {
  course: CourseData;
  variant?: "default" | "compact" | "detailed";
}

export function CourseCard({ course, variant = "default" }: CourseCardProps) {
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

  // Generate course URL
  const getCourseUrl = () => {
    if (course.url) return course.url;
    if (course.slug && course.cSlug) {
      return `/recommendation-collections/${course.slug}?programme=${course.pSlug}&course=${course.cSlug}`;
    }
    return "#";
  };

  // Generate institute URL
  const getInstituteUrl = () => {
    if (course.slug) return `/recommendation-collections/${course.slug}`;
    return "#";
  };

  // Get level badge color
  const getLevelColor = (level?: string) => {
    if (!level) return "bg-gray-100 text-gray-700 border-gray-200";
    const l = level.toLowerCase();
    if (l === "ug" || l.includes("undergraduate"))
      return "bg-blue-50 text-blue-700 border-blue-200";
    if (l === "pg" || l.includes("postgraduate"))
      return "bg-purple-50 text-purple-700 border-purple-200";
    if (l.includes("doctorate") || l === "phd")
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (l.includes("diploma") || l.includes("certificate"))
      return "bg-teal-50 text-teal-700 border-teal-200";
    if (l.includes("10th"))
      return "bg-green-50 text-green-700 border-green-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  // Compact variant - for list view
  if (variant === "compact") {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 shadow-sm hover:scale-[1.005] h-full bg-gradient-to-br from-white via-green-50/10 to-emerald-50/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Institute Logo */}
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-md group-hover:border-green-300 group-hover:shadow-lg transition-all bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              {isValid(course.logo) ? (
                <img
                  src={course.logo!}
                  alt={course.institute || "Institute"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <span
                className={`text-xl font-bold text-white ${isValid(course.logo) ? "hidden" : ""}`}
              >
                {course.institute?.charAt(0)?.toUpperCase() || "C"}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Course Title */}
              <Link
                href={getCourseUrl()}
                className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors line-clamp-2 group-hover:text-green-600"
              >
                {course.name}
              </Link>

              {/* Institute Name */}
              {isValid(course.institute) && (
                <Link
                  href={getInstituteUrl()}
                  className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="line-clamp-1">{course.institute}</span>
                </Link>
              )}

              {/* Location */}
              {(isValid(course.city) || isValid(course.state)) && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span>
                    {[course.city, course.state].filter(isValid).join(", ")}
                  </span>
                </div>
              )}

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {isValid(course.level) && (
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold ${getLevelColor(course.level)}`}
                  >
                    {course.level}
                  </Badge>
                )}
                {isValid(course.duration) && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {course.duration}
                  </Badge>
                )}
                {isValid(course.educationType) && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200"
                  >
                    {course.educationType}
                  </Badge>
                )}
                {isValid(course.programme) && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {course.programme}
                  </Badge>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {isValid(course.totalSeats) && course.totalSeats! > 0 && (
                  <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-200">
                    <Users className="h-3.5 w-3.5 text-orange-600" />
                    <span className="text-xs font-semibold text-orange-700">
                      {course.totalSeats} Seats
                    </span>
                  </div>
                )}
                {isValid(course.programmeDetails?.courseCount) &&
                  course.programmeDetails!.courseCount! > 0 && (
                    <div className="flex items-center gap-1.5 bg-cyan-50 px-2.5 py-1.5 rounded-lg border border-cyan-200">
                      <BookOpen className="h-3.5 w-3.5 text-cyan-600" />
                      <span className="text-xs font-semibold text-cyan-700">
                        {course.programmeDetails!.courseCount} Related
                      </span>
                    </div>
                  )}
                {isValid(course.programmeDetails?.placementRating) &&
                  course.programmeDetails!.placementRating! > 0 && (
                    <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1.5 rounded-lg border border-yellow-200">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-semibold text-yellow-700">
                        {course.programmeDetails!.placementRating}/5
                      </span>
                    </div>
                  )}
              </div>

              {/* Eligibility Exams */}
              {isValid(course.eligibilityExams) &&
                course.eligibilityExams!.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {course.eligibilityExams!.slice(0, 4).map((exam, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {exam}
                        </Badge>
                      ))}
                      {course.eligibilityExams!.length > 4 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-gray-100 text-gray-600 border-gray-200"
                        >
                          +{course.eligibilityExams!.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Right Section - Fee & CTA */}
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              {/* Fee Display */}
              {(isValid(course.fee) || isValid(course.feeF)) && (
                <div className="text-right bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200 shadow-sm">
                  <div className="text-xs text-green-600 font-semibold uppercase tracking-wide">
                    Total Fee
                  </div>
                  <div className="text-lg font-bold text-green-700 mt-0.5">
                    {course.feeF || `₹${nf.format(course.fee!)}`}
                  </div>
                  {isValid(course.tuitionFee) &&
                    course.tuitionFee !== course.fee && (
                      <div className="text-xs text-green-600 mt-1">
                        Tuition: ₹{nf.format(course.tuitionFee!)}
                      </div>
                    )}
                </div>
              )}

              {/* Average Package */}
              {(isValid(course.avgPackage) || isValid(course.avgPackageF)) && (
                <div className="text-right bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-600 font-semibold">
                    Avg Package
                  </div>
                  <div className="text-sm font-bold text-blue-700">
                    {course.avgPackageF || `₹${nf.format(course.avgPackage!)}`}
                  </div>
                </div>
              )}

              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 whitespace-nowrap h-9 text-sm px-6 shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <Link href={getCourseUrl()}>View Details</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant - for expanded view
  if (variant === "detailed") {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 shadow-md bg-gradient-to-br from-white via-green-50/10 to-emerald-50/20">
        <CardContent className="p-6">
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-4">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-lg group-hover:border-green-300 transition-all bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              {isValid(course.logo) ? (
                <img
                  src={course.logo!}
                  alt={course.institute || "Institute"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {course.institute?.charAt(0)?.toUpperCase() || "C"}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={getCourseUrl()}
                className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors line-clamp-2 group-hover:text-green-600"
              >
                {course.name}
              </Link>

              {isValid(course.institute) && (
                <Link
                  href={getInstituteUrl()}
                  className="flex items-center gap-1.5 mt-2 text-base text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  <Building2 className="h-4 w-4 text-green-600" />
                  {course.institute}
                </Link>
              )}

              {(isValid(course.city) || isValid(course.state)) && (
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {[course.city, course.state].filter(isValid).join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex flex-col gap-2">
              {(isValid(course.fee) || isValid(course.feeF)) && (
                <div className="text-right bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200 shadow-md">
                  <div className="text-xs text-green-600 font-semibold uppercase">
                    Total Fee
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    {course.feeF || `₹${nf.format(course.fee!)}`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {isValid(course.duration) && (
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">
                    Duration
                  </span>
                </div>
                <div className="text-base font-bold text-blue-700">
                  {course.duration}
                </div>
              </div>
            )}

            {isValid(course.level) && (
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">Level</span>
                </div>
                <div className="text-base font-bold text-purple-700">
                  {course.level}
                </div>
              </div>
            )}

            {isValid(course.totalSeats) && course.totalSeats! > 0 && (
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">Seats</span>
                </div>
                <div className="text-base font-bold text-orange-700">
                  {course.totalSeats}
                </div>
              </div>
            )}

            {isValid(course.educationType) && (
              <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">Type</span>
                </div>
                <div className="text-base font-bold text-indigo-700">
                  {course.educationType}
                </div>
              </div>
            )}
          </div>

          {/* Programme Info */}
          {isValid(course.programme) && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-purple-700">
                    {course.programme}
                  </span>
                </div>
                {isValid(course.programmeDetails?.courseCount) &&
                  course.programmeDetails!.courseCount! > 0 && (
                    <Badge className="bg-purple-600 text-white">
                      {course.programmeDetails!.courseCount} Courses in
                      Programme
                    </Badge>
                  )}
              </div>
            </div>
          )}

          {/* Eligibility Exams */}
          {isValid(course.eligibilityExams) &&
            course.eligibilityExams!.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Eligibility Exams
                </h4>
                <div className="flex flex-wrap gap-2">
                  {course.eligibilityExams!.map((exam, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      {exam}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Placement Stats */}
          {(isValid(course.avgPackage) || isValid(course.avgPackageF)) && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200">
              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Placement Statistics
              </h4>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-gray-600">Average Package</div>
                  <div className="text-xl font-bold text-blue-700">
                    {course.avgPackageF || `₹${nf.format(course.avgPackage!)}`}
                  </div>
                </div>
                {isValid(course.programmeDetails?.placementRating) &&
                  course.programmeDetails!.placementRating! > 0 && (
                    <div>
                      <div className="text-xs text-gray-600">
                        Placement Rating
                      </div>
                      <div className="text-xl font-bold text-yellow-600 flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                        {course.programmeDetails!.placementRating}/5
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-11 text-base shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <Link href={getCourseUrl()}>View Course Details</Link>
            </Button>
            {isValid(course.institute) && (
              <Button
                asChild
                variant="outline"
                className="h-11 px-6 border-green-200 text-green-700 hover:bg-green-50"
              >
                <Link href={getInstituteUrl()}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Institute
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant - Grid card
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 shadow-lg hover:scale-[1.02] h-full flex flex-col bg-gradient-to-br from-white via-green-50/20 to-emerald-50/30">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-md group-hover:border-green-300 group-hover:shadow-lg transition-all bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            {isValid(course.logo) ? (
              <img
                src={course.logo!}
                alt={course.institute || "Institute"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-white">
                {course.institute?.charAt(0)?.toUpperCase() || "C"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={getCourseUrl()}
              className="text-base font-bold text-gray-900 hover:text-green-600 transition-colors line-clamp-2 group-hover:text-green-600"
            >
              {course.name}
            </Link>
            {isValid(course.institute) && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                {course.institute}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        {(isValid(course.city) || isValid(course.state)) && (
          <div className="flex items-center gap-1.5 mb-3 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            <span>
              {[course.city, course.state].filter(isValid).join(", ")}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {isValid(course.level) && (
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${getLevelColor(course.level)}`}
            >
              {course.level}
            </Badge>
          )}
          {isValid(course.duration) && (
            <Badge
              variant="outline"
              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
            >
              <Clock className="h-3 w-3 mr-1" />
              {course.duration}
            </Badge>
          )}
          {isValid(course.educationType) && (
            <Badge
              variant="outline"
              className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200"
            >
              {course.educationType}
            </Badge>
          )}
        </div>

        {/* Programme Badge */}
        {isValid(course.programme) && (
          <div className="mb-3">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
              {course.programme}
            </Badge>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {isValid(course.totalSeats) && course.totalSeats! > 0 && (
            <div className="bg-orange-50 rounded-lg p-2 border border-orange-100">
              <div className="flex items-center gap-1 text-orange-600 mb-0.5">
                <Users className="h-3 w-3" />
                <span className="text-xs font-medium">Seats</span>
              </div>
              <div className="text-sm font-bold text-orange-700">
                {course.totalSeats}
              </div>
            </div>
          )}
          {isValid(course.programmeDetails?.placementRating) &&
            course.programmeDetails!.placementRating! > 0 && (
              <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-100">
                <div className="flex items-center gap-1 text-yellow-600 mb-0.5">
                  <Star className="h-3 w-3 fill-yellow-500" />
                  <span className="text-xs font-medium">Rating</span>
                </div>
                <div className="text-sm font-bold text-yellow-700">
                  {course.programmeDetails!.placementRating}/5
                </div>
              </div>
            )}
        </div>

        {/* Fee Display */}
        {(isValid(course.fee) || isValid(course.feeF)) && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-green-600 font-medium">
                  Total Fee
                </div>
                <div className="text-lg font-bold text-green-700">
                  {course.feeF || `₹${nf.format(course.fee!)}`}
                </div>
              </div>
              {(isValid(course.avgPackage) || isValid(course.avgPackageF)) && (
                <div className="text-right">
                  <div className="text-xs text-blue-600 font-medium">
                    Avg Package
                  </div>
                  <div className="text-sm font-bold text-blue-700">
                    {course.avgPackageF || `₹${nf.format(course.avgPackage!)}`}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Eligibility Exams */}
        {isValid(course.eligibilityExams) &&
          course.eligibilityExams!.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-600 mb-1.5">
                Eligibility:
              </p>
              <div className="flex flex-wrap gap-1">
                {course.eligibilityExams!.slice(0, 3).map((exam, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    {exam}
                  </Badge>
                ))}
                {course.eligibilityExams!.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-gray-100 text-gray-600"
                  >
                    +{course.eligibilityExams!.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <Button
            asChild
            size="sm"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-9 text-sm shadow-md hover:shadow-lg transition-all font-semibold"
          >
            <Link href={getCourseUrl()}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
