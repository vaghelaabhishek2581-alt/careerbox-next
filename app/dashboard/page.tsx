"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  BookOpen,
  FileText,
  Star,
  ArrowRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import UniversalSearch from "@/components/search/UniversalSearch";
import RoleDashboard from "@/components/dashboard/RoleDashboard";
import { SocketDebug } from "@/components/debug/SocketDebug";
import { ProfileGuard } from "@/components/guards/ProfileGuard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/signup");
      return;
    }

    // Session is available, no need to refresh
    setIsCheckingSession(false);
  }, [session, status, router]);

  // Remove redundant onboarding check - middleware handles this
  // The middleware already redirects users who need onboarding
  // If we reach this page, the user is properly authenticated and doesn't need onboarding

  if (status === "loading" || isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Always show the main dashboard for all users
  // Role-specific functionality is handled within the dashboard components

  // Show enhanced public dashboard with search
  return (
    <ProfileGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              Welcome to CareerBox, {session.user?.name}!
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover opportunities, connect with professionals, and advance your career
            </p>
          </div>

          {/* Universal Search */}
          <div className="max-w-4xl mx-auto">
            <UniversalSearch
              placeholder="Search institutes, jobs, courses, exams, or people..."
              showFilters={true}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Institutes</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">456</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,890</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Professionals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,345</div>
                <p className="text-xs text-muted-foreground">
                  +20% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Featured Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Featured Opportunities</h2>
              <Link href="/search">
                <Button variant="outline">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <Tabs defaultValue="jobs" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="institutes">Institutes</TabsTrigger>
                <TabsTrigger value="exams">Exams</TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">Software Engineer</CardTitle>
                            <CardDescription>Tech Corp • Remote</CardDescription>
                          </div>
                          <Badge variant="outline">Full-time</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Join our team to build innovative software solutions...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="text-xs">React</Badge>
                            <Badge variant="secondary" className="text-xs">Node.js</Badge>
                          </div>
                          <Button size="sm">Apply</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="courses" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">Full Stack Development</CardTitle>
                            <CardDescription>Tech University • 12 weeks</CardDescription>
                          </div>
                          <Badge variant="outline">Beginner</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Learn modern web development with React and Node.js...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">4.8 (234 reviews)</span>
                          </div>
                          <Button size="sm">Enroll</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="institutes" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">Tech University</CardTitle>
                            <CardDescription>Engineering • Mumbai</CardDescription>
                          </div>
                          <Badge variant="default">Verified</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Premier engineering institute with excellent placement records...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            15 courses • 2,500 students
                          </div>
                          <Button size="sm">View Profile</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="exams" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">Software Engineering Test</CardTitle>
                            <CardDescription>Tech Corp • 60 minutes</CardDescription>
                          </div>
                          <Badge variant="outline">Recruitment</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Test your programming skills and problem-solving abilities...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            150 registrations
                          </div>
                          <Button size="sm">Register</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Ready to take your career to the next level?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Join thousands of professionals who have found their dream opportunities on CareerBox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/user/upgrade">
                  <Button size="lg" variant="secondary">
                    <Plus className="h-5 w-5 mr-2" />
                    Upgrade Account
                  </Button>
                </Link>
                <Link href="/search">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Explore Opportunities
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Temporary Socket Debug Component */}
      <SocketDebug />
      </div>
    </ProfileGuard>
  );
}
