"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
} from "lucide-react";
interface ProgramCardProps {
  program: any;
  variant?: "default" | "compact";
}

export function ProgramCard({
  program,
  variant = "default",
}: ProgramCardProps) {
  const nf = new Intl.NumberFormat("en-IN");

  const instituteName =
    typeof program.institute === "string"
      ? program.institute
      : program.institute?.name;
  const instituteSlug =
    typeof program.institute === "string"
      ? program.slug
      : program.institute?.slug;
  const instituteLogo =
    typeof program.institute === "string"
      ? program.logo
      : program.institute?.logo || program.logo;
  const instituteCity =
    typeof program.institute === "string"
      ? program.city
      : program.institute?.location?.city || program.city;
  const instituteState =
    typeof program.institute === "string"
      ? program.state
      : program.institute?.location?.state || program.state;

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 h-full">
        <CardContent className="p-5">
          <div className="flex gap-4">
            {/* Institute Logo */}
            {instituteLogo && (
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                <img
                  src={instituteLogo}
                  alt={instituteName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Program Name */}
              <Link
                href={`/recommendation-collections/${instituteSlug || program.id}`}
                className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors line-clamp-2"
              >
                {program.name}
              </Link>

              {/* Institute Name */}
              {instituteName && (
                <Link
                  href={`/recommendation-collections/${instituteSlug || program.id}`}
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-1 mt-1"
                >
                  <Building2 className="h-3 w-3" />
                  {instituteName}
                </Link>
              )}

              {/* Location */}
              {(instituteCity || instituteState) && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {instituteCity}, {instituteState}
                  </span>
                </div>
              )}

              {/* Stats Row - Only show if there are stats to display */}
              {(program.courseCount > 0 ||
                (program.placementRating && program.placementRating > 0)) && (
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {/* Courses - Only show if > 0 */}
                  {program.courseCount > 0 && (
                    <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded">
                      <BookOpen className="h-3 w-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700">
                        {program.courseCount} Courses
                      </span>
                    </div>
                  )}

                  {/* Rating - Only show if > 0 */}
                  {program.placementRating && program.placementRating > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium text-yellow-700">
                        {program.placementRating}/5
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Eligibility Exams */}
              {program.eligibilityExams &&
                program.eligibilityExams.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Eligibility Exams:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {program.eligibilityExams
                        .slice(0, 5)
                        .map((exam, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {exam}
                          </Badge>
                        ))}
                      {program.eligibilityExams.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{program.eligibilityExams.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}

              {/* Sample Courses - Show first 2 */}
              {program.courses && program.courses.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    Sample Courses:
                  </p>
                  {program.courses
                    .slice(0, 2)
                    .map((course: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-2 text-xs bg-gray-50 rounded p-2"
                      >
                        <span className="flex-1 text-gray-700 line-clamp-1">
                          {course.degree || course.name}
                        </span>
                        {course.fees?.totalFee && course.fees.totalFee > 0 && (
                          <span className="font-semibold text-green-600 whitespace-nowrap">
                            ₹{nf.format(course.fees.totalFee)}
                          </span>
                        )}
                      </div>
                    ))}
                  {program.courses.length > 2 && (
                    <p className="text-xs text-purple-600 font-medium">
                      +{program.courses.length - 2} more courses
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="flex flex-col justify-between">
              <Button
                size="sm"
                asChild
                className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
              >
                <Link
                  href={`/recommendation-collections/${program.institute?.slug || program.id}`}
                >
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {program.institute?.logo && (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
              <img
                src={program.institute.logo}
                alt={program.institute.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <Link
              href={`/recommendation-collections/${program.institute?.slug || program.id}`}
              className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors group-hover:text-purple-600"
            >
              {program.name}
            </Link>
            {program.institute && (
              <Link
                href={`/recommendation-collections/${program.institute.slug}`}
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-1 mt-1"
              >
                <Building2 className="h-3 w-3" />
                {program.institute.name}
              </Link>
            )}
            {program.institute?.location && (
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>
                  {program.institute.location.city},{" "}
                  {program.institute.location.state}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Program Stats - Only show if values exist */}
        {(program.courseCount > 0 ||
          (program.placementRating && program.placementRating > 0)) && (
          <div className="grid grid-cols-2 gap-4">
            {program.courseCount > 0 && (
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs font-medium">Courses</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {program.courseCount}
                </div>
              </div>
            )}

            {program.placementRating && program.placementRating > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-600 mb-1">
                  <Award className="h-4 w-4" />
                  <span className="text-xs font-medium">Rating</span>
                </div>
                <div className="text-2xl font-bold text-yellow-700">
                  {program.placementRating}/5
                </div>
              </div>
            )}
          </div>
        )}

        {/* Eligibility Exams */}
        {program.eligibilityExams && program.eligibilityExams.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Eligibility Exams
            </h4>
            <div className="flex flex-wrap gap-2">
              {program.eligibilityExams.map((exam, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {exam}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sample Courses */}
        {program.courses && program.courses.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Sample Courses
            </h4>
            <div className="space-y-2">
              {program.courses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between text-sm bg-gray-50 rounded p-2"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-700 truncate">
                      {course.degree || course.name}
                    </span>
                  </div>
                  {course.fees?.totalFee && course.fees.totalFee > 0 && (
                    <span className="text-green-600 font-medium whitespace-nowrap ml-2">
                      ₹{nf.format(course.fees.totalFee)}
                    </span>
                  )}
                </div>
              ))}
              {program.courses.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{program.courses.length - 3} more courses
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          asChild
          size="sm"
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Link
            href={`/recommendation-collections/${program.institute?.slug || program.id}`}
          >
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
