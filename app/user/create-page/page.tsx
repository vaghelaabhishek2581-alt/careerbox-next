"use client";

import Link from "next/link";
import { Building2, Briefcase, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CreatePage() {
  const options = [
    {
      title: "Create Institute Page",
      description: "For educational institutions, colleges, and universities to manage admissions, courses, and student placements.",
      icon: Building2,
      href: "/user/register-institute",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      buttonVariant: "default" as const,
      gradient: "from-blue-600 to-purple-600",
    },
    {
      title: "Create Business Page",
      description: "For companies and organizations to post jobs, manage recruitment, and showcase their brand to users.",
      icon: Briefcase,
      href: "/user/register-business",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      buttonVariant: "default" as const,
      gradient: "from-purple-600 to-blue-600",
    },
  ];

  return (
    <div className="container max-w-4xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Create a New Page</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Expand your presence on CareerBox. Choose the type of page you want to create to get started.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {options.map((option) => (
          <Card key={option.title} className="group hover:shadow-xl transition-all duration-300 bg-white hover:bg-blue-50 border-blue-300 hover:border-2 hover:border-blue-500 rounded-3xl overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${option.gradient}`} />
            <CardHeader className="pb-4">
              <div className={`w-14 h-14 ${option.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <option.icon className={`h-7 w-7 ${option.color}`} />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {option.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-600 mb-8 min-h-[60px]">
                {option.description}
              </CardDescription>
              <Link href={option.href} className="block">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-between" size="lg">
                  <span>Get Started</span>
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center bg-blue-50 border-blue-500 rounded-3xl hover:border-2 p-8 max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Need help deciding?</h3>
        <p className="text-blue-700 mb-6">
          Our support team can help you choose the right page type for your needs.
        </p>
        <Link href="/contact">
          <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  );
}
