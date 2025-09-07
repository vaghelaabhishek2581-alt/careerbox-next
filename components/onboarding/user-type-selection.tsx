"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GraduationCap, Briefcase } from "lucide-react";

interface UserTypeSelectionProps {
  selectedType: "student" | "professional" | null;
  onSelect: (type: "student" | "professional") => void;
}

export default function UserTypeSelection({
  selectedType,
  onSelect,
}: UserTypeSelectionProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card
        className={cn(
          "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
          selectedType === "student"
            ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
            : "hover:border-gray-300"
        )}
        onClick={() => onSelect("student")}
      >
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-blue-100 text-blue-600">
            <GraduationCap className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl">Student</CardTitle>
          <CardDescription>
            Currently pursuing education and planning career path
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              Career guidance and planning
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              Internship opportunities
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              Skill development resources
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
          selectedType === "professional"
            ? "ring-2 ring-green-500 bg-green-50 border-green-200"
            : "hover:border-gray-300"
        )}
        onClick={() => onSelect("professional")}
      >
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-green-100 text-green-600">
            <Briefcase className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl">Professional</CardTitle>
          <CardDescription>
            Working professional looking to advance career
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              Career advancement strategies
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              Professional networking
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              Leadership development
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
