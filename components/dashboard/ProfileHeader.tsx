import React, { useMemo, useState } from "react";
import { Edit2, Plus, MapPin, Mail, Globe, Share2, MoreHorizontal, Camera, Verified, Upload, X, Loader2, Edit2Icon, Link as LinkIcon, Clipboard, Check, Mail as MailIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { uploadProfileImage as uploadProfileImageAction, updateLocalProfile } from "@/lib/redux/slices/profileSlice";
import type { IProfile } from "@/lib/redux/slices/profileSlice";
import { ImageCropperDialog } from "@/components/ui/ImageCropperDialog";
import { ImageViewerDialog } from "@/components/ui/ImageViewerDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface ProfileHeaderProps {
  profile: IProfile;
  onEditPersonal: () => void;
  readOnly?: boolean;
}

function getInitial(name?: string): string {
  return name ? name.charAt(0).toUpperCase() : '';
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = React.memo(({ profile, onEditPersonal, readOnly }) => {
  const dispatch = useAppDispatch();
  const isUploading = useAppSelector((state) => state.profile.isUploadingImage, (prev, next) => prev === next);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropType, setCropType] = useState<"profile" | "cover">("profile");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerType, setViewerType] = useState<"profile" | "cover">("profile");
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handleCropped(file: File) {
    await dispatch(uploadProfileImageAction({ type: cropType, file })).unwrap();
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/profile/upload-image?type=${cropType}`, { method: "DELETE" });
      if (!res.ok) return;
      if (cropType === "profile") {
        dispatch(updateLocalProfile({ profileImage: undefined }));
      } else {
        dispatch(updateLocalProfile({ coverImage: undefined }));
      }
      setCropOpen(false);
      setViewerOpen(false);
    } catch {}
  }

  const displayName = useMemo(() => {
    const first = profile?.personalDetails?.firstName || "";
    const last = profile?.personalDetails?.lastName || "";
    return `${first} ${last}`.trim() || "CareerBox Profile";
  }, [profile]);

  const headline = profile?.personalDetails?.professionalHeadline || "View my CareerBox profile";

  const shareUrl = useMemo(() => {
    const base = 'https://careerbox.in'
    const id = profile?.personalDetails?.publicProfileId || '';
    return new URL(`/profile/${id}`, base).toString();
  }, [profile]);

  const shareMessage = useMemo(() => {
    const name = displayName;
    const role = (headline || "").trim();
    const intro = role ? `I'm ${name}, ${role}.` : `I'm ${name}.`;
    const loc = profile?.location ? `Based in ${profile.location}.` : "";
    const topSkills = Array.isArray(profile?.skills)
      ? profile.skills.map(s => s?.name).filter(Boolean).slice(0, 3)
      : [];
    const skillsLine = topSkills.length ? `Skills: ${topSkills.join(", ")}.` : "";
    const aboutRaw = (profile?.personalDetails?.aboutMe || "").trim();
    const aboutSnippet = aboutRaw
      ? (aboutRaw.length > 160 ? `${aboutRaw.slice(0, 157)}...` : aboutRaw)
      : "";
    const cta = "View my full profile on CareerBox for experience, education, and achievements.";
    return [intro, loc, skillsLine, aboutSnippet, cta].filter(Boolean).join(" ");
  }, [displayName, headline, profile]);

  async function handleShare() {
    try {
      if (typeof window !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({
          title: `${displayName} — CareerBox Profile`,
          text: shareMessage,
          url: shareUrl,
        });
        toast({ title: "Shared", description: "Profile shared successfully." });
        return;
      }
    } catch {}
    setShareOpen(true);
  }

  async function handleCopy() {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareMessage}\n\n${shareUrl}`);
        setCopied(true);
        toast({ title: "Message copied", description: "Share message and link copied to clipboard." });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  }

  function openShareLink(url: string) {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareMessage);

  return (
    <div className="w-full flex flex-col items-center justify-center border-1 border-gray-200">
      <div className="w-full mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6 overflow-hidden">
          <div className="relative">
            <div
              className="h-32 sm:h-40 md:h-48 lg:h-56 w-full bg-gradient-to-r from-blue-500 to-purple-600 bg-cover bg-center cursor-pointer"
              style={{ backgroundImage: profile?.coverImage ? `url(${profile.coverImage})` : undefined }}
              onClick={() => { setViewerType("cover"); setViewerOpen(true); }}
            >
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4 rounded-full bg-white/80 hover:bg-white text-gray-700"
                onClick={(e) => { e.stopPropagation(); setCropType("cover"); setCropOpen(true); }}
              >
                <Edit2Icon className="h-4 w-4 mr-2" />
                Edit Cover
              </Button>
            </div>
            <div className="absolute -bottom-12 sm:-bottom-14 md:-bottom-16 left-2 sm:left-4 md:left-6">
              <div className="relative">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 border-2 sm:border-4 border-white cursor-pointer"
                  onClick={() => { setViewerType("profile"); setViewerOpen(true); }}
                >
                  <AvatarImage src={profile?.profileImage} alt="Profile" />
                  <AvatarFallback className="text-lg sm:text-xl md:text-2xl font-semibold bg-gray-200">
                    {getInitial(profile?.personalDetails?.firstName)}
                    {getInitial(profile?.personalDetails?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 h-6 w-6 sm:h-8 sm:w-8 rounded-full p-0 bg-white shadow-md"
                  onClick={(e) => { e.stopPropagation(); setCropType("profile"); setCropOpen(true); }}
                >
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="p-6 pt-16 sm:pt-18 md:pt-20">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-8">
              <div className="flex-1 min-w-0">
                {/* Name and Verification */}
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 truncate">
                    {profile?.personalDetails?.firstName || "Your Name"}{" "}
                    {profile?.personalDetails?.lastName || ""}
                  </h1>
                  {profile?.verified && (
                    <Verified className="h-6 w-6 text-blue-500 flex-shrink-0" />
                  )}
                </div>

                {/* Professional Headline */}
                <p className="text-lg text-gray-600 mb-3 font-normal">
                  {profile?.personalDetails?.professionalHeadline || "Add a professional headline"}
                </p>

                {/* Location, Email, Website */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
                  {profile?.location && (
                    <div className="flex items-center min-w-0">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                  )}
                  {typeof profile?.userId === 'object' && profile.userId.email && (
                    <div className="flex items-center min-w-0">
                      <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{profile.userId.email}</span>
                    </div>
                  )}
                  {profile?.socialLinks?.website && (
                    <div className="flex items-center min-w-0">
                      <Globe className="h-4 w-4 mr-1 flex-shrink-0" />
                      <a
                        href={profile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate"
                      >
                        {profile.socialLinks.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>

                {/* Followers/Following Stats */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">
                      {profile?.followers || 0}
                    </span>
                    <span className="text-gray-600 ml-1">followers</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">
                      {profile?.following || 0}
                    </span>
                    <span className="text-gray-600 ml-1">connections</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row lg:flex-col xl:flex-row gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={onEditPersonal}
                  className="flex-1 sm:flex-initial text-xs sm:text-sm"
                >
                  <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
                <Button variant="outline" onClick={handleShare} className="flex-1 sm:flex-initial text-xs sm:text-sm">
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Share</span>
                  <span className="sm:hidden">Share</span>
                </Button>
                {/* <Button variant="outline" size="icon" className="flex-shrink-0">
                  <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button> */}
              </div>
            </div>
          </div>
        </div>

        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Share Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{shareUrl}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={handleCopy} className="gap-1">
                  {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => openShareLink(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}>
                  LinkedIn
                </Button>
                <Button variant="outline" onClick={() => openShareLink(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`)}>
                  Twitter
                </Button>
                <Button variant="outline" onClick={() => openShareLink(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}>
                  Facebook
                </Button>
                <Button variant="outline" onClick={() => openShareLink(`https://wa.me/?text=${encodedText}%0A%0A${encodedUrl}`)}>
                  WhatsApp
                </Button>
                <Button variant="outline" onClick={() => openShareLink(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`)}>
                  Telegram
                </Button>
                <Button variant="outline" onClick={() => openShareLink(`mailto:?subject=${encodeURIComponent(`${displayName} — CareerBox Profile`)}&body=${encodedText}%0A%0A${encodedUrl}`)}>
                  <MailIcon className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" onClick={() => openShareLink(`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(`${displayName} — CareerBox Profile`)}&body=${encodedText}%0A%0A${encodedUrl}`)}>
                  Gmail
                </Button>
              </div>
              <div className="flex items-center justify-end">
                <Button onClick={() => setShareOpen(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* About Section - Separate Card */}
        {profile?.personalDetails?.aboutMe &&
          profile.personalDetails.aboutMe !== "Tell us a bit about yourself" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {profile.personalDetails.aboutMe}
              </p>
            </div>
          )}

        {/* Professional Badges & Interests - Separate Card */}
        {((profile?.personalDetails?.professionalBadges && profile.personalDetails.professionalBadges.length > 0) ||
          (profile?.personalDetails?.interests && profile.personalDetails.interests.length > 0)) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Professional Badges */}
              {profile?.personalDetails?.professionalBadges && profile.personalDetails.professionalBadges.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Professional Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.personalDetails.professionalBadges.map((badge, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {badge}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {profile?.personalDetails?.interests && profile.personalDetails.interests.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.personalDetails.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        <ImageCropperDialog
          key={cropType}
          open={cropOpen}
          onOpenChange={setCropOpen}
          type={cropType}
          targetWidth={cropType === "cover" ? 1600 : 512}
          targetHeight={cropType === "cover" ? 400 : 512}
          initialImageUrl={cropType === "cover" ? profile?.coverImage : profile?.profileImage}
          onCropped={handleCropped}
          onDelete={handleDelete}
        />
        <ImageViewerDialog
          className="cb-image-viewer"
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          type={viewerType}
          imageUrl={viewerType === "cover" ? profile?.coverImage : profile?.profileImage}
          showActions={!readOnly}
          onEdit={() => { setCropType(viewerType); setCropOpen(true); }}
          onUpdatePhoto={() => { setCropType(viewerType); setCropOpen(true); }}
          onDelete={() => { setCropType(viewerType); handleDelete(); }}
        />
      </div>
    </div>
  );
});

ProfileHeader.displayName = "ProfileHeader";

