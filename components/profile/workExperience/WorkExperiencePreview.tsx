import React from "react";
import { Building2, MapPin, MoreVertical, Edit2, Trash2, Clock, Home, Wifi, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkExperienceFormData, employmentTypeLabels, locationTypeLabels } from "./types";
import { calculateDuration, calculateTotalExperience, formatDateForDisplay } from "./utils";

interface WorkExperiencePreviewProps {
  data: WorkExperienceFormData;
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

export const WorkExperiencePreview: React.FC<WorkExperiencePreviewProps> = ({ data }) => {
  if (!data.company) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Fill out the form to see a preview
      </div>
    );
  }

  const totalDuration = calculateTotalExperience(data.positions);

  return (
    <div className="p-6 bg-gray-50 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Preview</h3>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {data.company}
                </h3>
                {data.location && (
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {data.location}
                  </p>
                )}
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Total: {totalDuration}
                </p>
                <div className="mt-4 space-y-4">
                  {data.positions.map((position, index) => {
                    const LocationIcon = locationTypeIcons[position.locationType || 'ONSITE'];
                    const EmploymentIcon = employmentTypeIcons[position.employmentType];
                    const duration = calculateDuration(
                      position.startDate,
                      position.endDate,
                      position.isCurrent
                    );

                    return (
                      <div key={position.id || index} className="border-l-2 border-gray-200 pl-4 group/position relative">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{position.title || "Untitled Position"}</h4>
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
                          {data.positions.length > 1 && (
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
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Position
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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
                  <DropdownMenuItem>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Experience
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Experience
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
