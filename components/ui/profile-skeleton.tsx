import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ProfileHeaderSkeleton: React.FC = () => {
  return (
    <>
      {/* Cover Image Skeleton */}
      <div className="relative w-full">
        <Skeleton className="h-48 sm:h-56 md:h-64 lg:h-72 w-full rounded-none" />
        
        {/* Profile Image Skeleton */}
        <div className="absolute -bottom-12 sm:-bottom-14 md:-bottom-16 left-4 sm:left-6 md:left-8">
          <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full border-2 sm:border-4 border-white" />
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-18 md:pt-20 pb-6 sm:pb-8">
        {/* Profile Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-8 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            {/* Name Skeleton */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Skeleton className="h-6 sm:h-8 md:h-9 w-48 sm:w-64" />
              <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-full" />
            </div>

            {/* Professional Headline Skeleton */}
            <Skeleton className="h-4 sm:h-5 w-72 sm:w-96 mb-3" />

            {/* Contact Info Skeleton */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 mb-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Stats Skeleton */}
            <div className="flex items-center gap-4 sm:gap-6 mb-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>

            {/* About Me Skeleton */}
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Professional Badges Skeleton */}
            <div className="mb-4">
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </div>

            {/* Interests Skeleton */}
            <div className="mb-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex flex-row lg:flex-col xl:flex-row gap-2 flex-shrink-0">
            <Skeleton className="h-9 w-24 sm:w-28" />
            <Skeleton className="h-9 w-20 sm:w-24" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>
    </>
  );
};

export const ProfileSectionSkeleton: React.FC<{ title?: string }> = ({ title }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Section Content */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkillsSectionSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Skills List - Sidebar style */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CareerProgressSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Progress Items */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const StatsCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const LanguagesSectionSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Languages List */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProfileDashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Two-Column Layout - Matching actual layout */}
        <div className="flex flex-col lg:flex-row gap-6 relative">
          
          {/* Main Section (Large) - Profile Header, Stats, Work Experience, Education */}
          <div className="flex-1">
            {/* Profile Header */}
            <div className="mb-6">
              <ProfileHeaderSkeleton />
            </div>

            {/* Stats Cards */}
            <StatsCardsSkeleton />

            {/* Work Experience and Education */}
            <div className="space-y-6">
              <ProfileSectionSkeleton />
              <ProfileSectionSkeleton />
            </div>
          </div>

          {/* Sidebar Section (Small) - Skills, Languages, Career Progress */}
          <div className="lg:w-1/4 2xl:w-1/5 space-y-6 sticky top-6 self-start">
            <SkillsSectionSkeleton />
            <LanguagesSectionSkeleton />
            <CareerProgressSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact skeleton for quick loading states
export const CompactProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
};

// Loading skeleton for individual cards
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};
