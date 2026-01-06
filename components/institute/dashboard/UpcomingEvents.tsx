"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock } from "lucide-react";

const events = [
  {
    title: "Annual Tech Symposium",
    date: "28 Dec, 2025",
    time: "09:00 AM",
    location: "Main Auditorium",
    type: "Conference"
  },
  {
    title: "Alumni Meetup 2025",
    date: "05 Jan, 2026",
    time: "06:00 PM",
    location: "University Gardens",
    type: "Networking"
  },
  {
    title: "Career Fair",
    date: "15 Jan, 2026",
    time: "10:00 AM",
    location: "Exhibition Hall",
    type: "Placement"
  }
];

export function UpcomingEvents() {
  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-bold text-gray-900">Upcoming Events</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 h-8">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex flex-col space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{event.title}</h4>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {event.type}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1.5 text-gray-400" />
                  {event.date}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1.5 text-gray-400" />
                  {event.time}
                </div>
                <div className="flex items-center text-xs text-gray-500 col-span-2">
                  <MapPin className="h-3 w-3 mr-1.5 text-gray-400" />
                  {event.location}
                </div>
              </div>
            </div>
          ))}
          <Button className="w-full h-9 text-xs" variant="outline">
            <Calendar className="h-3.5 w-3.5 mr-2" />
            Create New Event
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
