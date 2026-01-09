"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  UserPlus,
  Eye,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export function StatsGrid() {
  const { profile } = useSelector((state: RootState) => state.profile);
  const { applications } = useSelector((state: RootState) => state.applications);

  const stats = [
    {
      label: "Applications",
      value: (applications?.length || 0).toString(),
      change: "+12.5%",
      trend: "up" as const,
      subtext: "Submitted recently",
      icon: FileText,
    },
    {
      label: "Connections",
      value: (profile?.stats?.connectionsCount || 0).toString(),
      change: "+3.2%",
      trend: "up" as const,
      subtext: "New connections",
      icon: Users,
    },
    {
      label: "Profile Views",
      value: (profile?.stats?.profileViews || 0).toString(),
      change: "-1.1%",
      trend: "down" as const,
      subtext: "Last 7 days",
      icon: Eye,
    },
    {
      label: "Followers",
      value: (profile?.followers || 0).toString(),
      change: "+0.8%",
      trend: "up" as const,
      subtext: "New followers",
      icon: UserPlus,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-gray-400" />
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

