import React from "react";
import { Edit2, Plus, GraduationCap, MapPin, Calendar, Award, Clock, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IProfile, IEducation } from "@/lib/redux/slices/profileSlice";
import { calculateDuration, formatDateForDisplay, sortEducationEntries } from "@/components/profile/education/utils";
import { educationLevelLabels } from "@/components/profile/education/types";

interface EducationSectionProps {
  profile: IProfile;
  onAdd: () => void;
  onEdit: (education: IEducation) => void;
  onDelete?: (education: IEducation) => void;
}

// Education level icons
const educationLevelIcons = {
  "High School": GraduationCap,
  "Diploma": GraduationCap,
  "Associate Degree": GraduationCap,
  "Bachelor's Degree": GraduationCap,
  "Master's Degree": GraduationCap,
  "Doctoral Degree": Award,
  "Professional Degree": Award,
  "Certificate": Award,
  "Bootcamp": GraduationCap,
  "Online Course": GraduationCap,
  "Other": GraduationCap,
} as const;

export const EducationSection: React.FC<EducationSectionProps> = ({ 
  profile, 
  onAdd, 
  onEdit,
  onDelete 
}) => {
  // Sort education entries to show current first, then by date
  const sortedEducation = profile?.education ? sortEducationEntries(profile.education) : [];
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-gray-600" />
            Education
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {sortedEducation.length > 0 ? (
            sortedEducation.map((education: IEducation) => {
              const LevelIcon = educationLevelIcons[education.degree as keyof typeof educationLevelIcons] || GraduationCap;
              const duration = education.startDate ? calculateDuration(
                education.startDate,
                education.endDate,
                education.isCurrent
              ) : "Duration not specified";

              return (
                <div key={education.id} className="relative group bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Icon with current indicator */}
                    <div className={`relative h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      education.isCurrent 
                        ? 'bg-green-100 ring-2 ring-green-200' 
                        : 'bg-blue-100'
                    }`}>
                      <LevelIcon className={`h-6 w-6 ${
                        education.isCurrent ? 'text-green-600' : 'text-blue-600'
                      }`} />
                      {education.isCurrent && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          {/* Institution Name */}
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {education.institution}
                          </h3>
                          
                          {/* Degree and Field of Study */}
                          <div className="space-y-1">
                            <p className="font-medium text-gray-800">
                              {education.degree}
                              {education.fieldOfStudy && (
                                <span className="text-gray-600"> in {education.fieldOfStudy}</span>
                              )}
                            </p>
                          </div>

                          {/* Location */}
                          {education.location && (
                            <p className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {education.location}
                            </p>
                          )}

                          {/* Duration */}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {education.startDate ? formatDateForDisplay(education.startDate) : "Start Date"}
                              {" - "}
                              {education.isCurrent
                                ? "Present"
                                : education.endDate
                                ? formatDateForDisplay(education.endDate)
                                : "End Date"}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {duration}
                            </span>
                          </div>

                          {/* Grade */}
                          {education.grade && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                {education.grade}
                              </Badge>
                            </div>
                          )}

                          {/* Description */}
                          {education.description && (
                            <div className="mt-3">
                              <div className="text-sm text-gray-700">
                                {(() => {
                                  const lines = education.description.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                                  const bulletLines = lines.filter(l => /^[-•]/.test(l));
                                  
                                  if (bulletLines.length >= Math.max(3, lines.length / 2)) {
                                    return (
                                      <ul className="list-disc pl-5 space-y-1">
                                        {lines.map((line, index) => (
                                          <li key={index}>{line.replace(/^[-•]\s?/, '')}</li>
                                        ))}
                                      </ul>
                                    );
                                  }
                                  
                                  return (
                                    <p className="whitespace-pre-line">{education.description}</p>
                                  );
                                })()}
                              </div>
                            </div>
                          )}

                          {/* Status and Level Badges */}
                          <div className="flex items-center gap-2 mt-3">
                            <Badge 
                              variant={education.isCurrent ? "default" : "secondary"}
                              className={`text-xs ${
                                education.isCurrent 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : ''
                              }`}
                            >
                              {education.isCurrent ? (
                                <>
                                  <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                                  Currently Studying
                                </>
                              ) : (
                                'Completed'
                              )}
                            </Badge>
                            
                            {/* Education Level Badge */}
                            <Badge variant="outline" className="text-xs">
                              {educationLevelLabels[education.degree] || education.degree}
                            </Badge>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(education)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(education)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="text-center">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Education Added</p>
                <p className="text-sm">Add your educational background to showcase your qualifications</p>
                <Button
                  variant="outline"
                  onClick={onAdd}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
