"use client";

import { Button } from "@/components/ui/button";
import { Package, X } from "lucide-react";

export function PremiumBanner() {
  return (
    <div className="lg:col-span-2 bg-gradient-to-r from-[#E6E6FA] to-[#F3E5F5] rounded-xl p-4 flex items-center justify-between border border-purple-300 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-purple-600">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Upgrade to Premium</h3>
          <p className="text-xs text-gray-600">Subscribe to premium and unlock more perks</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-full h-9 text-xs font-semibold shadow-sm">
          Go Premium
        </Button>
        <button className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
