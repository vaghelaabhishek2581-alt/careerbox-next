"use client";

import React, { useState, useEffect } from "react";
import {
  Edit2,
  Plus,
  MapPin,
  Building2,
  Globe,
  Briefcase,
  GraduationCap,
  Languages,
  Award,
  Users,
  Camera,
  Settings,
  Share2,
  MoreHorizontal,
  Star,
  Calendar,
  Mail,
  Phone,
  Verified,
  BookOpen,
  Target,
  BarChart2,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { PersonalDetailsForm } from "@/components/forms/PersonalDetailsForm";
import { WorkExperienceForm } from "@/components/forms/WorkExperienceForm";
import { EducationForm } from "@/components/forms/EducationForm";
import { SkillsForm } from "@/components/forms/SkillsForm";
import { LanguagesForm } from "@/components/forms/LanguagesForm";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import type {
  UserProfile,
  Skill,
  Language,
  WorkExperience,
  Education,
  WorkPosition
} from "@/lib/types/profile.unified";

function getInitial(name?: string): string {
  return name ? name.charAt(0).toUpperCase() : '';
}

type ModalType =
  | "personal"
  | "work"
  | "education"
  | "skills"
  | "languages"
  | "cover"
  | "profile"
  | null;

export default function ModernProfileDashboard() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile.profile);
  const isLoading = useAppSelector((state) => state.profile.isLoading);
  const error = useAppSelector((state) => state.profile.error);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const openModal = (modalType: ModalType, item?: any) => {
    setActiveModal(modalType);
    setEditingItem(item || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingItem(null);
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => dispatch(fetchProfile())}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image Section */}
      <div className="relative">
        <div
          className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 bg-cover bg-center relative"
          style={{ backgroundImage: profile?.coverImage ? `url(${profile.coverImage})` : undefined }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            onClick={() => openModal("cover")}
          >
            <Camera className="h-4 w-4 mr-2" />
            Edit Cover
          </Button>
        </div>

        {/* Profile Image */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={profile?.profileImage || ""} alt={profile?.name || ""} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {getInitial(profile?.personalDetails?.firstName)}
                {getInitial(profile?.personalDetails?.lastName)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-2 right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md"
              onClick={() => openModal("profile")}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Profile Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile?.name || "Unnamed Profile"}
              </h1>
              {profile?.verified && (
                <Verified className="h-6 w-6 text-blue-600" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openModal("personal")}
                className="text-gray-600 hover:text-gray-900"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-lg text-gray-600 mb-3">
              {profile?.personalDetails?.professionalHeadline || "No headline set"}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              {profile?.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
              )}
              {profile?.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {profile.email}
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 mb-4">
              <div className="text-sm">
                <span className="font-bold text-gray-900">
                  {profile?.followers || 0}
                </span>
                <span className="text-gray-600 ml-1">Followers</span>
              </div>
              <div className="text-sm">
                <span className="font-bold text-gray-900">
                  {profile?.following || 0}
                </span>
                <span className="text-gray-600 ml-1">Following</span>
              </div>
            </div>

            {profile?.personalDetails?.aboutMe &&
              profile.personalDetails.aboutMe !==
                "Tell us a bit about yourself" && (
                <p className="text-gray-700 mb-4 max-w-2xl">
                  {profile.personalDetails.aboutMe}
                </p>
              )}
          </div>

          <div className="flex gap-2">
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Profile Sections
            </Button>
            <Button variant="outline" onClick={() => openModal("personal")}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* About Section */}
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
                    onClick={() => openModal("personal")}
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

            {/* Skills Section */}
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
                    onClick={() => openModal("skills")}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {profile?.skills.map((skill: Skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium">{skill.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {skill.level}
                      </Badge>
                    </div>
                  ))}
                  {profile?.skills.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No skills added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Languages Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Languages className="h-5 w-5 mr-2 text-gray-600" />
                    Languages
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal("languages")}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {profile?.languages.map((language: Language) => (
                    <div
                      key={language.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">
                        {language.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          language.level === "Native"
                            ? "border-green-200 text-green-700"
                            : language.level === "Fluent"
                            ? "border-purple-200 text-purple-700"
                            : language.level === "Advanced"
                            ? "border-blue-200 text-blue-700"
                            : language.level === "Intermediate"
                            ? "border-orange-200 text-orange-700"
                            : "border-red-200 text-red-700"
                        }`}
                      >
                        {language.level}
                      </Badge>
                    </div>
                  ))}
                  {profile?.languages.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No languages added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Completed Courses
                      </p>
                      <h3 className="text-2xl font-bold">
                        {profile?.stats?.completedCourses}
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
                        {profile?.stats?.skillsAssessed}
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
                        {profile?.stats?.careerGoals}
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
                        {profile?.stats?.networkSize}
                      </h3>
                    </div>
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Work Experience Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-gray-600" />
                    Work Experience
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal("work")}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {profile?.workExperiences.map((experience: WorkExperience) => (
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
                                {experience.positions.map((position: WorkPosition) => (
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
                              onClick={() => openModal("work", experience)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {profile?.workExperiences.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No work experience added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Education Section */}
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
                    onClick={() => openModal("education")}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {profile?.education.map((education: Education) => (
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
                              onClick={() => openModal("education", education)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {profile?.education.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No education added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Career Progress */}
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
                        {profile?.progress?.overall}%
                      </span>
                    </div>
                    <Progress
                      value={profile?.progress?.overall}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Skills Development
                      </span>
                      <span className="text-sm text-gray-500">
                        {profile?.progress?.skills}%
                      </span>
                    </div>
                    <Progress value={profile?.progress?.skills} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Goal Achievement
                      </span>
                      <span className="text-sm text-gray-500">
                        {profile?.progress?.goals}%
                      </span>
                    </div>
                    <Progress value={profile?.progress?.goals} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <PersonalDetailsForm
        open={activeModal === "personal"}
        onClose={closeModal}
      />

      <WorkExperienceForm
        open={activeModal === "work"}
        onClose={closeModal}
        experience={editingItem}
      />

      <EducationForm
        open={activeModal === "education"}
        onClose={closeModal}
        education={editingItem}
      />

      <SkillsForm open={activeModal === "skills"} onClose={closeModal} />

      <LanguagesForm open={activeModal === "languages"} onClose={closeModal} />
    </div>
  );
}
