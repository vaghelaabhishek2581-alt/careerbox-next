"use client";

import { Share2, Pencil } from "lucide-react";

export function BusinessUrlCard() {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col justify-center">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-900">Your Business URL</span>
        <div className="flex gap-2">
          <Share2 className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
          <Pencil className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
      </div>
      <p className="text-xs text-gray-500 truncate">www.careerbox.in/karnavati-university</p>
    </div>
  );
}
