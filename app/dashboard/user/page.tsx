"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/logo";
import {
  User,
  Briefcase,
  Target,
  TrendingUp,
  Award,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface DashboardStats {
  completedCourses: number;
  skillsAssessed: number;
  careerGoals: number;
  networkConnections: number;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isLoading } = useAuth({
    requiredRole: "user",
    redirectTo: "/dashboard",
  });

  const stats: DashboardStats = {
    completedCourses: 12,
    skillsAssessed: 8,
    careerGoals: 3,
    networkConnections: 45,
  };

  if (isLoading || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Logo />
              <nav className="hidden md:flex items-center space-x-6">
                <span className="text-gray-600">Dashboard</span>
                <span className="text-gray-400">/</span>
                <span className="text-blue-600 font-medium">User</span>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/api/auth/signout")}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold">
                {session.user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session.user.name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-gray-600">
                Ready to accelerate your career growth today?
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Completed Courses
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completedCourses}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Skills Assessed
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.skillsAssessed}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Career Goals
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.careerGoals}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Network</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.networkConnections}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Career Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Career Progress
                  </CardTitle>
                  <CardDescription>
                    Your journey to career excellence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Overall Progress
                      </span>
                      <span className="text-sm text-gray-500">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Skills Development
                      </span>
                      <span className="text-sm text-gray-500">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Goal Achievement
                      </span>
                      <span className="text-sm text-gray-500">50%</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Recent Activities
                  </CardTitle>
                  <CardDescription>Your latest accomplishments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Completed "Advanced React" course
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Updated career goal: "Team Lead"
                      </p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Connected with Sarah Johnson
                      </p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tab contents remain the same */}
        </Tabs>
      </div>
    </div>
  );
}
