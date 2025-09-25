"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Building2, Users, BookOpen, BarChart3, Settings, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function InstituteDashboard() {
    const { data: session } = useSession();
    const router = useRouter();

    const stats = [
        {
            title: "Total Students",
            value: "1,234",
            change: "+12%",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Active Courses",
            value: "45",
            change: "+3",
            icon: BookOpen,
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            title: "Faculty Members",
            value: "89",
            change: "+5",
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
        },
        {
            title: "Completion Rate",
            value: "87%",
            change: "+2%",
            icon: BarChart3,
            color: "text-orange-600",
            bgColor: "bg-orange-100"
        }
    ];

    const quickActions = [
        {
            title: "Add New Course",
            description: "Create and publish a new course",
            icon: Plus,
            href: "/dashboard/institute/courses/new",
            color: "bg-blue-600 hover:bg-blue-700"
        },
        {
            title: "Manage Students",
            description: "View and manage student enrollments",
            icon: Users,
            href: "/dashboard/institute/students",
            color: "bg-green-600 hover:bg-green-700"
        },
        {
            title: "Institute Profile",
            description: "Update institute information",
            icon: Building2,
            href: "/dashboard/institute/profile",
            color: "bg-purple-600 hover:bg-purple-700"
        },
        {
            title: "Analytics",
            description: "View detailed analytics and reports",
            icon: BarChart3,
            href: "/dashboard/institute/analytics",
            color: "bg-orange-600 hover:bg-orange-700"
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Institute Dashboard</h1>
                    <p className="text-gray-600 mt-2">
                        Welcome back! Here's what's happening at your institute.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        <Building2 className="w-3 h-3 mr-1" />
                        Institute Admin
                    </Badge>
                    <Button onClick={() => router.push("/dashboard/institute/settings")}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                        <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                                    </div>
                                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                        <IconComponent className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>


            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Enrollments</CardTitle>
                        <CardDescription>Latest student enrollments this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            JS
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">John Smith</p>
                                            <p className="text-sm text-gray-600">Computer Science</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">New</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Course Performance</CardTitle>
                        <CardDescription>Top performing courses this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "Web Development", students: 156, rating: 4.8 },
                                { name: "Data Science", students: 134, rating: 4.7 },
                                { name: "Mobile App Development", students: 98, rating: 4.6 },
                                { name: "Digital Marketing", students: 87, rating: 4.5 }
                            ].map((course, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{course.name}</p>
                                        <p className="text-sm text-gray-600">{course.students} students</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">★ {course.rating}</p>
                                        <p className="text-sm text-gray-600">Rating</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
