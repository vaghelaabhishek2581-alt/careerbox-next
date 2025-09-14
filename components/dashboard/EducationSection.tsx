import React from "react";
import { Edit2, Plus, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IProfile, IEducation } from "@/lib/redux/slices/profileSlice";

interface EducationSectionProps {
  profile: IProfile;
  onAdd: () => void;
  onEdit: (education: IEducation) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ 
  profile, 
  onAdd, 
  onEdit 
}) => {
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

        <div className="space-y-6">
          {profile?.education && profile.education.length > 0 ? (
            profile.education.map((education: IEducation) => (
              <div key={education.id} className="relative group">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {education.degree}
                        </h3>
                        <p className="text-gray-600">
                          {education.institution}
                        </p>
                        <p className="text-sm text-gray-500">
                          {education.startDate
                            ? new Date(
                              education.startDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                            })
                            : ""}{" "}
                          -{" "}
                          {education.isCurrent
                            ? "Present"
                            : education.endDate
                              ? new Date(
                                education.endDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                              })
                              : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEdit(education)}
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
              No education added yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
