"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchUserInstitutes } from "@/lib/redux/slices/instituteSlice";
import { fetchUserRegistrationIntents } from "@/lib/redux/slices/registrationSlice";
import { RegistrationIntent } from "@/lib/types/institute.types";
import { PremiumBanner } from "./PremiumBanner";
import { BusinessUrlCard } from "./BusinessUrlCard";
import { BePerfectSection } from "./BePerfectSection";
import { StatsGrid } from "./StatsGrid";
import { RecentLeads } from "./RecentLeads";
import { UpcomingEvents } from "./UpcomingEvents";
import { CoursePerformance } from "./CoursePerformance";
import { ProfileCompletion } from "./ProfileCompletion";
import { VerificationStatus } from "./VerificationStatus";
import { PendingVerificationView } from "./PendingVerificationView";
import { VerificationFailedView } from "./VerificationFailedView";
import { Loader2 } from "lucide-react";

export default function InstituteDashboardUI() {
  const dispatch = useDispatch<AppDispatch>();
  const { userInstitutes, loading: instituteLoading } = useSelector((state: RootState) => state.institute);
  const { intents, loading: registrationLoading } = useSelector((state: RootState) => state.registration);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initData = async () => {
      await Promise.all([
        dispatch(fetchUserInstitutes()),
        dispatch(fetchUserRegistrationIntents())
      ]);
      setIsInitialized(true);
    };
    initData();
  }, [dispatch]);

  if (!isInitialized || instituteLoading || registrationLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Determine Dashboard Status
  // 1. Check for Active/Verified Institute
  const activeInstitute = userInstitutes.find(i => 
    (i.status === 'Active' || i.status === 'active') && i.isVerified
  );

  // 2. Check for Pending/Under Review Institute or Intent
  const pendingInstitute = userInstitutes.find(i => 
    i.status === 'Under Review' || !i.isVerified
  );
  // Type assertion here to match the interface we defined in institute.types.ts
  const pendingIntent = intents.find(i => i.type === 'institute' && i.status === 'pending') as unknown as RegistrationIntent;

  // 3. Check for Rejected Institute or Intent
  const rejectedInstitute = userInstitutes.find(i => i.status === 'Rejected');
  const rejectedIntent = intents.find(i => i.type === 'institute' && i.status === 'rejected') as unknown as RegistrationIntent;

  // Render Logic
  
  // Case A: Pending Verification (No active institute, but has pending record)
  if (!activeInstitute && (pendingInstitute || pendingIntent)) {
    return <PendingVerificationView intent={pendingIntent} />;
  }

  // Case B: Verification Failed (No active, no pending, but rejected record)
  if (!activeInstitute && (rejectedInstitute || rejectedIntent)) {
    const reason = rejectedIntent?.adminNotes || "Your application was not approved.";
    return (
      <VerificationFailedView 
        reason={reason}
        onDelete={() => {
            // Logic to delete intent or reset state would go here
            console.log("Delete clicked");
        }}
      />
    );
  }

  // Case C: Active Dashboard (Default)
  // Even if there's no data (new user), we might show the dashboard or a "Create" prompt.
  // For now, we assume if they passed the route check, they are allowed, or we default to dashboard
  // to let them fill the profile.

  return (
    <div className="space-y-6">
      
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening at your institute today.</p>
      </div>

      {/* Verification Status Alert - Optional: Keep for minor warnings even if active */}
      {/* <VerificationStatus /> */}

      {/* Top Row: Premium Banner & URL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PremiumBanner />
        <BusinessUrlCard />
      </div>

      {/* Profile Completion Section */}
      <ProfileCompletion />

      {/* Be Perfect Section */}
      <BePerfectSection />

      {/* Stats Grid */}
      <StatsGrid />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RecentLeads />
        </div>
        
        {/* Upcoming Events - Takes up 1 column */}
        <div className="lg:col-span-1">
          <UpcomingEvents />
        </div>
      </div>

      {/* Bottom Row: Course Performance */}
      <div className="grid grid-cols-1">
        <CoursePerformance />
      </div>

    </div>
  );
}
