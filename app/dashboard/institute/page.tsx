"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchUserInstitutes, setSelectedInstitute } from "@/lib/redux/slices/instituteSlice";
import { Building2, Users, BookOpen, BarChart3, Settings, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InstituteSelector from "@/components/institute-selector";

export default function InstituteDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { userInstitutes, selectedInstitute, loading, error } = useSelector((state: RootState) => state.institute);

    // Ensure userInstitutes is an array
    const institutesArray = Array.isArray(userInstitutes) ? userInstitutes : [];
    console.log('Dashboard: institutesArray:', institutesArray);

    // Fetch user institutes on component mount
    useEffect(() => {
        if (session?.user?.id) {
            console.log('Dashboard: Dispatching fetchUserInstitutes for user:', session.user.id);
            dispatch(fetchUserInstitutes());
        }
    }, [session?.user?.id, dispatch]);

    // Auto-select first institute if no institute is selected but institutes are available
    useEffect(() => {
        if (!loading && institutesArray.length > 0 && !selectedInstitute) {
            console.log('Dashboard: Auto-selecting first institute:', institutesArray[0]);
            dispatch(setSelectedInstitute(institutesArray[0]));
        }
    }, [loading, institutesArray, selectedInstitute, dispatch]);

    // Debug state changes
    useEffect(() => {
        console.log('Dashboard: State changed:');
        console.log('  userInstitutes:', userInstitutes);
        console.log('  selectedInstitute:', selectedInstitute);
        console.log('  loading:', loading);
        console.log('  error:', error);
        console.log('  institutesArray:', institutesArray);
    }, [userInstitutes, selectedInstitute, loading, error, institutesArray]);

    // Use data from selected institute or fallback to default values
    const stats = [
        {
            title: "Total Students",
            value: selectedInstitute?.studentCount?.toString() || "0",
            change: "+12%",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Active Courses",
            value: selectedInstitute?.courseCount?.toString() || "0",
            change: "+3",
            icon: BookOpen,
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            title: "Faculty Members",
            value: selectedInstitute?.facultyCount?.toString() || "0",
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

    // Get institute details for display
    const instituteDetails = selectedInstitute ? {
        name: selectedInstitute.name,
        location: `${selectedInstitute.address?.city || selectedInstitute.city || 'Unknown City'}, ${selectedInstitute.address?.state || selectedInstitute.state || 'Unknown State'}`,
        establishmentYear: selectedInstitute.establishmentYear,
        isVerified: selectedInstitute.isVerified,
        description: selectedInstitute.description,
        website: selectedInstitute.website,
        email: selectedInstitute.email,
        phone: selectedInstitute.phone,
        contactPerson: selectedInstitute.contactPerson
    } : null;

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
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {instituteDetails?.name || "Institute Dashboard"}
                        </h1>
                        {instituteDetails?.isVerified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                ✓ Verified
                            </Badge>
                        )}
                    </div>
                    <div className="mt-2 space-y-1">
                        <p className="text-gray-600">
                            {instituteDetails
                                ? `Managing ${instituteDetails.name} - ${instituteDetails.location}`
                                : "Welcome back! Here's what's happening at your institute."
                            }
                        </p>
                        {instituteDetails && (
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                {instituteDetails.establishmentYear && (
                                    <span>Est. {instituteDetails.establishmentYear}</span>
                                )}
                                {instituteDetails.email && (
                                    <span>{instituteDetails.email}</span>
                                )}
                                {instituteDetails.phone && (
                                    <span>{instituteDetails.phone}</span>
                                )}
                            </div>
                        )}
                    </div>
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

            {/* Institute Selector - Show if user has multiple institutes */}
            {institutesArray.length > 1 && (
                <div className="mb-6">
                    <InstituteSelector variant="dropdown" />
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                    <span className="mt-4 text-gray-600 font-medium">Loading institute data...</span>
                    <span className="mt-1 text-sm text-gray-500">Please wait while we fetch your institute information</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center">
                        <div className="text-red-600 font-medium">Error loading institutes:</div>
                        <div className="ml-2 text-red-600">{error}</div>
                    </div>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => dispatch(fetchUserInstitutes())}
                    >
                        Try Again
                    </Button>
                </div>
            )}


            {/* No Institute Found State */}
            {!loading && !error && institutesArray.length === 0 && (
                <div className="text-center py-16">
                    <Building2 className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No institutes found</h3>
                    <p className="mt-2 text-gray-500 max-w-md mx-auto">
                        You don't have any institutes associated with your account. This might be because your institute registration is still pending or there was an issue during setup.
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => dispatch(fetchUserInstitutes())}
                        >
                            Refresh
                        </Button>
                        <Button onClick={() => router.push("/register/institute")}>
                            Register Institute
                        </Button>
                    </div>
                </div>
            )}

            {/* Institute Overview Card - Only show if institute is selected */}
            {selectedInstitute && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Institute Overview
                        </CardTitle>
                        <CardDescription>
                            Complete information about your selected institute
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div><span className="text-gray-500">Name:</span> <span className="font-medium">{instituteDetails?.name}</span></div>
                                    <div><span className="text-gray-500">Location:</span> <span>{instituteDetails?.location}</span></div>
                                    {instituteDetails?.establishmentYear && (
                                        <div><span className="text-gray-500">Established:</span> <span>{instituteDetails.establishmentYear}</span></div>
                                    )}
                                    <div><span className="text-gray-500">Status:</span>
                                        <Badge variant={selectedInstitute.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                                            {selectedInstitute.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div><span className="text-gray-500">Email:</span> <span>{instituteDetails?.email}</span></div>
                                    <div><span className="text-gray-500">Phone:</span> <span>{instituteDetails?.phone}</span></div>
                                    <div><span className="text-gray-500">Contact Person:</span> <span>{instituteDetails?.contactPerson}</span></div>
                                    {instituteDetails?.website && (
                                        <div><span className="text-gray-500">Website:</span>
                                            <a href={instituteDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                                {instituteDetails.website}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Statistics</h4>
                                <div className="space-y-2 text-sm">
                                    <div><span className="text-gray-500">Students:</span> <span className="font-medium">{selectedInstitute.studentCount || 0}</span></div>
                                    <div><span className="text-gray-500">Courses:</span> <span className="font-medium">{selectedInstitute.courseCount || 0}</span></div>
                                    <div><span className="text-gray-500">Faculty:</span> <span className="font-medium">{selectedInstitute.facultyCount || 0}</span></div>
                                    <div><span className="text-gray-500">Verified:</span>
                                        <Badge variant={selectedInstitute.isVerified ? 'default' : 'secondary'} className="ml-2">
                                            {selectedInstitute.isVerified ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {instituteDetails?.description && (
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">{instituteDetails.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Stats Grid - Only show if institute is selected */}
            {selectedInstitute && (
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
            )}

            {/* Quick Actions - Only show if institute is selected */}
            {selectedInstitute && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks for managing your institute</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => {
                                const IconComponent = action.icon;
                                return (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className={`h-auto p-4 flex flex-col items-center gap-3 hover:shadow-md transition-all ${action.color.replace('bg-', 'hover:bg-').replace('hover:bg-', 'hover:bg-opacity-10 hover:border-')}`}
                                        onClick={() => router.push(action.href)}
                                    >
                                        <IconComponent className="w-8 h-8" />
                                        <div className="text-center">
                                            <div className="font-medium">{action.title}</div>
                                            <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Activity - Only show if institute is selected */}
            {selectedInstitute && (
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
            )}
        </div>
    );
}