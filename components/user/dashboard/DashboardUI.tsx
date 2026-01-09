"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import { fetchApplications } from "@/lib/redux/slices/applicationSlice";
import { Loader2 } from "lucide-react";
import { ProfileCompletion } from "./ProfileCompletion";
import { StatsGrid } from "./StatsGrid";
import { RecentApplications } from "./RecentApplications";

export default function UserDashboardUI() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading: profileLoading } = useSelector((state: RootState) => state.profile);
  const { loading: applicationsLoading } = useSelector((state: RootState) => state.applications);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initData = async () => {
      await dispatch(fetchProfile());
      await dispatch(fetchApplications({ page: 1, limit: 5 }));
      setIsInitialized(true);
    };
    initData();
  }, [dispatch]);

  if (!isInitialized || profileLoading || applicationsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here’s a snapshot of your activity.</p>
      </div>

      <ProfileCompletion />
      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentApplications />
        </div>
        <div className="lg:col-span-1">
          <div className="border border-slate-200 rounded-lg bg-white shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-900">Tips</h3>
            <p className="text-sm text-gray-600 mt-2">Keep your profile updated to get better job recommendations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

