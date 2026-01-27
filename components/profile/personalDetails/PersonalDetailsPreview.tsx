import React from "react";
import { User, Mail, Phone, Globe, Calendar, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface PersonalDetailsPreviewProps {
  data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    dateOfBirth?: Date | null;
    gender?: string;
    professionalHeadline?: string;
    publicProfileId?: string;
    aboutMe?: string;
    interests?: string[];
    professionalBadges?: string[];
    phone?: string;
    nationality?: string;
  };
  emailVerified?: boolean;
}

// Gender display labels
const genderLabels = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
} as const;

export const PersonalDetailsPreview: React.FC<PersonalDetailsPreviewProps> = ({
  data,
  emailVerified = false,
}) => {
  const fullName = [data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Preview</h2>
          <p className="text-sm text-gray-600">
            See how your personal details will appear on your profile
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-xl">
              {fullName || "Your Name"}
            </CardTitle>
            {data.professionalHeadline && (
              <p className="text-gray-600 font-medium">
                {data.professionalHeadline}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Contact Information</h4>
              
              {/* Email */}
              {data.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{data.email}</span>
                  {emailVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              )}

              {/* Phone */}
              {data.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{data.phone}</span>
                </div>
              )}

              {/* Public Profile ID */}
              {data.publicProfileId && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a
                    href={`https://careerbox.in/profile/${data.publicProfileId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    careerbox.in/profile/{data.publicProfileId}
                  </a>
                </div>
              )}
            </div>

            {/* Personal Information */}
            {(data.dateOfBirth || data.nationality || (data.gender && data.gender !== "PREFER_NOT_TO_SAY")) && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-gray-900">Personal Information</h4>
                
                {/* Date of Birth */}
                {data.dateOfBirth && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      Born {format(new Date(data.dateOfBirth), "MMMM d, yyyy")}
                    </span>
                  </div>
                )}

                {/* Nationality */}
                {data.nationality && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{data.nationality}</span>
                  </div>
                )}

                {/* Gender */}
                {data.gender && data.gender !== "PREFER_NOT_TO_SAY" && (
                  <div className="text-sm">
                    <span>{genderLabels[data.gender as keyof typeof genderLabels]}</span>
                  </div>
                )}
              </div>
            )}

            {/* About Me */}
            {data.aboutMe && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-gray-900">About Me</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {data.aboutMe}
                </p>
              </div>
            )}

            {/* Professional Badges */}
            {data.professionalBadges && data.professionalBadges.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-gray-900">Professional Badges</h4>
                <div className="flex flex-wrap gap-2">
                  {data.professionalBadges.map((badge, index) => (
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
            {data.interests && data.interests.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-gray-900">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {data.interests.map((interest, index) => (
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
          </CardContent>
        </Card>

        {/* Profile Completeness */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Completeness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { field: fullName, label: "Full Name", required: true },
                { field: data.email, label: "Email Address", required: true },
                { field: data.professionalHeadline, label: "Professional Headline", required: true },
                { field: data.publicProfileId, label: "Public Profile ID", required: true },
                { field: data.aboutMe, label: "About Me", required: false },
                { field: data.phone, label: "Phone Number", required: false },
                { field: data.dateOfBirth, label: "Date of Birth", required: false },
                { field: data.nationality, label: "Nationality", required: false },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className={item.required ? "font-medium" : "text-gray-600"}>
                    {item.label}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                  <div className="flex items-center gap-1">
                    {item.field ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
