"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PersonalDetailsForm } from "@/components/forms/PersonalDetailsForm";
// import { WorkExperienceForm } from "@/components/forms/WorkExperienceForm";
// import { EducationForm } from "@/components/profile/education";
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
  
  // Use ref to generate unique keys for form instances
  const modalKeyRef = useRef(0);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const openModal = (modalType: ModalType, item?: any) => {
    setActiveModal(modalType);
    setEditingItem(item || null);
    // Increment the modal key to force remount
    modalKeyRef.current += 1;
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingItem(null);
  };

  // Generate unique keys for modal components
  const getModalKey = (modalType: string, item?: any): string => {
    const baseKey = `${modalType}-${modalKeyRef.current}`;
    if (item?.id) {
      return `${baseKey}-${item.id}`;
    }
    return baseKey;
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
      <ProfileHeader 
        profile={profile} 
        onEditPersonal={() => openModal("personal")} 
      />

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="space-y-6">
          <StatsCards profile={profile} />
          
          <AboutSection 
            profile={profile} 
            onEdit={() => openModal("personal")} 
          />
          
          <SkillsSection 
            profile={profile} 
            onEdit={() => openModal("skills")} 
          />
          
          <WorkExperienceSection 
            profile={profile} 
            onAdd={() => openModal("work")}
            onEdit={(experience) => openModal("work", experience)}
          />
          
          <EducationSection 
            profile={profile} 
            onAdd={() => openModal("education")}
            onEdit={(education) => openModal("education", education)}
          />
          
          <LanguagesSection 
            profile={profile} 
            onEdit={() => openModal("languages")} 
          />
          
          <CareerProgressSection profile={profile} />
        </div>
      </div>

      {/* Modal Components with unique keys */}
      <PersonalDetailsForm
        key={getModalKey("personal")}
        open={activeModal === "personal"}
        onClose={closeModal}
      />

      <WorkExperienceForm
        key={getModalKey("work", editingItem)}
        open={activeModal === "work"}
        onClose={closeModal}
        experience={editingItem}
        variant="full-screen"
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
        open={activeModal === "skills"} 
        onClose={closeModal} 
      />

      <LanguagesForm 
        key={getModalKey("languages")}
        open={activeModal === "languages"} 
        onClose={closeModal} 
      />
    </div>
  );
}