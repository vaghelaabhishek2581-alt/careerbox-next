import React from "react";
import { GraduationCap, MapPin, MoreVertical, Edit2, Trash2, Calendar, Award, Clock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { IEducation } from "@/lib/redux/slices/profileSlice";
import { calculateDuration, formatDateForDisplay } from "./utils";
import { educationLevelLabels } from "./types";

interface EducationDisplayProps {
  education: IEducation;
  onEdit: (education: IEducation) => void;
  onDelete: (educationId: string, institutionName: string) => void;
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

export const EducationDisplay: React.FC<EducationDisplayProps> = ({ 
  education, 
  onEdit, 
  onDelete 
}) => {
  const LevelIcon = educationLevelIcons[education.degree as keyof typeof educationLevelIcons] || GraduationCap;
  
  const duration = calculateDuration(
    new Date(education.startDate),
    education.endDate ? new Date(education.endDate) : null,
    education.isCurrent
  );

  return (
    <div className="relative group">
      {/* Timeline connector line for multiple entries */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 -z-10"></div>
      
      <div className="flex items-start gap-4">
        {/* Enhanced icon with current indicator */}
        <div className={cn(
          "relative h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
          education.isCurrent 
            ? "bg-green-100 ring-2 ring-green-500 ring-offset-2" 
            : "bg-blue-100"
        )}>
          <LevelIcon className={cn(
            "h-6 w-6",
            education.isCurrent ? "text-green-600" : "text-blue-600"
          )} />
          
          {/* Current indicator dot */}
          {education.isCurrent && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {education.institution}
              </h3>
              
              {/* Degree and Field of Study */}
              <div className="space-y-1 mt-1">
                <p className="font-medium text-gray-800">
                  {education.degree}
                  {education.fieldOfStudy && (
                    <span className="text-gray-600"> in {education.fieldOfStudy}</span>
                  )}
                </p>
              </div>

              {/* Location */}
              {education.location && (
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {education.location}
                </p>
              )}

              {/* Duration */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDateForDisplay(education.startDate)}
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
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    {education.grade}
                  </Badge>
                </div>
              )}

              {/* Description */}
              {education.description && (
                <div className="text-sm text-gray-700 mt-2">
                  {(() => {
                    const lines = education.description.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                    const bulletLines = lines.filter(l => /^[-•]/.test(l));
                    if (bulletLines.length >= Math.max(3, lines.length / 2)) {
                      return (
                        <ul className="list-disc pl-5 space-y-1">
                          {lines.map((l, i) => (
                            <li key={i}>{l.replace(/^[-•]\s?/, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p className="whitespace-pre-line">{education.description}</p>
                    );
                  })()}
                </div>
              )}

              {/* Enhanced Status and Level Badges */}
              <div className="flex items-center gap-2 mt-3">
                <Badge 
                  variant={education.isCurrent ? "default" : "secondary"}
                  className={cn(
                    "text-xs font-medium",
                    education.isCurrent 
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-sm" 
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  {education.isCurrent ? (
                    <>
                      <BookOpen className="h-3 w-3 mr-1" />
                      Currently Studying
                    </>
                  ) : (
                    <>
                      <Award className="h-3 w-3 mr-1" />
                      Completed
                    </>
                  )}
                </Badge>
                
                <Badge variant="outline" className="text-xs">
                  {educationLevelLabels[education.degree] || education.degree}
                </Badge>
              </div>
            </div>
            
            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(education)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Education
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDelete(education.id!, education.institution)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Education
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
