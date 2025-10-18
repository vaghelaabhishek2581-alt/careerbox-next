"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { BookOpen, Plus, Search, Filter, Users, Clock, Star, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchCourses, deleteCourse, clearError } from "@/lib/redux/slices/courseSlice";
import { fetchUserInstitutes } from "@/lib/redux/slices/instituteSlice";
import { useToast } from "@/components/ui/use-toast";
import InstituteSelectionModal from "@/components/institute/InstituteSelectionModal";
import { CourseForm } from "@/components/course/CourseForm";

export default function InstituteCourses() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showInstituteModal, setShowInstituteModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Redux state
  const { courses, loading, error } = useSelector((state: RootState) => state.courses);
  const { selectedInstitute, userInstitutes, loading: instituteLoading } = useSelector((state: RootState) => state.institute);


  // Initialize and fetch user institutes if needed
  useEffect(() => {
    if (!hasInitialized && !instituteLoading) {
      setHasInitialized(true);

      if (userInstitutes.length === 0) {
        // Fetch user institutes - this will auto-select if only one exists
        dispatch(fetchUserInstitutes());
      }
    }
  }, [dispatch, hasInitialized, instituteLoading, userInstitutes.length]);

  // Handle institute selection and course loading
  useEffect(() => {
    if (hasInitialized && !instituteLoading) {
      if (selectedInstitute) {
        // Fetch courses for the selected institute
        dispatch(fetchCourses({ instituteId: selectedInstitute._id }));
        setShowInstituteModal(false);
      } else if (userInstitutes.length > 1) {
        // Show modal only if multiple institutes exist but none selected
        setShowInstituteModal(true);
      }
    }
  }, [dispatch, selectedInstitute, userInstitutes.length, hasInitialized, instituteLoading]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (!session.user?.roles?.includes("institute")) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
    };
  }, [dispatch, searchTerm, filterStatus]);

  const coursesArray = Array.isArray(courses) ? courses : [];
  const filteredCourses = coursesArray.filter(course => {
    const instructorName = typeof course.instructor === 'string' 
      ? course.instructor 
      : course.instructor?.name || '';
    
    const matchesSearch = (course.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (instructorName.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (course.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (course.courseType?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "active" && course.isPublished) ||
                         (filterStatus === "draft" && !course.isPublished);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (isPublished: boolean) => {
    return isPublished 
      ? 'bg-green-100 text-green-700'
      : 'bg-yellow-100 text-yellow-700';
  };

  const getStatusLabel = (isPublished: boolean) => {
    return isPublished ? 'Published' : 'Draft';
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await dispatch(deleteCourse(courseId)).unwrap();
        toast({
          title: "Success",
          description: "Course deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowCourseModal(true);
  };

  // Show loading state while checking for institutes or loading courses
  if (status === "loading" || loading || instituteLoading || !hasInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            {!hasInitialized ? "Initializing..." : "Loading courses..."}
          </p>
        </div>
      </div>
    );
  }

  // Show message if no institute is selected and modal is not showing
  if (!selectedInstitute && !showInstituteModal && hasInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <BookOpen className="h-12 w-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Institute Selected</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please select an institute to manage courses.
          </p>
          <Button 
            onClick={() => setShowInstituteModal(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Select Institute
          </Button>
        </div>
      </div>
    );
  }

  if (!session?.user?.roles?.includes("institute")) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-2">
            Create, manage, and monitor your institute's courses
          </p>
        </div>
        <Button
          onClick={handleCreateCourse}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{coursesArray.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coursesArray.filter(c => c.isPublished).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coursesArray.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coursesArray.length > 0 ? (coursesArray.reduce((sum, course) => sum + (course.rating || 0), 0) / coursesArray.length).toFixed(1) : '0.0'}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter: {filterStatus === "all" ? "All" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>
              All Courses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("active")}>
              Published
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("draft")}>
              Draft
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge className={getStatusColor(course.isPublished)}>
                  {getStatusLabel(course.isPublished)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      •••
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/institute/courses/${course._id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteCourse(course._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {(() => {
                        const instructorName = typeof course.instructor === 'string' 
                          ? course.instructor 
                          : course.instructor?.name || '';
                        return instructorName ? instructorName.split(' ').map((n: string) => n[0]).join('') : 'IN';
                      })()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {typeof course.instructor === 'string' 
                        ? course.instructor 
                        : course.instructor?.name || 'No Instructor Assigned'}
                    </p>
                    <p className="text-xs text-gray-500">Instructor</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration} weeks
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.enrollmentCount} enrolled
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ${course.price}
                  </div>
                </div>

                <Badge variant="secondary" className="w-fit">
                  {course.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first course"
            }
          </p>
          {!searchTerm && filterStatus === "all" && (
            <Button
              onClick={handleCreateCourse}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Course
            </Button>
          )}
        </div>
      )}

      {/* Institute Selection Modal */}
      <InstituteSelectionModal
        isOpen={showInstituteModal}
        onClose={() => setShowInstituteModal(false)}
        title="Select Institute for Course Management"
        description="Please select an institute to manage courses"
      />

      {/* Course Form Modal */}
      <CourseForm
        open={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setEditingCourse(null);
        }}
        course={editingCourse}
        onSuccess={(course) => {
          // Optionally refresh courses or handle success
          console.log('Course saved:', course);
        }}
      />
    </div>
  );
}
