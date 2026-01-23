"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { SubscriptionLockScreen } from "./SubscriptionLockScreen";
import {
  clearHasFetched,
  fetchUserInstitutes,
} from "@/lib/redux/slices/instituteSlice";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export default function SubscriptionGuard({
  children,
}: SubscriptionGuardProps) {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Track if initial fetch has completed
  const [hasInitialized, setHasInitialized] = useState(false);

  const {
    selectedInstitute,
    currentInstitute,
    loading: instituteLoading,
  } = useSelector((state: RootState) => state.institute as any);

  const institute = selectedInstitute || currentInstitute;
  const subscription = institute?.subscription;

  // Check if subscription is inactive
  const isSubscriptionInactive =
    subscription &&
    (!subscription.isActive || subscription.status === "inactive");

  useEffect(() => {
    const initData = async () => {
      dispatch(clearHasFetched());
      await dispatch(fetchUserInstitutes({ force: true }));
      setHasInitialized(true); // ✅ Mark as initialized after fetch completes
    };
    initData();
  }, [dispatch]);

  // ✅ Show loading if: not initialized yet OR currently loading
  if (!hasInitialized || instituteLoading) {
    return (
      <div className="pt-20 pb-24">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 lg:gap-8 pt-6">
            <aside className="hidden lg:block w-[300px] shrink-0">
              <div className="sticky top-24 space-y-4">
                <div className="bg-white rounded-xl border p-4 space-y-3">
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="bg-white rounded-xl border p-4 space-y-2">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              </div>
            </aside>
            <main className="flex-1 min-w-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24 rounded-full" />
                    <Skeleton className="h-9 w-24 rounded-full" />
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-5 md:gap-4 no-scrollbar">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="min-w-[140px] md:min-w-0 bg-white rounded-xl border p-4 h-[88px] flex flex-col justify-between"
                    >
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </div>

                <div className="sticky top-[72px] md:top-[80px] z-30 bg-white backdrop-blur-sm py-2 -mx-4 px-4 md:mx-0 md:px-0 space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Skeleton className="h-10 w-full rounded-full" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                      <Skeleton className="h-10 w-[150px] rounded-full" />
                      <Skeleton className="h-10 w-[120px] rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border bg-white shadow-sm p-5 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-5 w-56" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                      </div>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-4 w-52" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // If subscription is inactive, show lock screen
  if (isSubscriptionInactive) {
    return (
      <SubscriptionLockScreen
        instituteName={institute?.name || institute?.instituteName}
        subscriptionStatus={subscription.status}
        grantReason={subscription.grantReason}
        planName={subscription.planName}
      />
    );
  }

  // Otherwise, render children normally
  return <>{children}</>;
}
