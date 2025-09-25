import React from "react";
import { PersonalDetailsDisplay } from "./PersonalDetailsDisplay";
import { PersonalDetailsForm } from "./PersonalDetailsForm";
import { useAppSelector } from "@/lib/redux/hooks";
import type { IPersonalDetails } from "@/lib/redux/slices/profileSlice";

interface PersonalDetailsManagerProps {
  variant?: "card" | "section";
  className?: string;
}

export const PersonalDetailsManager: React.FC<PersonalDetailsManagerProps> = ({
  variant = "section",
  className = "",
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const profile = useAppSelector((state) => state.profile.profile);
  
  // Get email from populated user data
  const userEmail = typeof profile?.userId === 'object' ? profile.userId.email : '';
  const emailVerified = typeof profile?.userId === 'object' ? profile.userId.emailVerified : false;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
  };

  // Default empty personal details if none exist
  const personalDetails: IPersonalDetails = profile?.personalDetails || {
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: undefined,
    gender: "PREFER_NOT_TO_SAY",
    professionalHeadline: "",
    publicProfileId: "",
    aboutMe: "",
    interests: [],
    professionalBadges: [],
    phone: "",
    nationality: "",
  };

  const containerClasses = variant === "card" 
    ? `bg-white rounded-lg border shadow-sm p-6 ${className}`
    : `space-y-4 ${className}`;

  return (
    <div className={containerClasses}>
      {variant === "section" && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
        </div>
      )}
      
      <PersonalDetailsDisplay
        personalDetails={personalDetails}
        userEmail={userEmail}
        emailVerified={emailVerified}
        onEdit={handleEdit}
      />
      
      <PersonalDetailsForm
        isEditing={isEditing}
        onClose={handleClose}
      />
    </div>
  );
};
