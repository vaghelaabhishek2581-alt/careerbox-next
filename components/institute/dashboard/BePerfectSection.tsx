"use client";

import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

export function BePerfectSection() {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Be Perfect</h2>
          <p className="text-sm text-gray-500">Complete the pending tasks regularly and grow 10x faster</p>
        </div>
        
        <div className="bg-[#FFF9E6] border border-[#FFEBAA] rounded-xl p-4 flex items-center justify-between relative">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Add description</h3>
            <p className="text-xs text-gray-600 mt-1">Add a quick description to get your Page discovered in search results.</p>
          </div>
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
