"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { Card } from "@/components/ui/card";
import { MapPin, ShieldCheck, Building, Edit2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function UserProfileCard() {
  const profile = useAppSelector((state) => state.profile.profile);

  const userName =
    (profile?.personalDetails?.firstName && profile?.personalDetails?.lastName
      ? `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`
      : profile?.personalDetails?.firstName) || "Your Name";
  const bio =
    profile?.bio ||
    profile?.personalDetails?.professionalHeadline ||
    profile?.personalDetails?.aboutMe ||
    "";
  const location = profile?.location || "";
  const profileImage = profile?.profileImage || "";
  const coverImage = profile?.coverImage || "";
  const verified = !!profile?.verified;
  const currentWork =
    profile?.workExperiences?.find((we) =>
      Array.isArray(we.positions) ? we.positions.some((p) => p.isCurrent) : false
    ) || profile?.workExperiences?.[0];
  const companyName = currentWork?.company || "";
  const companyLogo = currentWork?.companyLogo || "";

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <Link href="/user" className="block relative h-24 bg-gradient-to-r from-indigo-500 to-purple-600">
        {coverImage && (
          <img
            src={coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
        )}
      </Link>
      <div className="px-6 pb-6 relative">
        <div className="flex items-end justify-between -mt-12">
          <Link href="/user" className="inline-block">
            <div className="h-24 w-24 rounded-full bg-white border-2 border-white shadow-lg overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500 text-xl font-semibold">
                  {userName?.[0] || "U"}
                </div>
              )}
            </div>
          </Link>
          <Link href="/user">
            <Button variant="outline" className="rounded-full h-8 px-2 border-blue-200 text-blue-700 hover:bg-blue-50">
              <Edit2 className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Link href="/user" className="block mt-3">
          <div className="flex items-center gap-1">
            <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
            {verified && <ShieldCheck className="h-5 w-5 text-blue-600" />}
          </div>
          {bio && <p className="mt-1 text-sm text-gray-700">{bio}</p>}
          {location && (
            <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </Link>
        {companyName && (
          <Link href="/user" className="block mt-3">
            <div className="flex items-center gap-3 py-3">
              <div className="overflow-hidden">
                {companyLogo ? (
                  <img src={companyLogo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Building className="h-6 w-6 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-gray-900 truncate">{companyName}</div>
            </div>
          </Link>
        )}
      </div>
    </Card>
  );
}
