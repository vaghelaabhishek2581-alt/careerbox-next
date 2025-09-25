import React from "react";
import { Building2, MapPin, MoreVertical, Edit2, Trash2, Clock, Home, Wifi, Users, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { IWorkExperience, IWorkPosition } from "@/lib/redux/slices/profileSlice";
import { calculateDuration, calculateTotalExperience, formatDateForDisplay } from "./utils";

interface WorkExperienceDisplayProps {
  experience: IWorkExperience;
  onEdit: (experience: IWorkExperience) => void;
  onEditPosition: (experience: IWorkExperience, position: IWorkPosition) => void;
  onDeleteExperience: (experienceId: string, experienceName: string) => void;
  onDeletePosition: (experienceId: string, positionId: string, experienceName: string, positionTitle: string) => void;
  onDeleteLastPosition?: (experienceId: string, positionId: string, experienceName: string, positionTitle: string) => void;
}

// Location type icons
const locationTypeIcons = {
  ONSITE: Home,
  REMOTE: Wifi,
  HYBRID: Users,
} as const;

// Employment type icons  
const employmentTypeIcons = {
  FULL_TIME: Clock,
  PART_TIME: Clock,
  CONTRACT: Clock,
  INTERNSHIP: Clock,
  FREELANCE: Clock,
} as const;

// Employment type display names
const employmentTypeLabels = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
} as const;

// Location type display names
const locationTypeLabels = {
  ONSITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
} as const;

export const WorkExperienceDisplay: React.FC<WorkExperienceDisplayProps> = ({ 
  experience, 
  onEdit, 
  onEditPosition,
  onDeleteExperience, 
  onDeletePosition,
  onDeleteLastPosition
}) => {
  const totalDuration = calculateTotalExperience(experience.positions);
  
  // Sort positions by start date (newest first)
  const sortedPositions = [...experience.positions].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateB.getTime() - dateA.getTime();
  });

  // Check if any position is current
  const hasCurrentPosition = sortedPositions.some(position => position.isCurrent);

  return (
    <div className="relative group">
      {/* Timeline connector line for multiple entries */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 -z-10"></div>
      
      <div className="flex items-start gap-4">
        {/* Enhanced company icon with current indicator */}
        <div className={cn(
          "relative h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
          hasCurrentPosition 
            ? "bg-green-100 ring-2 ring-green-500 ring-offset-2" 
            : "bg-blue-100"
        )}>
          <Building2 className={cn(
            "h-6 w-6",
            hasCurrentPosition ? "text-green-600" : "text-blue-600"
          )} />
          
          {/* Current indicator dot */}
          {hasCurrentPosition && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {experience.company}
              </h3>
              {experience.location && (
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {experience.location}
                </p>
              )}
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Total: {totalDuration}
              </p>
              <div className="mt-4 space-y-4">
                {sortedPositions.map((position: IWorkPosition) => {
                  const LocationIcon = locationTypeIcons[position.locationType || 'ONSITE'];
                  const EmploymentIcon = employmentTypeIcons[position.employmentType];
                  const duration = calculateDuration(
                    new Date(position.startDate),
                    position.endDate ? new Date(position.endDate) : null,
                    position.isCurrent
                  );

                  return (
                    <div key={position.id} className={cn(
                      "border-l-2 pl-4 group/position relative",
                      position.isCurrent ? "border-green-500" : "border-gray-200"
                    )}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{position.title}</h4>
                            {position.isCurrent && (
                              <Badge 
                                variant="default"
                                className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-0.5"
                              >
                                <Briefcase className="h-3 w-3 mr-1" />
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <EmploymentIcon className="h-3 w-3 mr-1" />
                              {employmentTypeLabels[position.employmentType]}
                            </span>
                            <span className="flex items-center">
                              <LocationIcon className="h-3 w-3 mr-1" />
                              {locationTypeLabels[position.locationType || 'ONSITE']}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDateForDisplay(position.startDate)}{" "}
                            -{" "}
                            {position.isCurrent
                              ? "Present"
                              : position.endDate
                                ? formatDateForDisplay(position.endDate)
                                : "End Date"}
                            {" • "}
                            {duration}
                          </p>
                          {position.description && (
                            <div className="text-sm text-gray-700 mt-2">
                              {(() => {
                                const lines = position.description.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
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
                                  <p className="whitespace-pre-line">{position.description}</p>
                                );
                              })()}
                            </div>
                          )}
                          {position.skills && position.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {position.skills.map((skill: string, skillIndex: number) => (
                                <Badge
                                  key={skillIndex}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover/position:opacity-100 transition-opacity h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditPosition(experience, position)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Position
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                if (experience.positions.length === 1) {
                                  // If this is the last position, trigger special delete handler
                                  if (onDeleteLastPosition) {
                                    onDeleteLastPosition(
                                      experience.id!,
                                      position.id,
                                      experience.company,
                                      position.title
                                    );
                                  }
                                } else {
                                  // Regular position delete
                                  onDeletePosition(
                                    experience.id!,
                                    position.id,
                                    experience.company,
                                    position.title
                                  );
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {experience.positions.length === 1 ? 'Delete Experience' : 'Delete Position'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
                <DropdownMenuItem onClick={() => onEdit(experience)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Experience
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDeleteExperience(experience.id!, experience.company)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Experience
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
