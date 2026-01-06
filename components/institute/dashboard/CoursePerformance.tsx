"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Star } from "lucide-react";

const courses = [
  {
    name: "Full Stack Development",
    students: 124,
    rating: 4.8,
    progress: 85,
    revenue: "$12,400"
  },
  {
    name: "Data Science Masterclass",
    students: 89,
    rating: 4.6,
    progress: 62,
    revenue: "$8,900"
  },
  {
    name: "Digital Marketing 101",
    students: 256,
    rating: 4.9,
    progress: 94,
    revenue: "$15,200"
  }
];

export function CoursePerformance() {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-bold text-gray-900">Top Performing Courses</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 h-8">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {courses.map((course, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{course.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center"><Users className="h-3 w-3 mr-1" /> {course.students}</span>
                      <span className="flex items-center"><Star className="h-3 w-3 mr-1 text-yellow-400 fill-yellow-400" /> {course.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{course.revenue}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Occupancy</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
