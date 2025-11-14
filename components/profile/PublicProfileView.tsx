"use client";

import React from "react";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { WorkExperienceSection } from "@/components/dashboard/WorkExperienceSection";
import { EducationSection } from "@/components/dashboard/EducationSection";
import { SkillsSection } from "@/components/dashboard/SkillsSection";
import { LanguagesSection } from "@/components/dashboard/LanguagesSection";
import { CareerProgressSection } from "@/components/dashboard/CareerProgressSection";

interface PublicProfileViewProps {
  profile: any;
}

export default function PublicProfileView({ profile }: PublicProfileViewProps) {
  // Read-only handlers - no-op functions
  const noOpHandler = () => {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Two-Column Layout - Same as user page */}
        <div className="flex flex-col lg:flex-row gap-6 relative">

          {/* Main Section (Large) - Profile Header, Stats, Work Experience, Education */}
          <div className="flex-1">
            {/* Profile Header - Read Only */}
            <div className="mb-6">
              <ProfileHeader
                profile={profile}
                onEditPersonal={noOpHandler} // No edit functionality
              />
            </div>

            {/* Stats Cards */}
            <div className="mb-6">
              <StatsCards profile={profile} />
            </div>

            {/* Work Experience and Education - Read Only */}
            <div className="space-y-6">
              <WorkExperienceSection
                profile={profile}
                onAdd={noOpHandler} // No add functionality
                onEdit={noOpHandler} // No edit functionality
              />

              <EducationSection
                profile={profile}
                onAdd={noOpHandler} // No add functionality
                onEdit={noOpHandler} // No edit functionality
              />
            </div>
          </div>

          {/* Sidebar Section (Small) - About, Skills, Languages, Career Progress */}
          <div className="lg:w-1/4 2xl:w-1/5 space-y-6 sticky top-6 self-start">

            <SkillsSection
              profile={profile}
              onEdit={noOpHandler} // No edit functionality
            />

            <LanguagesSection
              profile={profile}
              onEdit={noOpHandler} // No edit functionality
            />

            <CareerProgressSection 
              profile={profile}
            />
          </div>
        </div>
      </div>

      {/* No Modal Components - Read-only mode doesn't need editing modals */}
    </div>
  );
}
