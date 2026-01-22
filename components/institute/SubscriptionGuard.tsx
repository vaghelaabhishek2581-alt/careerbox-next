"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { SubscriptionLockScreen } from "./SubscriptionLockScreen";
import { useRouter } from "next/navigation";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const { selectedInstitute, currentInstitute } = useSelector(
    (state: RootState) => state.institute as any
  );

  const institute = selectedInstitute || currentInstitute;
  const subscription = institute?.subscription;

  // Check if subscription is inactive
  const isSubscriptionInactive = subscription && (!subscription.isActive || subscription.status === 'inactive');

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
