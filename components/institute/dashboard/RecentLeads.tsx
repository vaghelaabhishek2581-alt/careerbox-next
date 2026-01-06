"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

const leads = [
  {
    name: "Rahul Kumar",
    course: "B.Tech Computer Science",
    date: "2 mins ago",
    status: "New",
    avatar: ""
  },
  {
    name: "Priya Sharma",
    course: "MBA Marketing",
    date: "1 hour ago",
    status: "Contacted",
    avatar: ""
  },
  {
    name: "Amit Patel",
    course: "Data Science Certification",
    date: "3 hours ago",
    status: "Interested",
    avatar: ""
  },
  {
    name: "Sneha Gupta",
    course: "UI/UX Design",
    date: "5 hours ago",
    status: "New",
    avatar: ""
  },
  {
    name: "Vikram Singh",
    course: "Digital Marketing",
    date: "1 day ago",
    status: "Enrolled",
    avatar: ""
  }
];

export function RecentLeads() {
  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-bold text-gray-900">Recent Leads</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 h-8">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.map((lead, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={lead.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {lead.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900 leading-none">{lead.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{lead.course}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-gray-900">{lead.status}</p>
                  <p className="text-[10px] text-gray-500">{lead.date}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
