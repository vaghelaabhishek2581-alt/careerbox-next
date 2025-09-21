import React from "react";
import { GraduationCap, MapPin, Calendar, Award, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SingleEducationFormData, educationLevelLabels } from "./types";
import { calculateDuration, formatDateForDisplay } from "./utils";

interface EducationPreviewProps {
  data: SingleEducationFormData;
}

// Education level icons
const educationLevelIcons = {
  "High School": GraduationCap,
  "Diploma": GraduationCap,
  "Associate Degree": GraduationCap,
  "Bachelor's Degree": GraduationCap,
  "Master's Degree": GraduationCap,
  "PhD": Award,
  "Professional Degree": Award,
  "Certificate": Award,
  "Bootcamp": GraduationCap,
  "Online Course": GraduationCap,
} as const;

export const EducationPreview: React.FC<EducationPreviewProps> = ({ data }) => {
  const LevelIcon = educationLevelIcons[data.degree as keyof typeof educationLevelIcons] || GraduationCap;
  
  const duration = data.startDate ? calculateDuration(
    data.startDate,
    data.endDate,
    data.isCurrent
  ) : "Duration not specified";

  const hasBasicInfo = data.degree || data.fieldOfStudy || data.institution;

  if (!hasBasicInfo) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Education Preview</p>
          <p className="text-sm">Fill in the form to see a preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Education Preview</h3>
        <p className="text-sm text-gray-500">This is how your education will appear</p>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <LevelIcon className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="space-y-2">
              {/* Institution Name */}
              <h4 className="font-semibold text-gray-900 text-lg">
                {data.institution || "Institution Name"}
              </h4>
              
              {/* Degree and Field of Study */}
              <div className="space-y-1">
                <p className="font-medium text-gray-800">
                  {data.degree || "Course Level/Degree"}
                  {data.fieldOfStudy && (
                    <span className="text-gray-600"> in {data.fieldOfStudy}</span>
                  )}
                </p>
              </div>

              {/* Location */}
              {data.location && (
                <p className="text-sm text-gray-500 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {data.location}
                </p>
              )}

              {/* Duration */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {data.startDate ? formatDateForDisplay(data.startDate.toISOString()) : "Start Date"}
                  {" - "}
                  {data.isCurrent
                    ? "Present"
                    : data.endDate
                    ? formatDateForDisplay(data.endDate.toISOString())
                    : "End Date"}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {duration}
                </span>
              </div>

              {/* Grade */}
              {data.grade && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    {data.grade}
                  </Badge>
                </div>
              )}

              {/* Description */}
              {data.description && (
                <div className="mt-3">
                  <div className="text-sm text-gray-700">
                    {(() => {
                      const lines = data.description.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
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
                        <p className="whitespace-pre-line">{data.description}</p>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center gap-2 mt-3">
                <Badge 
                  variant={data.isCurrent ? "default" : "secondary"}
                  className="text-xs"
                >
                  {data.isCurrent ? "Currently Studying" : "Completed"}
                </Badge>
                
                {/* Education Level Badge */}
                <Badge variant="outline" className="text-xs">
                  {educationLevelLabels[data.degree] || data.degree}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Preview Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Your education will be sorted by level and date</li>
          <li>• Add grades/GPA to highlight academic achievements</li>
          <li>• Use bullet points in description for better readability</li>
          <li>• Include relevant coursework, projects, or honors</li>
        </ul>
      </div>
    </div>
  );
};
