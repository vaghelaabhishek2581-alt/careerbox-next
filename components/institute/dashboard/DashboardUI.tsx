"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import {
  fetchUserInstitutes,
  clearHasFetched,
} from "@/lib/redux/slices/instituteSlice";
import { SubscriptionGuard } from "@/components/institute/SubscriptionGuard";
import { PremiumBanner } from "./PremiumBanner";
import { BusinessUrlCard } from "./BusinessUrlCard";
import { BePerfectSection } from "./BePerfectSection";
import { StatsGrid } from "./StatsGrid";
import { RecentLeads } from "./RecentLeads";
import { UpcomingEvents } from "./UpcomingEvents";
import { CoursePerformance } from "./CoursePerformance";
import { ProfileCompletion } from "./ProfileCompletion";
import { Loader2 } from "lucide-react";

export default function InstituteDashboardUI() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading: instituteLoading } = useSelector(
    (state: RootState) => state.institute,
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initData = async () => {
      dispatch(clearHasFetched());
      await dispatch(fetchUserInstitutes({ force: true }));
      setIsInitialized(true);
    };
    initData();
  }, [dispatch]);

  if (!isInitialized || instituteLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <SubscriptionGuard>
      <div className="space-y-6">
        {/* Page Heading */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's what's happening at your institute today.
          </p>
        </div>

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

        <div className="grid grid-cols-1">
          <CoursePerformance />
        </div>
      </div>
    </SubscriptionGuard>
  );
}
