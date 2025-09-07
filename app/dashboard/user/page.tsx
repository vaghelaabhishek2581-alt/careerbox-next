"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  Target,
  BookOpen,
  Users,
  BarChart2,
  MessageSquare,
  MapPin,
  Building2,
  Globe,
  Edit2,
  Plus,
  Briefcase,
  GraduationCap,
  Languages,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Activity {
  id: string;
  type: "course" | "goal" | "connection";
  title: string;
  timestamp: string;
}

interface ProfileData {
  bio: string;
  location: string;
  company: string;
  website: string;
  skills: string[];
  languages: Array<{ name: string; level: string }>;
  interests: string[];
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
}

export default function UserDashboard() {
  const { user } = useAuth({ skipOnboarding: true });
  const [stats, setStats] = useState({
    completedCourses: 0,
    skillsAssessed: 0,
    careerGoals: 0,
    networkSize: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState({
    overall: 0,
    skills: 0,
    goals: 0,
  });
  const [profile, setProfile] = useState<ProfileData>({
    bio: "",
    location: "",
    company: "",
    website: "",
    skills: [],
    languages: [],
    interests: [],
    socialLinks: {},
  });

  useEffect(() => {
    // Fetch user stats
    fetch("/api/user/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);

    // Fetch recent activities
    fetch("/api/user/activities")
      .then((res) => res.json())
      .then((data) => setActivities(data.activities || []))
      .catch(console.error);

    // Fetch progress
    fetch("/api/user/progress")
      .then((res) => res.json())
      .then((data) => setProgress(data))
      .catch(console.error);

    // Fetch profile data
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="absolute -bottom-16 left-8">
          <Avatar className="h-32 w-32 border-4 border-white">
            <AvatarImage src={user?.image || ""} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-4xl text-white">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Profile Info */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-gray-600 mt-1">
              {profile.bio || "No bio added yet"}
            </p>
            <div className="flex items-center gap-4 mt-3">
              {profile.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
              )}
              {profile.company && (
                <div className="flex items-center text-gray-600">
                  <Building2 className="h-4 w-4 mr-1" />
                  {profile.company}
                </div>
              )}
              {profile.website && (
                <div className="flex items-center text-gray-600">
                  <Globe className="h-4 w-4 mr-1" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600"
                  >
                    Website
                  </a>
                </div>
              )}
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Skills */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Skills</h2>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
                {!profile.skills?.length && (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </div>
            </Card>

            {/* Languages */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Languages</h2>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {profile.languages?.map((lang) => (
                  <div
                    key={lang.name}
                    className="flex items-center justify-between"
                  >
                    <span>{lang.name}</span>
                    <Badge>{lang.level}</Badge>
                  </div>
                ))}
                {!profile.languages?.length && (
                  <p className="text-gray-500 text-sm">
                    No languages added yet
                  </p>
                )}
              </div>
            </Card>

            {/* Interests */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Interests</h2>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests?.map((interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                ))}
                {!profile.interests?.length && (
                  <p className="text-gray-500 text-sm">
                    No interests added yet
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Completed Courses
                    </p>
                    <h3 className="text-2xl font-bold">
                      {stats.completedCourses}
                    </h3>
                  </div>
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Skills Assessed
                    </p>
                    <h3 className="text-2xl font-bold">
                      {stats.skillsAssessed}
                    </h3>
                  </div>
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Career Goals
                    </p>
                    <h3 className="text-2xl font-bold">{stats.careerGoals}</h3>
                  </div>
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <BarChart2 className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Network</p>
                    <h3 className="text-2xl font-bold">{stats.networkSize}</h3>
                  </div>
                  <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Career Progress */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Career Progress</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      Overall Progress
                    </span>
                    <span className="text-sm text-gray-500">
                      {progress.overall}%
                    </span>
                  </div>
                  <Progress value={progress.overall} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      Skills Development
                    </span>
                    <span className="text-sm text-gray-500">
                      {progress.skills}%
                    </span>
                  </div>
                  <Progress value={progress.skills} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      Goal Achievement
                    </span>
                    <span className="text-sm text-gray-500">
                      {progress.goals}%
                    </span>
                  </div>
                  <Progress value={progress.goals} className="h-2" />
                </div>
              </div>
            </Card>

            {/* Recent Activities */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div
                      className={`
                        h-2 w-2 mt-2 rounded-full
                        ${activity.type === "course" ? "bg-blue-500" : ""}
                        ${activity.type === "goal" ? "bg-green-500" : ""}
                        ${activity.type === "connection" ? "bg-purple-500" : ""}
                      `}
                    />
                    <div>
                      <p className="text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No recent activities
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
