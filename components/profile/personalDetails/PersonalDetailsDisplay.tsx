import React from "react";
import { User, Mail, Phone, Globe, Calendar, MapPin, MoreVertical, Edit2, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { IPersonalDetails } from "@/lib/redux/slices/profileSlice";
import { format } from "date-fns";

interface PersonalDetailsDisplayProps {
  personalDetails: IPersonalDetails;
  userEmail?: string;
  emailVerified?: boolean;
  onEdit: () => void;
}

// Gender display labels
const genderLabels = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
} as const;

export const PersonalDetailsDisplay: React.FC<PersonalDetailsDisplayProps> = ({
  personalDetails,
  userEmail,
  emailVerified = false,
  onEdit,
}) => {
  const fullName = [
    personalDetails.firstName,
    personalDetails.middleName,
    personalDetails.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative group">
      {/* Timeline connector line for consistency */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 -z-10"></div>
      
      <div className="flex items-start gap-4">
        {/* Profile icon */}
        <div className="relative h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Name and Professional Headline */}
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {fullName || "Name not provided"}
                </h3>
                
                {personalDetails.professionalHeadline && (
                  <p className="font-medium text-gray-700">
                    {personalDetails.professionalHeadline}
                  </p>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-2 mt-3">
                {/* Email */}
                {userEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{userEmail}</span>
                    {emailVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                )}

                {/* Phone */}
                {personalDetails.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{personalDetails.phone}</span>
                  </div>
                )}

                {/* Public Profile ID */}
                {personalDetails.publicProfileId && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4" />
                    <span>careerbox.in/{personalDetails.publicProfileId}</span>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Date of Birth */}
                {personalDetails.dateOfBirth && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Born {format(new Date(personalDetails.dateOfBirth), "MMMM d, yyyy")}
                    </span>
                  </div>
                )}

                {/* Nationality */}
                {personalDetails.nationality && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{personalDetails.nationality}</span>
                  </div>
                )}

                {/* Gender */}
                {personalDetails.gender && personalDetails.gender !== "PREFER_NOT_TO_SAY" && (
                  <div className="text-sm text-gray-600">
                    <span>{genderLabels[personalDetails.gender]}</span>
                  </div>
                )}
              </div>

              {/* About Me */}
              {personalDetails.aboutMe && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">About Me</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {personalDetails.aboutMe}
                  </p>
                </div>
              )}

              {/* Professional Badges */}
              {personalDetails.professionalBadges && personalDetails.professionalBadges.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Professional Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {personalDetails.professionalBadges.map((badge, index) => (
                      <Badge
                        key={`badge-${badge}-${index}`}
                        variant="secondary"
                        className="text-xs"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {personalDetails.interests && personalDetails.interests.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {personalDetails.interests.map((interest, index) => (
                      <Badge
                        key={`interest-${interest}-${index}`}
                        variant="outline"
                        className="text-xs"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Personal Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
