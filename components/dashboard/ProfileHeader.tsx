import React, { useRef } from "react";
import { Edit2, Plus, MapPin, Mail, Globe, Share2, MoreHorizontal, Camera, Verified } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/redux/hooks";
import { uploadProfileImage } from "@/lib/redux/slices/profileSlice";
import type { IProfile } from "@/lib/redux/slices/profileSlice";

interface ProfileHeaderProps {
  profile: IProfile;
  onEditPersonal: () => void;
}

function getInitial(name?: string): string {
  return name ? name.charAt(0).toUpperCase() : '';
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, onEditPersonal }) => {
  const dispatch = useAppDispatch();
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // Handle profile image upload
  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      dispatch(uploadProfileImage({ type: 'profile', file }));
    }
  };

  // Handle cover image upload
  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      dispatch(uploadProfileImage({ type: 'cover', file }));
    }
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={profileImageInputRef}
        onChange={handleProfileImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={coverImageInputRef}
        onChange={handleCoverImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Cover Image Section */}
      <div className="relative">
        <div
          className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 bg-cover bg-center relative"
          style={{ backgroundImage: profile?.coverImage ? `url(${profile.coverImage})` : undefined }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            onClick={() => coverImageInputRef.current?.click()}
          >
            <Camera className="h-4 w-4 mr-2" />
            Edit Cover
          </Button>
        </div>

        {/* Profile Image */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={profile?.profileImage || ""} alt={profile?.personalDetails?.firstName || ""} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {getInitial(profile?.personalDetails?.firstName)}
                {getInitial(profile?.personalDetails?.lastName)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-2 right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md"
              onClick={() => profileImageInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Profile Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile?.personalDetails?.firstName && profile?.personalDetails?.lastName
                  ? `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`
                  : "Unnamed Profile"}
              </h1>
              {profile?.verified && (
                <Verified className="h-6 w-6 text-blue-600" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditPersonal}
                className="text-gray-600 hover:text-gray-900"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-lg text-gray-600 mb-3">
              {profile?.personalDetails?.professionalHeadline || "No headline set"}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              {profile?.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
              )}
              {typeof profile?.userId === 'object' && profile.userId.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {profile.userId.email}
                </div>
              )}
              {profile?.socialLinks?.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 mb-4">
              <div className="text-sm">
                <span className="font-bold text-gray-900">
                  {profile?.followers || 0}
                </span>
                <span className="text-gray-600 ml-1">Followers</span>
              </div>
              <div className="text-sm">
                <span className="font-bold text-gray-900">
                  {profile?.following || 0}
                </span>
                <span className="text-gray-600 ml-1">Following</span>
              </div>
            </div>

            {profile?.personalDetails?.aboutMe &&
              profile.personalDetails.aboutMe !==
              "Tell us a bit about yourself" && (
                <p className="text-gray-700 mb-4 max-w-2xl">
                  {profile.personalDetails.aboutMe}
                </p>
              )}
          </div>

          <div className="flex gap-2">
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Profile Sections
            </Button>
            <Button variant="outline" onClick={onEditPersonal}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
