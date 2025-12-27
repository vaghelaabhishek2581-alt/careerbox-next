"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Package, 
  Eye, 
  Search as SearchIcon, 
  MessageSquare, 
  MousePointerClick,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const stats = [
  { label: "Leads", value: "6", change: "+167.4%", trend: "up", subtext: "New Leads", icon: Users },
  { label: "Sales", value: "50", change: "-20.4%", trend: "down", subtext: "New Sales", icon: Package },
  { label: "Followers", value: "6", change: "+167.4%", trend: "up", subtext: "New Followers", icon: Users },
  { label: "Visitors", value: "50", change: "-20.4%", trend: "down", subtext: "New Profile Visits", icon: Eye },
  { label: "Search Appear", value: "6", change: "+167.4%", trend: "up", subtext: "New Leads", icon: SearchIcon },
  { label: "Impressions", value: "50", change: "-20.4%", trend: "down", subtext: "New Messages", icon: MessageSquare },
  { label: "Clicks", value: "76", change: "+167.4%", trend: "up", subtext: "New Followers", icon: MousePointerClick },
  { label: "Unique Click", value: "50", change: "-20.4%", trend: "down", subtext: "New Profile Visits", icon: MousePointerClick },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">{stat.label} <span className="text-gray-400 font-normal">({100})</span></span>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              <div className={`flex items-center text-xs font-medium mb-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                {stat.change}
              </div>
            </div>
            <p className="text-xs text-gray-500">{stat.subtext}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Last 7 Days</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
