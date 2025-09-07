"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/layout";
import UserTypeSelection from "@/components/onboarding/user-type-selection";
import RoleSelection, {
  roleOptions,
} from "@/components/onboarding/role-selection";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const [step, setStep] = useState<"userType" | "roles">("userType");
  const [userType, setUserType] = useState<"student" | "professional" | null>(
    null
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (session === null) {
      router.push("/auth/signup?mode=signin");
    } else if (session?.user && !session.user.needsOnboarding) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleUserTypeSelect = async (type: "student" | "professional") => {
    setUserType(type);
    setStep("roles");
  };

  const handleRoleSelectionComplete = async () => {
    if (!userType) {
      setError("Please select your user type (student/professional)");
      return;
    }

    if (selectedRoles.length === 0) {
      setError("Please select at least one role that describes you");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          userType,
          roles: selectedRoles,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      // Update the session
      await update();

      // If user has multiple roles, they'll need to select active role
      if (selectedRoles.length > 1) {
        router.push("/dashboard?selectRole=true");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <OnboardingLayout currentStep={step === "userType" ? 1 : 2} totalSteps={2}>
      <div className="space-y-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Message */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome, {session.user?.name}! 👋
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            To personalize your CareerBox experience, please select all roles
            that describe you. You can choose multiple roles to unlock relevant
            features and content.
          </p>
        </div>

        {/* Step Content */}
        {step === "userType" ? (
          <UserTypeSelection
            selectedType={userType}
            onSelect={handleUserTypeSelect}
          />
        ) : (
          <RoleSelection
            selectedRoles={selectedRoles}
            onToggleRole={handleRoleToggle}
          />
        )}

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={
              step === "userType"
                ? () => {}
                : () => handleRoleSelectionComplete()
            }
            disabled={
              (step === "userType" && !userType) ||
              (step === "roles" && (selectedRoles.length === 0 || isLoading))
            }
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              "Setting up your account..."
            ) : step === "userType" ? (
              <>
                Continue to Role Selection{" "}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            ) : (
              <>
                Complete Setup & Continue{" "}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            {step === "userType"
              ? "This helps us personalize your experience"
              : "Don't worry, you can update your roles anytime from your profile settings"}
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
