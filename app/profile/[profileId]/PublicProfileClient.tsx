"use client";

import React from "react";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { WorkExperienceSection } from "@/components/dashboard/WorkExperienceSection";
import { EducationSection } from "@/components/dashboard/EducationSection";
import { SkillsSection } from "@/components/dashboard/SkillsSection";
import { LanguagesSection } from "@/components/dashboard/LanguagesSection";
import { CareerProgressSection } from "@/components/dashboard/CareerProgressSection";

interface PublicProfileClientProps {
    profile: any;
}

export default function PublicProfileClient({ profile }: PublicProfileClientProps) {
    // No-op handlers for read-only mode
    const noOpHandler = () => {
        // Optionally show a toast message that this is a public profile
        console.log("This is a read-only public profile");
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                  .public-profile-readonly button:has(svg) {
                    pointer-events: none;
                  }
                  .public-profile-readonly button:has(svg):not(:has(.lucide-share-2)):not(:has(.lucide-more-horizontal)) {
                    display: none !important;
                  }
                  .public-profile-readonly [class*="camera"] {
                    display: none !important;
                  }
                  .public-profile-readonly input[type="file"] {
                    display: none !important;
                  }
                `
            }} />

            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 public-profile-readonly">
                {/* Two-Column Layout - Same as user dashboard */}
                <div className="flex flex-col lg:flex-row gap-6 relative">

                    {/* Main Section (Large) - Profile Header, Stats, Work Experience, Education */}
                    <div className="flex-1">
                        {/* Profile Header - Read Only */}
                        <div className="mb-6">
                            <ProfileHeader
                                profile={profile}
                                onEditPersonal={noOpHandler}
                            />
                        </div>

                        {/* Stats Cards */}
                        <div className="mb-6">
                            <StatsCards profile={profile} />
                        </div>

                        {/* Work Experience and Education */}
                        <div className="space-y-6">
                            <WorkExperienceSection
                                profile={profile}
                                onAdd={noOpHandler}
                                onEdit={noOpHandler}
                            />

                            <EducationSection
                                profile={profile}
                                onAdd={noOpHandler}
                                onEdit={noOpHandler}
                            />
                        </div>
                    </div>

                    {/* Sidebar Section (Small) - Skills, Languages, Career Progress */}
                    <div className="lg:w-1/4 2xl:w-1/5 space-y-6 sticky top-6 self-start">
                        <SkillsSection
                            profile={profile}
                            onEdit={noOpHandler}
                        />

                        <LanguagesSection
                            profile={profile}
                            onEdit={noOpHandler}
                        />

                        <CareerProgressSection profile={profile} />
                    </div>
                </div>
            </div>
        </>
    );
}
