"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function InstituteProfileCard() {
  const { selectedInstitute, currentInstitute } = useSelector((state: RootState) => state.institute as any);
  const institute = selectedInstitute || currentInstitute;

  const coverImage = institute?.coverImage || "";
  const logo = institute?.logo || "";
  const name = institute?.name || institute?.instituteName || "Institute";
  const slug = institute?.slug || institute?._id || "";
  const getInitials = (n: string) => {
    if (!n) return "IN";
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="relative h-24 bg-gradient-to-r from-indigo-500 to-purple-600">
        {coverImage && (
          <img
            src={coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
        )}
      </div>
      <div className="px-6 pb-6 relative">
        <div className="flex items-end -mt-10 mb-4">
          <div className="h-20 w-20 rounded-xl bg-white border-2 border-white shadow-lg overflow-hidden">
            {logo ? (
              <img src={logo} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl font-semibold">
                {getInitials(name)}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{name}</h2>
        </div>

        <div className="flex gap-2">
          <Link href={slug ? `/recommendation-collections/${slug}` : "/recommendation-collections"}>
            <Button variant="outline" className="flex-1 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 h-9 text-xs font-medium">
              Public View
            </Button>
          </Link>
          <Link href="/institute/courses">
            <Button className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 h-9 text-xs font-medium">
              <Plus className="h-3 w-3 mr-1" /> Create
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
