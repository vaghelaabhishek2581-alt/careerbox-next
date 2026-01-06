"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight, Rocket } from "lucide-react";

const profileSteps = [
  { label: "Basic Information", completed: true },
  { label: "Contact Details", completed: true },
  { label: "Profile Picture & Cover", completed: true },
  { label: "About Institute", completed: false },
  { label: "Courses & Programs", completed: false },
  { label: "Faculty Members", completed: false },
];

export function ProfileCompletion() {
  const completedSteps = profileSteps.filter(step => step.completed).length;
  const progress = Math.round((completedSteps / profileSteps.length) * 100);
  const isComplete = progress === 100;

  return (
    <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-600" />
            Profile Completion
          </CardTitle>
          <span className="text-sm font-bold text-blue-600">{progress}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {profileSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {step.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                )}
                <span className={step.completed ? "text-gray-700" : "text-gray-500"}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link href="/institute/profile" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={isComplete}>
                {isComplete ? "Profile Completed" : "Complete Your Profile"}
                {!isComplete && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
              disabled={!isComplete}
            >
              Publish Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
