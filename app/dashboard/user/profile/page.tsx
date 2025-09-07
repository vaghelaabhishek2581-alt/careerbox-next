"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import type {
  WorkExperience,
  Education,
  Skill,
  Language,
} from "@/lib/types/profile";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Share2,
  Edit,
  MoreHorizontal,
  Plus,
  MapPin,
  Building,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export default function UserProfile() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const { profile, isLoading } = useAppSelector((state) => state.profile);

  useEffect(() => {
    if (session?.user?.id) {
      dispatch(fetchProfile(session.user.id));
    }
  }, [dispatch, session?.user?.id]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image & Profile Header */}
      <div className="relative">
        <div className="h-64 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          {profile.coverImageUrl && (
            <Image
              src={profile.coverImageUrl}
              alt="Cover"
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        <div className="container mx-auto px-4">
          <div className="relative -mt-24">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <Avatar className="w-40 h-40 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                  <AvatarFallback className="text-4xl">
                    {profile.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-2 right-2 rounded-full"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  {profile.isVerified && (
                    <Badge variant="secondary" className="bg-blue-100">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {profile.title && (
                  <p className="text-gray-600 mb-2">{profile.title}</p>
                )}

                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  {profile.company && (
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {profile.followers.toLocaleString()}
                    </span>
                    <span className="text-gray-600">Followers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {profile.following.toLocaleString()}
                    </span>
                    <span className="text-gray-600">Following</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Profile Sections
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">About</h2>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600">
                {profile.about ||
                  "No description available. Click edit to add about section."}
              </p>
            </Card>

            {/* Experience Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Experience</h2>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {profile.experience.map((exp: WorkExperience) => (
                <div key={exp.id} className="mb-6 last:mb-0">
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12">
                      {exp.companyLogo ? (
                        <AvatarImage
                          src={exp.companyLogo}
                          alt={exp.companyName}
                        />
                      ) : (
                        <AvatarFallback>{exp.companyName[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-gray-600">{exp.companyName}</p>
                      <p className="text-sm text-gray-500">
                        {exp.startDate} -{" "}
                        {exp.current ? "Present" : exp.endDate}
                      </p>
                      <p className="text-sm text-gray-500">{exp.location}</p>
                      <p className="mt-2 text-gray-600">{exp.description}</p>
                      {exp.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {exp.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Education Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Education</h2>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {profile.education.map((edu: Education) => (
                <div key={edu.id} className="mb-6 last:mb-0">
                  <h3 className="font-semibold">{edu.institution}</h3>
                  <p className="text-gray-600">
                    {edu.degree} • {edu.field}
                  </p>
                  <p className="text-sm text-gray-500">
                    {edu.startYear} - {edu.current ? "Present" : edu.endYear}
                  </p>
                  {edu.description && (
                    <p className="mt-2 text-gray-600">{edu.description}</p>
                  )}
                </div>
              ))}
            </Card>

            {/* Skills Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Skills</h2>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.skills.map((skill: Skill) => (
                  <div key={skill.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{skill.name}</h3>
                      <Badge variant="secondary">{skill.level}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {skill.endorsements} endorsements
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Languages Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Languages</h2>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.languages.map((lang: Language) => (
                  <div
                    key={lang.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">{lang.name}</span>
                    <Badge variant="secondary">{lang.proficiency}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion Card */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Complete your profile
              </h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Profile strength</span>
                  <span>{profile.profileCompletion}%</span>
                </div>
                <Progress value={profile.profileCompletion} className="h-2" />
              </div>

              <div className="space-y-4">
                <Button variant="ghost" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add your skills
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add work experience
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add education details
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* People You May Know */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                People you may know
              </h2>
              <div className="space-y-4">
                {/* This would be populated from the API */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-600">
                      Software Engineer at Google
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-between">
                  My Network
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between">
                  Saved Posts
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between">
                  My Courses
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between">
                  Settings
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
