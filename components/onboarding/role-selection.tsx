"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  User,
  Building2,
  Briefcase,
  GraduationCap,
  Users,
  Target,
  CheckCircle,
} from "lucide-react";

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  features: string[];
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    id: "student",
    title: "Student",
    description: "Currently pursuing education and planning career path",
    icon: GraduationCap,
    features: [
      "Career guidance",
      "Skill assessments",
      "Internship opportunities",
      "Academic support",
    ],
    color: "blue",
  },
  {
    id: "professional",
    title: "Professional",
    description: "Working professional looking to advance career",
    icon: User,
    features: [
      "Career advancement",
      "Skill development",
      "Leadership training",
      "Network building",
    ],
    color: "green",
  },
  {
    id: "business_owner",
    title: "Business Owner",
    description: "Running or managing a business, need talent solutions",
    icon: Briefcase,
    features: [
      "Talent acquisition",
      "Employee training",
      "Business analytics",
      "Team management",
    ],
    color: "purple",
  },
  {
    id: "hr_manager",
    title: "HR Manager",
    description: "Managing human resources and talent development",
    icon: Users,
    features: [
      "Recruitment tools",
      "Employee development",
      "Performance tracking",
      "Analytics",
    ],
    color: "orange",
  },
  {
    id: "educator",
    title: "Educator",
    description: "Teaching or training others in professional skills",
    icon: Building2,
    features: [
      "Curriculum development",
      "Student placement",
      "Industry partnerships",
      "Training programs",
    ],
    color: "teal",
  },
  {
    id: "career_counselor",
    title: "Career Counselor",
    description: "Helping others navigate their career paths",
    icon: Target,
    features: [
      "Client management",
      "Assessment tools",
      "Resource library",
      "Progress tracking",
    ],
    color: "pink",
  },
];

interface RoleSelectionProps {
  selectedRoles: string[];
  onToggleRole: (roleId: string) => void;
}

export default function RoleSelection({
  selectedRoles,
  onToggleRole,
}: RoleSelectionProps) {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roleOptions.map((role) => {
          const IconComponent = role.icon;
          const isSelected = selectedRoles.includes(role.id);

          return (
            <Card
              key={role.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                isSelected
                  ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                  : "hover:border-gray-300"
              )}
              onClick={() => onToggleRole(role.id)}
            >
              <CardHeader className="text-center pb-4">
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                    isSelected
                      ? "bg-blue-600 text-white"
                      : `bg-${role.color}-100 text-${role.color}-600`
                  )}
                >
                  <IconComponent className="h-8 w-8" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <CardDescription className="text-center">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {role.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isSelected ? "bg-blue-600" : `bg-${role.color}-400`
                        )}
                      ></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedRoles.length > 0 && (
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Selected Roles:
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map((roleId) => {
              const role = roleOptions.find((r) => r.id === roleId);
              return (
                <Badge
                  key={roleId}
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {role?.title}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { roleOptions };
