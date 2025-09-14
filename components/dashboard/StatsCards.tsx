import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Target, BarChart2, Users } from "lucide-react";
import type { IProfile } from "@/lib/redux/slices/profileSlice";

interface StatsCardsProps {
  profile: IProfile;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ profile }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Completed Courses
              </p>
              <h3 className="text-2xl font-bold">
                {profile?.stats?.completedCourses || 0}
              </h3>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Skills Assessed
              </p>
              <h3 className="text-2xl font-bold">
                {profile?.stats?.skillsAssessed || 0}
              </h3>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Career Goals
              </p>
              <h3 className="text-2xl font-bold">
                {profile?.stats?.careerGoals || 0}
              </h3>
            </div>
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Network
              </p>
              <h3 className="text-2xl font-bold">
                {profile?.stats?.networkSize || 0}
              </h3>
            </div>
            <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
