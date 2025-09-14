import React from "react";
import { Edit2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IProfile } from "@/lib/redux/slices/profileSlice";

interface AboutSectionProps {
  profile: IProfile;
  onEdit: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile, onEdit }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2 text-gray-600" />
            About
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {profile?.personalDetails?.aboutMe &&
            profile?.personalDetails?.aboutMe !==
            "Tell us a bit about yourself"
            ? profile?.personalDetails?.aboutMe
            : "No description available. Click edit to add about section."}
        </p>
      </CardContent>
    </Card>
  );
};
