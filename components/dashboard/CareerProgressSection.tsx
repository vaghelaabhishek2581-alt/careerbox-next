import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { IProfile } from "@/lib/redux/slices/profileSlice";

interface CareerProgressSectionProps {
  profile: IProfile;
}

export const CareerProgressSection: React.FC<CareerProgressSectionProps> = ({ profile }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Career Progress</h2>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                Overall Progress
              </span>
              <span className="text-sm text-gray-500">
                {profile?.progress?.overall || 0}%
              </span>
            </div>
            <Progress
              value={profile?.progress?.overall || 0}
              className="h-2"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                Skills Development
              </span>
              <span className="text-sm text-gray-500">
                {profile?.progress?.skills || 0}%
              </span>
            </div>
            <Progress value={profile?.progress?.skills || 0} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                Goal Achievement
              </span>
              <span className="text-sm text-gray-500">
                {profile?.progress?.goals || 0}%
              </span>
            </div>
            <Progress value={profile?.progress?.goals || 0} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
