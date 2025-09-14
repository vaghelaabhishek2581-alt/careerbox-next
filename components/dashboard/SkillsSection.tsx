import React from "react";
import { Edit2, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IProfile, ISkill } from "@/lib/redux/slices/profileSlice";

interface SkillsSectionProps {
  profile: IProfile;
  onEdit: () => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ profile, onEdit }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Target className="h-5 w-5 mr-2 text-gray-600" />
            Skills
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {profile?.skills && profile.skills.length > 0 ? (
            profile.skills.map((skill: ISkill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium">{skill.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {skill.level}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No skills added yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
