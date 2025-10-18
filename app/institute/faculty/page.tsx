"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchFaculty, deleteFaculty, fetchUserInstitutes, FacultyMember } from "@/lib/redux/slices/instituteSlice";
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  Award,
  BookOpen,
  GraduationCap,
  Calendar,
  MapPin
} from "lucide-react";
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
import InstituteSelectionModal from "@/components/institute/InstituteSelectionModal";


export default function InstituteFaculty() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { faculty, loading, error } = useSelector((state: RootState) => state.institute);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterDesignation, setFilterDesignation] = useState("all");

  // Load faculty data on component mount - only if institute is selected
  const { selectedInstitute, userInstitutes, loading: instituteLoading } = useSelector((state: RootState) => state.institute);
  const [showInstituteModal, setShowInstituteModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasFetchedFaculty, setHasFetchedFaculty] = useState(false);
  const [lastSelectedInstituteId, setLastSelectedInstituteId] = useState<string | null>(null);

  useEffect(() => {
    // Only initialize once
    if (!hasInitialized && !instituteLoading) {
      setHasInitialized(true);

      if (userInstitutes.length === 0) {
        // Fetch user institutes if not loaded
        dispatch(fetchUserInstitutes());
      }
    }
  }, [dispatch, hasInitialized, instituteLoading, userInstitutes.length]);

  useEffect(() => {
    // Handle institute selection and faculty loading
    if (hasInitialized && !instituteLoading) {
      if (selectedInstitute) {
        const currentInstituteId = selectedInstitute._id;
        
        // Only fetch faculty if we have a different institute or haven't fetched yet
        if (!hasFetchedFaculty || lastSelectedInstituteId !== currentInstituteId) {
          console.log('Fetching faculty for institute:', currentInstituteId);
          dispatch(fetchFaculty());
          setHasFetchedFaculty(true);
          setLastSelectedInstituteId(currentInstituteId);
        }
        setShowInstituteModal(false);
      } else if (userInstitutes.length > 0) {
        // Show modal if institutes exist but none selected
        setShowInstituteModal(true);
        setHasFetchedFaculty(false);
        setLastSelectedInstituteId(null);
      }
    }
  }, [dispatch, selectedInstitute?._id, userInstitutes.length, hasInitialized, instituteLoading, hasFetchedFaculty, lastSelectedInstituteId]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Reset flags when component unmounts
      setHasFetchedFaculty(false);
      setLastSelectedInstituteId(null);
    };
  }, []);

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

  const departments = [...new Set(faculty.map(f => f.department))];
  const designations = [...new Set(faculty.map(f => f.designation))];

  const filteredFaculty = faculty.filter(member => {
    const fullName = `${member.personalInfo.firstName} ${member.personalInfo.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment;
    const matchesDesignation = filterDesignation === "all" || member.designation === filterDesignation;

    return matchesSearch && matchesDepartment && matchesDesignation;
  });

  const getDesignationColor = (designation: string) => {
    switch (designation) {
      case 'Professor':
        return 'bg-red-100 text-red-700';
      case 'Associate Professor':
        return 'bg-blue-100 text-blue-700';
      case 'Assistant Professor':
        return 'bg-green-100 text-green-700';
      case 'Lecturer':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'bg-green-100 text-green-700';
      case 'part-time':
        return 'bg-orange-100 text-orange-700';
      case 'visiting':
        return 'bg-purple-100 text-purple-700';
      case 'adjunct':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDeleteFaculty = (facultyId: string) => {
    if (confirm('Are you sure you want to delete this faculty member?')) {
      dispatch(deleteFaculty(facultyId));
      // Reset fetch flag to allow refetching after deletion
      setHasFetchedFaculty(false);
    }
  };

  // Show loading state while checking for institutes or loading faculty
  if (status === "loading" || loading || instituteLoading || !hasInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            {!hasInitialized ? "Initializing..." : "Loading faculty..."}
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
            <Users className="h-12 w-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Institute Selected</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please select an institute to view faculty members.
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your institute's faculty members and their profiles
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/institute/faculty/new")}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Faculty</p>
                <p className="text-2xl font-bold text-gray-900">{faculty.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Professors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {faculty.filter(f => f.designation.includes('Professor')).length}
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Publications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {faculty.reduce((sum, member) => sum + member.publications.length, 0)}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Experience</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(faculty.reduce((sum, member) => sum + member.teachingExperience, 0) / faculty.length)} yrs
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Dept: {filterDepartment === "all" ? "All" : filterDepartment}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterDepartment("all")}>
              All Departments
            </DropdownMenuItem>
            {departments.map((dept) => (
              <DropdownMenuItem key={dept} onClick={() => setFilterDepartment(dept)}>
                {dept}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Role: {filterDesignation === "all" ? "All" : filterDesignation}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterDesignation("all")}>
              All Designations
            </DropdownMenuItem>
            {designations.map((designation) => (
              <DropdownMenuItem key={designation} onClick={() => setFilterDesignation(designation)}>
                {designation}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredFaculty.map((member: any) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex gap-2">
                  <Badge className={getDesignationColor(member.designation)}>
                    {member.designation}
                  </Badge>
                  <Badge className={getEmploymentTypeColor(member.employmentType)}>
                    {member.employmentType}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      •••
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/institute/faculty/${member._id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/institute/faculty/${member._id}/edit`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteFaculty(member._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Faculty
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Profile Section */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.profileImage} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {member.personalInfo.firstName.charAt(0)}{member.personalInfo.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {member.personalInfo.firstName} {member.personalInfo.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{member.employeeId}</p>
                    <p className="text-sm text-gray-600">{member.department}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 truncate">{member.personalInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{member.personalInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Joined {new Date(member.joiningDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Highest Qualification</p>
                  <p className="text-sm text-gray-600">
                    {member.qualifications[0]?.degree} in {member.qualifications[0]?.field}
                  </p>
                  <p className="text-xs text-gray-500">{member.qualifications[0]?.institution}</p>
                </div>

                {/* Specialization */}
                {member.specialization.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Specialization</p>
                    <div className="flex flex-wrap gap-1">
                      {member.specialization.slice(0, 3).map((spec: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {member.specialization.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{member.specialization.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-sm font-bold text-blue-600">{member.teachingExperience || 0}</p>
                    <p className="text-xs text-gray-600">Years Exp.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-green-600">{member.publications?.length || 0}</p>
                    <p className="text-xs text-gray-600">Publications</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-purple-600">{member.researchProjects?.length || 0}</p>
                    <p className="text-xs text-gray-600">Projects</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFaculty.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No faculty found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterDepartment !== "all" || filterDesignation !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first faculty member"
            }
          </p>
          {!searchTerm && filterDepartment === "all" && filterDesignation === "all" && (
            <Button
              onClick={() => router.push("/dashboard/institute/faculty/new")}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Faculty
            </Button>
          )}
        </div>
      )}

      {/* Institute Selection Modal */}
      <InstituteSelectionModal
        isOpen={showInstituteModal}
        onClose={() => setShowInstituteModal(false)}
        title="Select Institute for Faculty Management"
        description="Please select an institute to view and manage faculty members"
      />
    </div>
  );
}
