"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PersonalDetailsForm } from "@/components/profile/personalDetails/PersonalDetailsForm";
import { SkillsForm } from "@/components/forms/SkillsForm";
import { LanguagesForm } from "@/components/forms/LanguagesForm";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { AboutSection } from "@/components/dashboard/AboutSection";
import { SkillsSection } from "@/components/dashboard/SkillsSection";
import { WorkExperienceSection } from "@/components/dashboard/WorkExperienceSection";
import { EducationSection } from "@/components/dashboard/EducationSection";
import { LanguagesSection } from "@/components/dashboard/LanguagesSection";
import { CareerProgressSection } from "@/components/dashboard/CareerProgressSection";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import type { IWorkExperience, IEducation } from "@/lib/redux/slices/profileSlice";
import { WorkExperienceForm } from "@/components/profile/workExperience";
import { EducationForm } from "@/components/profile/education";
import { ProfileDashboardSkeleton } from "@/components/ui/profile-skeleton";

type ModalType =
  | "personal"
  | "work"
  | "education"
  | "skills"
  | "languages"
  | null;

export default function ModernProfileDashboard() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile.profile);
  const isLoading = useAppSelector((state) => state.profile.isLoading);
  const error = useAppSelector((state) => state.profile.error);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingPositionId, setEditingPositionId] = useState<string | undefined>(undefined);

  // Use ref to generate unique keys for form instances
  const modalKeyRef = useRef(0);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const openModal = (modalType: ModalType, item?: any, positionId?: string) => {
    setActiveModal(modalType);
    setEditingItem(item || null);
    setEditingPositionId(positionId);
    // Increment the modal key to force remount
    modalKeyRef.current += 1;
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingItem(null);
    setEditingPositionId(undefined);
  };

  // Generate unique keys for modal components
  const getModalKey = (modalType: string, item?: any, positionId?: string): string => {
    const baseKey = `${modalType}-${modalKeyRef.current}`;
    if (item?.id) {
      return positionId ? `${baseKey}-${item.id}-${positionId}` : `${baseKey}-${item.id}`;
    }
    return baseKey;
  };

  if (isLoading || !profile) {
    return <ProfileDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Profile</h3>
            <p className="text-red-600 mb-6 text-sm">{error}</p>
            <Button
              onClick={() => dispatch(fetchProfile())}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 relative">

          {/* Main Section (Large) - Profile Header, Stats, Work Experience, Education */}
          <div className="flex-1 ">
            {/* Profile Header */}
            <div className="mb-6">
              <ProfileHeader
                profile={profile}
                onEditPersonal={() => openModal("personal")}
              />
            </div>

            {/* Stats Cards */}
            {/* <div className="mb-6">
              <StatsCards profile={profile} />
            </div> */}

            {/* Work Experience and Education */}
            <div className="space-y-6">
              <WorkExperienceSection
                profile={profile}
                onAdd={() => openModal("work")}
                onEdit={(experience, positionId) => openModal("work", experience, positionId)}
              />

              <EducationSection
                profile={profile}
                onAdd={() => openModal("education")}
                onEdit={(education) => openModal("education", education)}
              />
            </div>
          </div>

          {/* Sidebar Section (Small) - About, Skills, Languages, Career Progress */}
          <div className="w-full lg:w-1/4 space-y-6 sticky top-6 self-start">

            <SkillsSection
              profile={profile}
              onEdit={() => openModal("skills")}
            />

            <LanguagesSection
              profile={profile}
              onEdit={() => openModal("languages")}
            />

            {/* <CareerProgressSection profile={profile} /> */}
          </div>
        </div>
      </div>

      {/* Modal Components with unique keys */}
      <PersonalDetailsForm
        key={getModalKey("personal")}
        isEditing={activeModal === "personal"}
        onClose={closeModal}
        variant="full-screen"
        profile={profile}
      />

      <WorkExperienceForm
        key={getModalKey("work", editingItem, editingPositionId)}
        open={activeModal === "work"}
        onClose={closeModal}
        experience={editingItem}
        variant="full-screen"
        editingPositionId={editingPositionId}
      />

      <EducationForm
        key={getModalKey("education", editingItem)}
        open={activeModal === "education"}
        onClose={closeModal}
        education={editingItem}
        variant="full-screen"
      />

      <SkillsForm
        key={getModalKey("skills")}
        isEditing={activeModal === "skills"}
        onClose={closeModal}
      />

      <LanguagesForm
        key={getModalKey("languages")}
        isEditing={activeModal === "languages"}
        onClose={closeModal}
      />
    </div>
  );
}