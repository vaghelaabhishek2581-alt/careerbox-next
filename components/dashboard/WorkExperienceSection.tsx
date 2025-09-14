import React from "react";
import { Edit2, Plus, MapPin, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IProfile, IWorkExperience, IWorkPosition } from "@/lib/redux/slices/profileSlice";

interface WorkExperienceSectionProps {
  profile: IProfile;
  onAdd: () => void;
  onEdit: (experience: IWorkExperience) => void;
}

export const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({ 
  profile, 
  onAdd, 
  onEdit 
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-gray-600" />
            Work Experience
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {profile?.workExperiences && profile.workExperiences.length > 0 ? (
            profile.workExperiences.map((experience: IWorkExperience) => (
              <div key={experience.id} className="relative group">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-blue-600" />
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
                        <div className="mt-4 space-y-4">
                          {experience.positions.map((position: IWorkPosition) => (
                            <div key={position.id} className="border-l-2 border-gray-200 pl-4">
                              <h4 className="font-medium text-gray-900">{position.title}</h4>
                              <p className="text-sm text-gray-500">
                                {position.employmentType} ·{" "}
                                {new Date(position.startDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                })}{" "}
                                -{" "}
                                {position.isCurrent
                                  ? "Present"
                                  : position.endDate
                                    ? new Date(position.endDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      year: "numeric",
                                    })
                                    : ""}
                              </p>
                              {position.description && (
                                <p className="text-sm text-gray-700 mt-2">
                                  {position.description}
                                </p>
                              )}
                              {position.skills && position.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {position.skills.map((skill: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEdit(experience)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No work experience added yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
