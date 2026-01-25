"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Institute } from "@/types/institute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { saveUserDetails, loadUserDetails } from "@/lib/utils/localStorage";
import {
  saveAppliedCourse,
  hasAppliedToCourse,
  saveEligibilityExams,
  loadEligibilityExams,
} from "@/lib/utils/applicationStorage";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Award,
  TrendingUp,
  Building2,
  BookOpen,
  Search,
  Clock,
  CreditCard,
  GraduationCap,
  X,
  Plus,
  ChevronRight,
  ArrowLeft,
  Info,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { KeyValueTable } from "@/components/publicCollections/KeyValueTable";
import { FacilityList } from "@/components/publicCollections/FacilityList";
import { RankingsSection } from "@/components/publicCollections/RankingsSection";
import { FacultyStudentSection } from "@/components/publicCollections/FacultyStudentSection";

interface InstituteDetailPageProps {
  institute: Institute;
}

interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  course: string;
  eligibilityExams: Array<EligibilityEntry>;
}
interface EligibilityEntry {
  exam: string;
  score: string;
}

// Helper function to check if a value is valid (not null, undefined, 0, "0", empty string, "N/A", "₹")
function isValidValue(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (value === 0 || value === "0") return false;
  if (value === "" || value === "N/A" || value === "₹") return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

// Helper function to check if a numeric value is valid and greater than 0
function isValidNumber(value: any): boolean {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

// Add PlacementsSection component
function PlacementsSection({ placementData, topRecruiters, sectors }: any) {
  const hasValidPlacementData =
    placementData &&
    (isValidValue(placementData.averageSalary) ||
      isValidValue(placementData.highestSalary) ||
      isValidNumber(placementData.companiesVisited) ||
      isValidNumber(placementData.overallPlacementRate));

  if (
    !hasValidPlacementData &&
    (!topRecruiters || topRecruiters.length === 0) &&
    (!sectors || sectors.length === 0)
  ) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Placements & Career Prospects
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasValidPlacementData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {isValidValue(placementData.averageSalary) && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <div className="text-sm text-blue-600 font-medium">
                    Average Package
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {placementData.averageSalary}
                </div>
              </div>
            )}
            {isValidValue(placementData.highestSalary) && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-6 w-6 text-green-600" />
                  <div className="text-sm text-green-600 font-medium">
                    Highest Package
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {placementData.highestSalary}
                </div>
              </div>
            )}
            {isValidNumber(placementData.companiesVisited) && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-6 w-6 text-purple-600" />
                  <div className="text-sm text-purple-600 font-medium">
                    Companies Visited
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {placementData.companiesVisited}
                </div>
              </div>
            )}
            {isValidNumber(placementData.overallPlacementRate) && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6 text-orange-600" />
                  <div className="text-sm text-orange-600 font-medium">
                    Placement Rate
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-700">
                  {placementData.overallPlacementRate}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Recruiters */}
        {topRecruiters && topRecruiters.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Top Recruiters
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {topRecruiters
                .filter((r: string) => isValidValue(r))
                .map((recruiter: string, index: number) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow"
                  >
                    <div className="text-sm font-medium text-gray-700">
                      {recruiter}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Placement Sectors */}
        {sectors && sectors.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Placement Sectors
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sectors
                .filter((s: string) => isValidValue(s))
                .map((sector: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
                  >
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{sector}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add AdmissionsSection component
function AdmissionsSection({ admissions, contact, onApplyClick }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Admissions Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Ready to Apply?</h4>
          <p className="text-sm text-blue-700 mb-4">
            Start your journey with us. Fill out the application form to get
            started.
          </p>
          <Button
            onClick={() => onApplyClick && onApplyClick("")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Apply Now
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contact?.phone &&
            contact.phone.length > 0 &&
            contact.phone.some((p: string) => isValidValue(p)) && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <h5 className="font-medium">Contact Admissions</h5>
                </div>
                <p className="text-sm text-gray-600">
                  {contact.phone
                    .filter((p: string) => isValidValue(p))
                    .join(", ")}
                </p>
              </div>
            )}

          {(isValidValue(contact?.admissionsEmail) ||
            isValidValue(contact?.email)) && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <h5 className="font-medium">Email</h5>
              </div>
              <p className="text-sm text-gray-600">
                {contact.admissionsEmail || contact.email}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function InstituteDetailPage({ institute }: InstituteDetailPageProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [applyingCourse, setApplyingCourse] = useState<string | null>(null);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string | null>(
    null,
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>(() => {
    const savedDetails = loadUserDetails();
    const savedExams = loadEligibilityExams();
    if (savedDetails) {
      return {
        name: savedDetails.name,
        email: savedDetails.email,
        phone: savedDetails.phone,
        city: savedDetails.city,
        course: "",
        eligibilityExams: savedExams,
      };
    }
    return {
      name: "",
      email: "",
      phone: "",
      city: "",
      course: "",
      eligibilityExams: savedExams,
    };
  });
  const [currentExam, setCurrentExam] = useState("");
  const [currentScore, setCurrentScore] = useState("");
  const [programmeSearchQuery, setProgrammeSearchQuery] = useState("");

  // Course filters
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [selectedEducationType, setSelectedEducationType] =
    useState<string>("all");
  const [selectedCourseLevel, setSelectedCourseLevel] = useState<string>("all");
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [selectedFeeRange, setSelectedFeeRange] = useState<string>("all");
  const [selectedExam, setSelectedExam] = useState<string>("all");

  // Get all courses from all programmes
  const allCourses = useMemo(() => {
    if (!institute.programmes) return [];
    return institute.programmes.flatMap(
      (programme) =>
        programme.course?.map((course) => ({
          ...course,
          programmeName: programme.name,
        })) || [],
    );
  }, [institute.programmes]);

  // Initialize state from URL parameters
  useEffect(() => {
    if (!searchParams) return;

    const programmeSlug = searchParams.get("programme");
    const courseSlug = searchParams.get("course");

    if (programmeSlug && institute.programmes) {
      const programme = institute.programmes.find(
        (p) => createSlug(p.name) === programmeSlug || p.id === programmeSlug,
      );
      if (programme) {
        setSelectedProgrammeId(programme.id || programme.name);
      }
    }

    if (courseSlug && allCourses.length > 0) {
      const course = allCourses.find((c) => {
        const fullCourseName = `${c.degree}${c.name ? `-${c.name}` : ""}`;
        return createSlug(fullCourseName) === courseSlug;
      });
      if (course) {
        const displayName = `${course.degree}${course.name ? ` in ${course.name}` : ""}`;
        setSelectedCourse(displayName);
        setSelectedCourseId(course.id || displayName);
      }
    }
  }, [searchParams, institute.programmes, allCourses]);

  // Helper function to create URL-friendly slugs
  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Filter programmes by search query
  const filteredProgrammes = useMemo(() => {
    if (!institute.programmes) return [];
    if (!programmeSearchQuery.trim()) return institute.programmes;

    const searchLower = programmeSearchQuery.toLowerCase();
    return institute.programmes.filter(
      (programme) =>
        programme.name?.toLowerCase().includes(searchLower) ||
        programme.eligibilityExams?.some((exam) =>
          exam.toLowerCase().includes(searchLower),
        ),
    );
  }, [institute.programmes, programmeSearchQuery]);

  // Find selected programme
  const selectedProgramme = selectedProgrammeId
    ? institute.programmes?.find(
        (p) => (p.id || p.name) === selectedProgrammeId,
      )
    : null;

  // Get unique filter options from selected programme courses
  const filterOptions = useMemo(() => {
    if (!selectedProgramme?.course)
      return { educationTypes: [], courseLevels: [], durations: [], exams: [] };

    const educationTypes = new Set<string>();
    const courseLevels = new Set<string>();
    const durations = new Set<string>();
    const exams = new Set<string>();

    selectedProgramme.course.forEach((course: any) => {
      if (course.educationType) educationTypes.add(course.educationType);
      if (course.level) courseLevels.add(course.level);
      if (course.duration) durations.add(course.duration);
      if (course.eligibilityExams) {
        course.eligibilityExams.forEach((exam: any) => exams.add(exam));
      }
    });

    return {
      educationTypes: Array.from(educationTypes).sort(),
      courseLevels: Array.from(courseLevels).sort(),
      durations: Array.from(durations).sort(),
      exams: Array.from(exams).sort(),
    };
  }, [selectedProgramme]);

  // Filter courses based on selected filters
  const filteredCourses = useMemo(() => {
    if (!selectedProgramme?.course) return [];

    return selectedProgramme.course.filter((course: any) => {
      // Search filter
      if (courseSearchQuery.trim()) {
        const searchLower = courseSearchQuery.toLowerCase();
        const matchesSearch =
          course.name?.toLowerCase().includes(searchLower) ||
          course.degree?.toLowerCase().includes(searchLower) ||
          course.school?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Education type filter
      if (
        selectedEducationType !== "all" &&
        course.educationType !== selectedEducationType
      ) {
        return false;
      }

      // Course level filter
      if (
        selectedCourseLevel !== "all" &&
        course.level !== selectedCourseLevel
      ) {
        return false;
      }

      // Duration filter
      if (selectedDuration !== "all" && course.duration !== selectedDuration) {
        return false;
      }

      // Fee range filter
      if (selectedFeeRange !== "all" && course.fees?.tuitionFee) {
        const fee = Number(course.fees.tuitionFee);
        switch (selectedFeeRange) {
          case "under-100k":
            if (fee >= 100000) return false;
            break;
          case "100k-300k":
            if (fee < 100000 || fee >= 300000) return false;
            break;
          case "300k-500k":
            if (fee < 300000 || fee >= 500000) return false;
            break;
          case "500k-1m":
            if (fee < 500000 || fee >= 1000000) return false;
            break;
          case "above-1m":
            if (fee < 1000000) return false;
            break;
        }
      }

      // Eligibility exam filter
      if (selectedExam !== "all") {
        if (!course.eligibilityExams?.includes(selectedExam)) {
          return false;
        }
      }

      return true;
    });
  }, [
    selectedProgramme,
    courseSearchQuery,
    selectedEducationType,
    selectedCourseLevel,
    selectedDuration,
    selectedFeeRange,
    selectedExam,
  ]);

  // Reset course filters when programme changes
  useEffect(() => {
    setCourseSearchQuery("");
    setSelectedEducationType("all");
    setSelectedCourseLevel("all");
    setSelectedDuration("all");
    setSelectedFeeRange("all");
    setSelectedExam("all");
  }, [selectedProgrammeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProgrammeClick = (programmeId: string) => {
    setSelectedProgrammeId(programmeId);

    const programme = institute.programmes?.find(
      (p) => (p.id || p.name) === programmeId,
    );
    if (programme) {
      const programmeSlug = createSlug(programme.name);
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("programme", programmeSlug);
      params.delete("course");
      setSelectedCourse("");
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  const handleBackToProgrammes = () => {
    setSelectedProgrammeId(null);
    setSelectedCourse("");
    setSelectedCourseId(null);

    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("programme");
    params.delete("course");
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setSelectedCourse("");

    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("course");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCourseClick = (courseName: string) => {
    const selectedCourseObj = allCourses.find(
      (c) => `${c.degree}${c.name ? ` in ${c.name}` : ""}` === courseName,
    );
    if (selectedCourseObj) {
      const courseSlug = createSlug(
        `${selectedCourseObj.degree}${selectedCourseObj.name ? `-${selectedCourseObj.name}` : ""}`,
      );
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("course", courseSlug);
      setSelectedCourseId(selectedCourseObj.id || courseName);
      setSelectedCourse(courseName);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  const handleApplyClick = async (courseName: string) => {
    const selectedCourseObj = allCourses.find(
      (c) => `${c.degree}${c.name ? ` in ${c.name}` : ""}` === courseName,
    );

    // Check if already applied
    if (hasAppliedToCourse(institute.id, courseName)) {
      toast({
        title: "Already Applied",
        description:
          "You have already applied to this course. We will contact you soon.",
        variant: "default",
      });
      return;
    }

    if (session?.user) {
      try {
        // Set loading state for this specific course
        setApplyingCourse(courseName);

        const courseId = selectedCourseObj?.id;

        const res = await fetch("/api/student-leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: (session as any)?.user?.id,
            courseId,
            courseName,
            instituteId: institute.id,
            instituteSlug: institute.slug,
            isAdminInstitute: true,
            source: "institute_detail_page",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Failed to submit application");
        }

        // Save to localStorage
        saveAppliedCourse({
          instituteId: institute.id,
          instituteName: institute.name,
          courseId,
          courseName,
          appliedAt: new Date().toISOString(),
        });

        toast({
          title: "Application Submitted!",
          description:
            "Your application has been submitted successfully. We will contact you soon.",
          variant: "default",
        });
        console.log("Application submitted with id:", data.id);
      } catch (error: any) {
        console.error("Failed to submit application:", error?.message || error);
        toast({
          title: "Application Failed",
          description:
            error?.message || "Failed to submit application. Please try again.",
          variant: "destructive",
        });
      } finally {
        // Clear loading state
        setApplyingCourse(null);
      }
    } else {
      const savedDetails = loadUserDetails();
      const savedExams = loadEligibilityExams();
      if (savedDetails) {
        setFormData((prev) => ({
          name: savedDetails.name,
          email: savedDetails.email,
          phone: savedDetails.phone,
          city: savedDetails.city,
          course: courseName,
          eligibilityExams: savedExams,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          course: courseName,
          eligibilityExams: savedExams,
        }));
      }
      setSelectedCourse(courseName);
      setShowApplicationModal(true);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedCourseObj = allCourses.find(
        (c) =>
          `${c.degree}${c.name ? ` in ${c.name}` : ""}` === formData.course,
      );
      const courseId = selectedCourseObj?.id;

      const res = await fetch("/api/student-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: (session as any)?.user?.id,
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          courseId,
          courseName: formData.course,
          instituteId: institute.id,
          instituteSlug: institute.slug,
          isAdminInstitute: true,
          source: "institute_detail_page",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to submit lead");
      }

      console.log("Lead created with id:", data.id);

      // Save user details and eligibility exams to localStorage
      saveUserDetails({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
      });
      saveEligibilityExams(formData.eligibilityExams);

      // Save applied course to localStorage
      saveAppliedCourse({
        instituteId: institute.id,
        instituteName: institute.name,
        courseId,
        courseName: formData.course,
        appliedAt: new Date().toISOString(),
      });

      // Close modal first
      setShowApplicationModal(false);
      setIsSubmitting(false);

      // Show success toast after modal closes
      setTimeout(() => {
        toast({
          title: "Application Submitted!",
          description:
            "Your application has been submitted successfully. We will contact you soon.",
        });
      }, 300);

      setFormData((prev) => ({
        ...prev,
        course: "",
      }));
      setCurrentExam("");
      setCurrentScore("");
    } catch (error: any) {
      console.error("Failed to create lead:", error?.message || error);
      setIsSubmitting(false);
      toast({
        title: "Application Failed",
        description:
          error?.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addEligibilityExam = () => {
    if (currentExam.trim() && currentScore.trim()) {
      const updatedExams = [
        ...formData.eligibilityExams,
        { exam: currentExam.trim(), score: currentScore.trim() },
      ];
      setFormData((prev) => ({
        ...prev,
        eligibilityExams: updatedExams,
      }));
      // Save to localStorage immediately
      saveEligibilityExams(updatedExams);
      setCurrentExam("");
      setCurrentScore("");
    }
  };

  const removeEligibilityExam = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      eligibilityExams: prev.eligibilityExams.filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEligibilityExam();
    }
  };

  const getLatestPlacementData = () => {
    if (
      institute.placements &&
      ("averageSalary" in institute.placements ||
        "highestSalary" in institute.placements ||
        "overallPlacementRate" in institute.placements)
    ) {
      return institute.placements;
    }

    const latestYear = Object.keys(institute.placements || {}).find(
      (key) => key !== "sectors" && key !== "topRecruiters",
    );
    if (latestYear && institute.placements?.[latestYear]) {
      const data = institute.placements[latestYear];
      if (
        typeof data === "object" &&
        !Array.isArray(data) &&
        "averageSalary" in data
      ) {
        return data;
      }
    }
    return null;
  };
  const placementData = getLatestPlacementData();

  // Check if placement data has any valid values to display
  const hasValidPlacementCards =
    placementData &&
    (isValidValue(placementData.averageSalary) ||
      isValidValue(placementData.highestSalary) ||
      isValidNumber(placementData.overallPlacementRate) ||
      isValidNumber(placementData.companiesVisited));

  // Filter NIRF rankings to only show valid entries
  const validNirfRankings = useMemo(() => {
    const nirf = (institute as any).accreditation?.nirf;
    if (!nirf) return null;

    const validEntries = Object.entries(nirf).filter(
      ([category, rank]: [string, any]) => {
        // Filter out invalid categories and ranks
        if (!isValidValue(category) || category.toLowerCase() === "year")
          return false;
        if (!isValidNumber(rank)) return false;
        return true;
      },
    );

    return validEntries.length > 0 ? validEntries : null;
  }, [institute]);

  return (
    <div className="min-h-screen bg-gray-50 pt-28">
      {/* Hero Section with Cover Image */}
      <div className="relative">
        <div className="h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
          {institute.coverImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${institute.coverImage})` }}
            ></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-purple-700/40"></div>

          <div className="relative z-10 container mx-auto px-4 pt-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white/20 overflow-hidden">
                  {institute.logo ? (
                    <img
                      src={institute.logo}
                      alt={`${institute.name} Logo`}
                      className="w-full h-full object-contain p-2 lg:p-3"
                    />
                  ) : (
                    <Building2 className="h-12 w-12 lg:h-16 lg:w-16 text-blue-600" />
                  )}
                </div>
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 text-xs lg:text-sm font-semibold">
                  100% Verified
                </Badge>
              </div>

              <div className="flex-1 text-white text-center lg:text-left">
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 lg:gap-3 mb-4">
                  {institute.accreditation.naac?.grade &&
                    isValidValue(institute.accreditation.naac.grade) && (
                      <Badge className="bg-green-500 text-white px-2 py-1 text-xs lg:text-sm font-semibold">
                        NAAC {institute.accreditation.naac.grade}
                      </Badge>
                    )}
                  {isValidNumber(institute.accreditation.nirf?.overallRank) && (
                    <Badge className="bg-blue-500 text-white px-2 py-1 text-xs lg:text-sm font-semibold">
                      NIRF #{institute?.accreditation?.nirf?.overallRank}
                    </Badge>
                  )}
                  {isValidValue(institute.type) && (
                    <Badge className="bg-purple-500 text-white px-2 py-1 text-xs lg:text-sm font-semibold">
                      {institute.type}
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">
                  {institute.name}
                </h1>
                {isValidValue(institute.shortName) && (
                  <p className="text-lg lg:text-xl text-blue-100 mb-4 lg:mb-6">
                    {institute.shortName}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 text-white/90 text-sm lg:text-base">
                  {(isValidValue(institute.location?.city) ||
                    isValidValue(institute.location?.state)) && (
                    <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3">
                      <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-blue-200 flex-shrink-0" />
                      <span className="font-medium">
                        {[institute.location?.city, institute.location?.state]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  {isValidNumber(institute.establishedYear) && (
                    <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3">
                      <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-blue-200 flex-shrink-0" />
                      <span className="font-medium">
                        Established {institute.establishedYear}
                      </span>
                    </div>
                  )}
                  {isValidNumber(institute.academics?.totalStudents) && (
                    <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3 sm:col-span-2 lg:col-span-1">
                      <Users className="h-4 w-4 lg:h-5 lg:w-5 text-blue-200 flex-shrink-0" />
                      <span className="font-medium">
                        {institute.academics.totalStudents.toLocaleString()}{" "}
                        Students
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto lg:w-auto">
                {isValidValue(institute.contact?.website) && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                  >
                    <a
                      href={institute.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
                {institute.contact?.phone &&
                  institute.contact.phone.length > 0 &&
                  isValidValue(institute.contact.phone[0]) && (
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-white bg-green-600 text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto"
                    >
                      <a href={`tel:${institute.contact.phone[0]}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </a>
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </div>

        {hasValidPlacementCards && (
          <div className="container mx-auto px-4 -mt-8 lg:-mt-16 relative z-20 mb-4 lg:mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6">
              {isValidValue(placementData.averageSalary) && (
                <Card className="bg-white shadow-xl border-t-4 border-t-green-500">
                  <CardContent className="p-3 lg:p-6 text-center">
                    <div className="w-6 h-6 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1 lg:mb-3">
                      <TrendingUp className="h-3 w-3 lg:h-5 lg:w-5 text-green-600" />
                    </div>
                    <div className="text-sm lg:text-2xl font-bold text-green-600 mb-1">
                      {placementData.averageSalary}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      Average Package
                    </div>
                  </CardContent>
                </Card>
              )}

              {isValidValue(placementData.highestSalary) && (
                <Card className="bg-white shadow-xl border-t-4 border-t-blue-500">
                  <CardContent className="p-3 lg:p-6 text-center">
                    <div className="w-6 h-6 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1 lg:mb-3">
                      <Award className="h-3 w-3 lg:h-5 lg:w-5 text-blue-600" />
                    </div>
                    <div className="text-sm lg:text-2xl font-bold text-blue-600 mb-1">
                      {placementData.highestSalary}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      Highest Package
                    </div>
                  </CardContent>
                </Card>
              )}

              {isValidNumber(placementData.overallPlacementRate) && (
                <Card className="bg-white shadow-xl border-t-4 border-t-purple-500">
                  <CardContent className="p-3 lg:p-6 text-center">
                    <div className="w-6 h-6 lg:w-10 lg:h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1 lg:mb-3">
                      <Users className="h-3 w-3 lg:h-5 lg:w-5 text-purple-600" />
                    </div>
                    <div className="text-sm lg:text-2xl font-bold text-purple-600 mb-1">
                      {placementData.overallPlacementRate}%
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      Placement Rate
                    </div>
                  </CardContent>
                </Card>
              )}

              {isValidNumber(placementData.companiesVisited) && (
                <Card className="bg-white shadow-xl border-t-4 border-t-orange-500">
                  <CardContent className="p-3 lg:p-6 text-center">
                    <div className="w-6 h-6 lg:w-10 lg:h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1 lg:mb-3">
                      <Building2 className="h-3 w-3 lg:h-5 lg:w-5 text-orange-600" />
                    </div>
                    <div className="text-sm lg:text-2xl font-bold text-orange-600 mb-1">
                      {placementData.companiesVisited}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      Companies Visited
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="space-y-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    About {institute.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const facultyStudentData = (institute as any)
                      .faculty_student_ratio;
                    if (
                      facultyStudentData?.students &&
                      Array.isArray(facultyStudentData.students)
                    ) {
                      const descItem = facultyStudentData.students.find(
                        (item: any) =>
                          item.key?.toLowerCase() === "description",
                      );
                      if (descItem?.value && isValidValue(descItem.value)) {
                        return (
                          <p className="text-gray-700 leading-relaxed">
                            {descItem.value}
                          </p>
                        );
                      }
                    }

                    if (
                      institute?.overview?.stats?.[0]?.description &&
                      isValidValue(institute.overview.stats[0].description)
                    ) {
                      return (
                        <>
                          {institute?.overview?.stats?.[0]?.title &&
                            isValidValue(institute.overview.stats[0].title) && (
                              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                {institute.overview.stats[0].title}
                              </h3>
                            )}
                          <p className="text-gray-700 leading-relaxed">
                            {institute.overview.stats[0].description}
                          </p>
                        </>
                      );
                    }

                    if (
                      (institute as any).overview?.description &&
                      isValidValue((institute as any).overview.description)
                    ) {
                      return (
                        <p className="text-gray-700 leading-relaxed">
                          {(institute as any).overview.description}
                        </p>
                      );
                    }

                    return null;
                  })()}
                </CardContent>
              </Card>

              {/* Programs or Courses View */}
              {institute.programmes &&
                Array.isArray(institute.programmes) &&
                institute.programmes.length > 0 && (
                  <>
                    {!selectedProgramme ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Programs Offered ({institute.programmes.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredProgrammes.map(
                              (programme: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 sm:p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer min-w-0"
                                  onClick={() =>
                                    handleProgrammeClick(
                                      programme.id || programme.name,
                                    )
                                  }
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-bold text-blue-900 mb-1">
                                        {programme.name}
                                      </h3>
                                      {isValidNumber(programme.courseCount) && (
                                        <div className="text-sm text-blue-600 font-medium">
                                          {programme.courseCount} Course
                                          {programme.courseCount !== 1
                                            ? "s"
                                            : ""}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                                      <Award className="h-3 w-3 text-green-600" />
                                      <span className="text-xs font-bold text-green-700">
                                        {isValidNumber(
                                          programme?.placementRating,
                                        )
                                          ? programme.placementRating
                                          : ((
                                              programme?.id ||
                                              programme?.name ||
                                              ""
                                            )
                                              .split("")
                                              .reduce(
                                                (acc: any, char: any) =>
                                                  acc + char.charCodeAt(0),
                                                0,
                                              ) %
                                              5) +
                                            1}
                                        /5
                                      </span>
                                    </div>
                                  </div>

                                  {programme.eligibilityExams &&
                                    programme.eligibilityExams.length > 0 && (
                                      <div className="mb-3">
                                        <div className="text-xs text-gray-600 mb-2 font-medium">
                                          Eligibility Exams:
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {programme.eligibilityExams
                                            .filter((exam: string) =>
                                              isValidValue(exam),
                                            )
                                            .slice(0, 3)
                                            .map(
                                              (
                                                exam: string,
                                                examIndex: number,
                                              ) => (
                                                <span
                                                  key={examIndex}
                                                  className="text-xs bg-white px-2 py-1 rounded-full border border-blue-200 text-blue-700 font-medium"
                                                >
                                                  {exam}
                                                </span>
                                              ),
                                            )}
                                          {programme.eligibilityExams.filter(
                                            (exam: string) =>
                                              isValidValue(exam),
                                          ).length > 3 && (
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full border border-gray-200 text-gray-600">
                                              +
                                              {programme.eligibilityExams.filter(
                                                (exam: string) =>
                                                  isValidValue(exam),
                                              ).length - 3}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {programme.course &&
                                    programme.course.length > 0 && (
                                      <div className="text-xs text-gray-600">
                                        <div className="font-medium mb-1">
                                          Sample Courses:
                                        </div>
                                        <div className="space-y-1">
                                          {programme.course
                                            .slice(0, 2)
                                            .map(
                                              (
                                                course: any,
                                                courseIndex: number,
                                              ) => (
                                                <div
                                                  key={courseIndex}
                                                  className="flex justify-between items-center"
                                                >
                                                  <span className="truncate">
                                                    {course.name ||
                                                      course.degree}
                                                  </span>
                                                  {isValidValue(
                                                    course.duration,
                                                  ) && (
                                                    <span className="text-green-600 font-medium ml-2">
                                                      {course.duration}
                                                    </span>
                                                  )}
                                                </div>
                                              ),
                                            )}
                                          {programme.course.length > 2 && (
                                            <div className="text-gray-500 italic">
                                              +{programme.course.length - 2}{" "}
                                              more courses
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              ),
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="default"
                                size="default"
                                onClick={handleBackToProgrammes}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all font-semibold"
                              >
                                <ArrowLeft className="h-5 w-5" />
                                Back to Programs
                              </Button>
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <BookOpen className="h-5 w-5" />
                                  {selectedProgramme.name} Courses
                                </CardTitle>
                                <p className="text-sm text-gray-600 mt-1">
                                  {filteredCourses.length} of{" "}
                                  {selectedProgramme.course?.length || 0}{" "}
                                  courses
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Filters */}
                          <div className="mb-6 space-y-4">
                            {/* Search */}
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search courses by name or degree..."
                                value={courseSearchQuery}
                                onChange={(e) =>
                                  setCourseSearchQuery(e.target.value)
                                }
                                className="pl-10"
                              />
                            </div>

                            {/* Filter Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                              {/* Education Type */}
                              {filterOptions.educationTypes.length > 0 && (
                                <Select
                                  value={selectedEducationType}
                                  onValueChange={setSelectedEducationType}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Education Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All Types
                                    </SelectItem>
                                    {filterOptions.educationTypes.map(
                                      (type) => (
                                        <SelectItem key={type} value={type}>
                                          {type}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>
                              )}

                              {/* Course Level */}
                              {filterOptions.courseLevels.length > 0 && (
                                <Select
                                  value={selectedCourseLevel}
                                  onValueChange={setSelectedCourseLevel}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Course Level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All Levels
                                    </SelectItem>
                                    {filterOptions.courseLevels.map((level) => (
                                      <SelectItem key={level} value={level}>
                                        {level}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}

                              {/* Duration */}
                              {filterOptions.durations.length > 0 && (
                                <Select
                                  value={selectedDuration}
                                  onValueChange={setSelectedDuration}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Duration" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All Durations
                                    </SelectItem>
                                    {filterOptions.durations.map((duration) => (
                                      <SelectItem
                                        key={duration}
                                        value={duration}
                                      >
                                        {duration}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}

                              {/* Fee Range */}
                              <Select
                                value={selectedFeeRange}
                                onValueChange={setSelectedFeeRange}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Fee Range" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Fees</SelectItem>
                                  <SelectItem value="under-100k">
                                    Under ₹1 Lakh
                                  </SelectItem>
                                  <SelectItem value="100k-300k">
                                    ₹1L - ₹3L
                                  </SelectItem>
                                  <SelectItem value="300k-500k">
                                    ₹3L - ₹5L
                                  </SelectItem>
                                  <SelectItem value="500k-1m">
                                    ₹5L - ₹10L
                                  </SelectItem>
                                  <SelectItem value="above-1m">
                                    Above ₹10L
                                  </SelectItem>
                                </SelectContent>
                              </Select>

                              {/* Eligibility Exam */}
                              {filterOptions.exams.length > 0 && (
                                <Select
                                  value={selectedExam}
                                  onValueChange={setSelectedExam}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Eligibility Exam" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All Exams
                                    </SelectItem>
                                    {filterOptions.exams.map((exam) => (
                                      <SelectItem key={exam} value={exam}>
                                        {exam}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            {/* Active Filters Display */}
                            {(selectedEducationType !== "all" ||
                              selectedCourseLevel !== "all" ||
                              selectedDuration !== "all" ||
                              selectedFeeRange !== "all" ||
                              selectedExam !== "all") && (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  Active filters:
                                </span>
                                {selectedEducationType !== "all" && (
                                  <Badge variant="secondary" className="gap-1">
                                    {selectedEducationType}
                                    <X
                                      className="h-3 w-3 cursor-pointer"
                                      onClick={() =>
                                        setSelectedEducationType("all")
                                      }
                                    />
                                  </Badge>
                                )}
                                {selectedCourseLevel !== "all" && (
                                  <Badge variant="secondary" className="gap-1">
                                    {selectedCourseLevel}
                                    <X
                                      className="h-3 w-3 cursor-pointer"
                                      onClick={() =>
                                        setSelectedCourseLevel("all")
                                      }
                                    />
                                  </Badge>
                                )}
                                {selectedDuration !== "all" && (
                                  <Badge variant="secondary" className="gap-1">
                                    {selectedDuration}
                                    <X
                                      className="h-3 w-3 cursor-pointer"
                                      onClick={() => setSelectedDuration("all")}
                                    />
                                  </Badge>
                                )}
                                {selectedFeeRange !== "all" && (
                                  <Badge variant="secondary" className="gap-1">
                                    {selectedFeeRange === "under-100k"
                                      ? "Under ₹1L"
                                      : selectedFeeRange === "100k-300k"
                                        ? "₹1L-₹3L"
                                        : selectedFeeRange === "300k-500k"
                                          ? "₹3L-₹5L"
                                          : selectedFeeRange === "500k-1m"
                                            ? "₹5L-₹10L"
                                            : "Above ₹10L"}
                                    <X
                                      className="h-3 w-3 cursor-pointer"
                                      onClick={() => setSelectedFeeRange("all")}
                                    />
                                  </Badge>
                                )}
                                {selectedExam !== "all" && (
                                  <Badge variant="secondary" className="gap-1">
                                    {selectedExam}
                                    <X
                                      className="h-3 w-3 cursor-pointer"
                                      onClick={() => setSelectedExam("all")}
                                    />
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEducationType("all");
                                    setSelectedCourseLevel("all");
                                    setSelectedDuration("all");
                                    setSelectedFeeRange("all");
                                    setSelectedExam("all");
                                  }}
                                  className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                  Clear all
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Course List */}
                          {filteredCourses.length > 0 ? (
                            <div className="space-y-4">
                              {filteredCourses.map(
                                (course: any, index: number) => (
                                  <div
                                    key={index}
                                    className="border rounded-xl p-6 hover:shadow-lg transition-all bg-white"
                                  >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                      {/* Course Info */}
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                              {course.degree}
                                            </h3>
                                            {course.name &&
                                              course.name !== course.degree &&
                                              isValidValue(course.name) && (
                                                <p className="text-gray-600">
                                                  {course.name}
                                                </p>
                                              )}
                                          </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 mb-4">
                                          {isValidValue(course.duration) && (
                                            <Badge
                                              variant="outline"
                                              className="flex items-center gap-1"
                                            >
                                              <Clock className="h-3 w-3" />
                                              {course.duration}
                                            </Badge>
                                          )}
                                          {isValidValue(course.level) && (
                                            <Badge
                                              variant="outline"
                                              className="bg-purple-50 text-purple-700 border-purple-200"
                                            >
                                              {course.level}
                                            </Badge>
                                          )}
                                          {isValidValue(
                                            course.educationType,
                                          ) && (
                                            <Badge
                                              variant="outline"
                                              className="bg-blue-50 text-blue-700 border-blue-200"
                                            >
                                              {course.educationType}
                                            </Badge>
                                          )}
                                          {isValidValue(
                                            course.deliveryMethod,
                                          ) && (
                                            <Badge
                                              variant="outline"
                                              className="bg-green-50 text-green-700 border-green-200"
                                            >
                                              {course.deliveryMethod}
                                            </Badge>
                                          )}
                                          {isValidNumber(course.totalSeats) && (
                                            <Badge
                                              variant="outline"
                                              className="flex items-center gap-1"
                                            >
                                              <Users className="h-3 w-3" />
                                              {course.totalSeats} Seats
                                            </Badge>
                                          )}
                                        </div>

                                        {/* Additional Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                          {isValidValue(course.school) && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                              <Building2 className="h-4 w-4" />
                                              <span>{course.school}</span>
                                            </div>
                                          )}
                                          {isValidValue(
                                            course.location?.city,
                                          ) && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                              <MapPin className="h-4 w-4" />
                                              <span>
                                                {[
                                                  course.location.city,
                                                  course.location.state,
                                                ]
                                                  .filter(Boolean)
                                                  .join(", ")}
                                              </span>
                                            </div>
                                          )}
                                          {isValidValue(
                                            course.affiliatedUniversity,
                                          ) &&
                                            course.affiliatedUniversity !==
                                              institute.name && (
                                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Award className="h-4 w-4" />
                                                <span>
                                                  {course.affiliatedUniversity}
                                                </span>
                                              </div>
                                            )}
                                        </div>

                                        {/* Eligibility Exams */}
                                        {course.eligibilityExams &&
                                          course.eligibilityExams.filter(
                                            (e: string) => isValidValue(e),
                                          ).length > 0 && (
                                            <div className="mb-4">
                                              <p className="text-xs text-gray-600 mb-2 font-medium">
                                                Eligibility Exams:
                                              </p>
                                              <div className="flex flex-wrap gap-2">
                                                {course.eligibilityExams
                                                  .filter((e: string) =>
                                                    isValidValue(e),
                                                  )
                                                  .map(
                                                    (
                                                      exam: string,
                                                      examIndex: number,
                                                    ) => (
                                                      <Badge
                                                        key={examIndex}
                                                        variant="secondary"
                                                        className="text-xs"
                                                      >
                                                        {exam}
                                                      </Badge>
                                                    ),
                                                  )}
                                              </div>
                                            </div>
                                          )}

                                        {/* Placement Stats */}
                                        {(isValidNumber(
                                          course.placements?.averagePackage,
                                        ) ||
                                          isValidNumber(
                                            course.placements?.highestPackage,
                                          ) ||
                                          isValidNumber(
                                            course.placements?.placementRate,
                                          )) && (
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                                            {isValidNumber(
                                              course.placements?.averagePackage,
                                            ) && (
                                              <div>
                                                <p className="text-xs text-gray-600">
                                                  Avg Package
                                                </p>
                                                <p className="text-sm font-bold text-green-600">
                                                  ₹
                                                  {(
                                                    course.placements
                                                      .averagePackage / 100000
                                                  ).toFixed(2)}
                                                  L
                                                </p>
                                              </div>
                                            )}
                                            {isValidNumber(
                                              course.placements?.highestPackage,
                                            ) && (
                                              <div>
                                                <p className="text-xs text-gray-600">
                                                  Highest Package
                                                </p>
                                                <p className="text-sm font-bold text-blue-600">
                                                  ₹
                                                  {(
                                                    course.placements
                                                      .highestPackage / 100000
                                                  ).toFixed(2)}
                                                  L
                                                </p>
                                              </div>
                                            )}
                                            {isValidNumber(
                                              course.placements?.placementRate,
                                            ) ? (
                                              <div>
                                                <p className="text-xs text-gray-600">
                                                  Placement Rate
                                                </p>
                                                <p className="text-sm font-bold text-purple-600">
                                                  {
                                                    course.placements
                                                      .placementRate
                                                  }
                                                  %
                                                </p>
                                              </div>
                                            ) : (
                                              <div>
                                                <p className="text-xs text-gray-600">
                                                  Placement Rating
                                                </p>
                                                <p className="text-sm font-bold text-purple-600">
                                                  {((
                                                    (course?.id ||
                                                      course?.degree ||
                                                      course?.name ||
                                                      "") as any
                                                  )
                                                    .split("")
                                                    .reduce(
                                                      (acc: any, char: any) =>
                                                        acc +
                                                        char.charCodeAt(0),
                                                      0,
                                                    ) %
                                                    5) +
                                                    1}
                                                  /5
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Fees and Action */}
                                      <div className="lg:w-64 flex flex-col gap-4">
                                        {course.fees &&
                                          (isValidNumber(
                                            course.fees.tuitionFee,
                                          ) ||
                                            isValidNumber(
                                              course.fees.totalFee,
                                            )) && (
                                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                                              <div className="flex items-center gap-2 mb-2">
                                                <CreditCard className="h-4 w-4 text-orange-600" />
                                                <span className="text-xs text-orange-600 font-medium">
                                                  Course Fees
                                                </span>
                                              </div>
                                              {isValidNumber(
                                                course.fees.tuitionFee,
                                              ) && (
                                                <div className="mb-1">
                                                  <p className="text-xs text-gray-600">
                                                    Tuition Fee
                                                  </p>
                                                  <p className="text-2xl font-bold text-orange-700">
                                                    ₹
                                                    {(
                                                      course.fees.tuitionFee /
                                                      100000
                                                    ).toFixed(2)}
                                                    L
                                                  </p>
                                                </div>
                                              )}
                                              {isValidNumber(
                                                course.fees.totalFee,
                                              ) &&
                                                course.fees.totalFee !==
                                                  course.fees.tuitionFee && (
                                                  <div>
                                                    <p className="text-xs text-gray-600">
                                                      Total Fee
                                                    </p>
                                                    <p className="text-lg font-semibold text-orange-600">
                                                      ₹
                                                      {(
                                                        course.fees.totalFee /
                                                        100000
                                                      ).toFixed(2)}
                                                      L
                                                    </p>
                                                  </div>
                                                )}
                                              {isValidValue(
                                                course.fees.currency,
                                              ) &&
                                                course.fees.currency !==
                                                  "INR" && (
                                                  <p className="text-xs text-gray-500 mt-1">
                                                    Currency:{" "}
                                                    {course.fees.currency}
                                                  </p>
                                                )}
                                            </div>
                                          )}

                                        <div className="flex flex-col gap-2">
                                          {hasAppliedToCourse(
                                            institute.id,
                                            `${course.degree}${course.name ? ` in ${course.name}` : ""}`,
                                          ) ? (
                                            <Button
                                              className="w-full bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300 cursor-default"
                                              disabled
                                            >
                                              <CheckCircle2 className="h-4 w-4 mr-2" />
                                              Applied
                                            </Button>
                                          ) : (
                                            <Button
                                              onClick={() =>
                                                handleApplyClick(
                                                  `${course.degree}${course.name ? ` in ${course.name}` : ""}`,
                                                )
                                              }
                                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                              disabled={
                                                applyingCourse ===
                                                `${course.degree}${course.name ? ` in ${course.name}` : ""}`
                                              }
                                            >
                                              {applyingCourse ===
                                              `${course.degree}${course.name ? ` in ${course.name}` : ""}` ? (
                                                <>
                                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                  Applying...
                                                </>
                                              ) : (
                                                "Apply Now"
                                              )}
                                            </Button>
                                          )}
                                          {isValidValue(
                                            course.brochure?.url,
                                          ) && (
                                            <Button
                                              asChild
                                              variant="outline"
                                              className="w-full"
                                            >
                                              <a
                                                href={course.brochure.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                View Brochure
                                              </a>
                                            </Button>
                                          )}
                                          {isValidValue(course.seoUrl) && (
                                            <Button
                                              asChild
                                              variant="ghost"
                                              size="sm"
                                              className="w-full text-blue-600 hover:text-blue-700"
                                            >
                                              <a
                                                href={course.seoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                More Details →
                                              </a>
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No courses found
                              </h3>
                              <p className="text-gray-600 mb-4">
                                Try adjusting your filters or search criteria
                              </p>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setCourseSearchQuery("");
                                  setSelectedEducationType("all");
                                  setSelectedCourseLevel("all");
                                  setSelectedDuration("all");
                                  setSelectedFeeRange("all");
                                  setSelectedExam("all");
                                }}
                              >
                                Clear Filters
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

              {institute.rawOverview &&
                Array.isArray(institute.rawOverview) &&
                institute.rawOverview.filter(
                  (item: any) =>
                    item && isValidValue(item.key) && isValidValue(item.value),
                ).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Key Highlights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {institute.rawOverview
                          .filter(
                            (item: any) =>
                              item &&
                              isValidValue(item.key) &&
                              isValidValue(item.value),
                          )
                          .map((item: any, index: number) => (
                            <div
                              key={index}
                              className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 p-4 rounded-xl border border-yellow-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="text-sm text-gray-600 mb-1 font-medium">
                                {item.key}
                              </div>
                              <div className="text-lg font-bold text-orange-700">
                                {item.value}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {(institute as any).mediaGallery &&
                Object.values(
                  (institute as any).mediaGallery?.photos ?? {},
                ).some(
                  (photos: any) =>
                    Array.isArray(photos) &&
                    photos.filter((p) => p != null).length > 0,
                ) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Campus Gallery
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(
                          (institute as any).mediaGallery?.photos ?? {},
                        ).map(([category, photos]: [string, any]) =>
                          (Array.isArray(photos) ? photos : [])
                            .filter((p) => p != null)
                            .slice(0, 2)
                            .map((photo: any, index: number) => {
                              const isString = typeof photo === "string";
                              const src = isString
                                ? photo
                                : photo.widgetThumbUrl ||
                                  photo.thumbUrl ||
                                  photo.mediaUrl;
                              const alt = isString
                                ? category
                                : photo.altText || photo.mediaTitle || category;

                              if (!src) return null;

                              return (
                                <div
                                  key={`${category}-${index}`}
                                  className="relative group cursor-pointer"
                                >
                                  <img
                                    src={src}
                                    alt={alt}
                                    className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                      {isString
                                        ? category
                                        : photo.mediaTitle || category}
                                    </span>
                                  </div>
                                  {isValidValue(category) && (
                                    <Badge className="absolute top-2 left-2 text-xs">
                                      {category}
                                    </Badge>
                                  )}
                                </div>
                              );
                            }),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isValidNumber(institute.establishedYear) && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm lg:text-base">
                        Established
                      </span>
                      <span className="font-semibold text-sm lg:text-base">
                        {institute.establishedYear}
                      </span>
                    </div>
                  )}
                  {isValidValue(institute.type) && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm lg:text-base">
                        Type
                      </span>
                      <span className="font-semibold text-sm lg:text-base">
                        {institute.type}
                      </span>
                    </div>
                  )}
                  {(isValidValue(institute.location?.city) ||
                    isValidValue(institute.location?.state)) && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm lg:text-base">
                        Location
                      </span>
                      <span className="font-semibold text-sm lg:text-base">
                        {[institute.location?.city, institute.location?.state]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  {isValidValue(
                    (institute as any).campusDetails?.totalArea,
                  ) && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm lg:text-base">
                        Campus Area
                      </span>
                      <span className="font-semibold text-sm lg:text-base">
                        {(institute as any).campusDetails.totalArea}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isValidValue(institute.location?.address) && (
                    <div className="flex items-center gap-2 lg:gap-3">
                      <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm lg:text-base">
                          Address
                        </div>
                        <div className="text-xs lg:text-sm text-gray-600 break-words">
                          {institute.location.address}
                          <br />
                          {[
                            institute.location?.city,
                            institute.location?.state,
                            institute.location?.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                          {isValidValue(institute.location?.country) && (
                            <>
                              <br />
                              {institute.location.country}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {institute.contact?.phone &&
                    institute.contact.phone.filter((p: string) =>
                      isValidValue(p),
                    ).length > 0 && (
                      <div className="flex items-center gap-2 lg:gap-3">
                        <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-sm lg:text-base">
                            Phone
                          </div>
                          <div className="text-xs lg:text-sm text-gray-600 truncate">
                            {institute.contact.phone
                              .filter((p: string) => isValidValue(p))
                              .join(", ")}
                          </div>
                        </div>
                      </div>
                    )}

                  {isValidValue(institute.contact?.email) && (
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm lg:text-base">
                          Email
                        </div>
                        <div className="text-xs lg:text-sm text-gray-600 truncate">
                          {institute.contact.email}
                        </div>
                      </div>
                    </div>
                  )}

                  {isValidValue(institute.contact?.website) && (
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Globe className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm lg:text-base">
                          Website
                        </div>
                        <a
                          href={institute.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs lg:text-sm text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {institute.contact.website.replace(
                            /^https?:\/\//,
                            "",
                          )}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="block lg:hidden space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  About {institute.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const facultyStudentData = (institute as any)
                    .faculty_student_ratio;
                  if (
                    facultyStudentData?.students &&
                    Array.isArray(facultyStudentData.students)
                  ) {
                    const descItem = facultyStudentData.students.find(
                      (item: any) => item.key?.toLowerCase() === "description",
                    );
                    if (descItem?.value && isValidValue(descItem.value)) {
                      return (
                        <p className="text-gray-700 leading-relaxed mb-6">
                          {descItem.value}
                        </p>
                      );
                    }
                  }

                  if (
                    (institute as any).overview?.description &&
                    isValidValue((institute as any).overview.description)
                  ) {
                    return (
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {(institute as any).overview.description}
                      </p>
                    );
                  }

                  return null;
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isValidValue(institute.location?.address) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm">Address</div>
                      <div className="text-xs text-gray-600">
                        {institute.location.address}
                        <br />
                        {[
                          institute.location?.city,
                          institute.location?.state,
                          institute.location?.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                        {isValidValue(institute.location?.country) && (
                          <>
                            <br />
                            {institute.location.country}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {institute.contact?.phone &&
                  institute.contact.phone.filter((p: string) => isValidValue(p))
                    .length > 0 && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm">Phone</div>
                        <div className="text-xs text-gray-600 truncate">
                          {institute.contact.phone
                            .filter((p: string) => isValidValue(p))
                            .join(", ")}
                        </div>
                      </div>
                    </div>
                  )}

                {isValidValue(institute.contact?.email) && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm">Email</div>
                      <div className="text-xs text-gray-600 truncate">
                        {institute.contact.email}
                      </div>
                    </div>
                  </div>
                )}

                {isValidValue(institute.contact?.website) && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm">Website</div>
                      <a
                        href={institute.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {institute.contact.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isValidNumber(institute.establishedYear) && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Established</span>
                    <span className="font-semibold text-sm">
                      {institute.establishedYear}
                    </span>
                  </div>
                )}
                {isValidValue(institute.type) && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Type</span>
                    <span className="font-semibold text-sm">
                      {institute.type}
                    </span>
                  </div>
                )}
                {(isValidValue(institute.location?.city) ||
                  isValidValue(institute.location?.state)) && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Location</span>
                    <span className="font-semibold text-sm">
                      {[institute.location?.city, institute.location?.state]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
                {isValidValue((institute as any).campusDetails?.totalArea) && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Campus Area</span>
                    <span className="font-semibold text-sm">
                      {(institute as any).campusDetails.totalArea}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {(institute as any).overview &&
            Array.isArray((institute as any).overview) &&
            (institute as any).overview.filter(
              (item: any) =>
                item && isValidValue(item.key) && isValidValue(item.value),
            ).length > 0 && (
              <KeyValueTable
                title="Institute Overview"
                data={(institute as any).overview.filter(
                  (item: any) =>
                    item && isValidValue(item.key) && isValidValue(item.value),
                )}
                icon={<Info className="w-5 h-5" />}
              />
            )}

          {/* Academics Overview */}
          {institute.academics &&
            (isValidNumber(institute.academics.totalStudents) ||
              isValidNumber(institute.academics.totalFaculty) ||
              isValidValue(institute.academics.studentFacultyRatio) ||
              isValidNumber(institute.academics.internationalStudents) ||
              isValidNumber(institute.academics.totalPrograms)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Academic Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isValidNumber(institute.academics.totalStudents) && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="h-6 w-6 text-blue-600" />
                          <div className="text-sm text-blue-600 font-medium">
                            Total Students
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">
                          {institute.academics.totalStudents.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {isValidNumber(institute.academics.totalFaculty) && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center gap-3 mb-2">
                          <BookOpen className="h-6 w-6 text-green-600" />
                          <div className="text-sm text-green-600 font-medium">
                            Total Faculty
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                          {institute.academics.totalFaculty.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {isValidValue(institute.academics.studentFacultyRatio) && (
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Award className="h-6 w-6 text-purple-600" />
                          <div className="text-sm text-purple-600 font-medium">
                            Student:Faculty Ratio
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-purple-700">
                          {institute.academics.studentFacultyRatio}
                        </div>
                      </div>
                    )}
                    {isValidNumber(
                      institute.academics.internationalStudents,
                    ) && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Globe className="h-6 w-6 text-orange-600" />
                          <div className="text-sm text-orange-600 font-medium">
                            International Students
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-orange-700">
                          {institute.academics.internationalStudents.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {isValidNumber(institute.academics.totalPrograms) && (
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                        <div className="flex items-center gap-3 mb-2">
                          <GraduationCap className="h-6 w-6 text-pink-600" />
                          <div className="text-sm text-pink-600 font-medium">
                            Total Programs
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-pink-700">
                          {institute.academics.totalPrograms}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Schools */}
                  {(institute.academics as any).schools &&
                    (institute.academics as any).schools.filter((s: any) =>
                      isValidValue(s?.name),
                    ).length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-500" />
                          Schools & Departments
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(institute.academics as any).schools
                            ?.filter((s: any) => isValidValue(s?.name))
                            .map((school: any, index: number) => (
                              <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="font-semibold text-gray-900 mb-1">
                                  {school.name}
                                </div>
                                {isValidValue(school.established) && (
                                  <div className="text-sm text-gray-600 mb-2">
                                    Established: {school.established}
                                  </div>
                                )}
                                {school.programs &&
                                  school.programs.filter((p: string) =>
                                    isValidValue(p),
                                  ).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {school.programs
                                        .filter((p: string) => isValidValue(p))
                                        .map(
                                          (program: string, pIndex: number) => (
                                            <span
                                              key={pIndex}
                                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                                            >
                                              {program}
                                            </span>
                                          ),
                                        )}
                                    </div>
                                  )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

          {(institute as any).academics?.programOverviews &&
            (institute as any).academics.programOverviews.filter(
              (item: any) =>
                item && isValidValue(item.key) && isValidValue(item.value),
            ).length > 0 && (
              <KeyValueTable
                title="Program Statistics"
                data={(institute as any).academics.programOverviews.filter(
                  (item: any) =>
                    item && isValidValue(item.key) && isValidValue(item.value),
                )}
                icon={<BookOpen className="w-5 h-5" />}
              />
            )}

          {(institute as any).campusDetails && (
            <>
              {(isValidValue((institute as any).campusDetails.campusType) ||
                isValidValue((institute as any).campusDetails.environment) ||
                isValidValue((institute as any).campusDetails.totalArea)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Campus Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {isValidValue(
                        (institute as any).campusDetails.campusType,
                      ) && (
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Campus Type
                            </div>
                            <div className="font-medium">
                              {(institute as any).campusDetails.campusType}
                            </div>
                          </div>
                        </div>
                      )}
                      {isValidValue(
                        (institute as any).campusDetails.environment,
                      ) && (
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                          <MapPin className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Environment
                            </div>
                            <div className="font-medium">
                              {(institute as any).campusDetails.environment}
                            </div>
                          </div>
                        </div>
                      )}
                      {isValidValue(
                        (institute as any).campusDetails.totalArea,
                      ) && (
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                          <Building2 className="w-5 h-5 text-purple-600" />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Total Area
                            </div>
                            <div className="font-medium">
                              {(institute as any).campusDetails.totalArea}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <FacilityList
                facilities={(institute as any).campusDetails?.facilities}
                facilitiesArray={
                  (institute as any).campusDetails?.facilities_arr
                }
              />
            </>
          )}

          <FacultyStudentSection
            faculties={(institute as any).faculty_student_ratio?.faculties}
            students={(institute as any).faculty_student_ratio?.students}
          />

          <RankingsSection
            title={(institute as any).rankings?.title}
            description={(institute as any).rankings?.description}
            rankingsDescription={
              (institute as any).rankings?.rankingsDescription
            }
            nationalRankings={(institute as any).rankings?.national?.national}
            publisherRankings={(institute as any).rankings?.data}
          />

          {/* NIRF Rankings */}
          {validNirfRankings && validNirfRankings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  NIRF Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {validNirfRankings.map(([category, rank]: [string, any]) => (
                    <div
                      key={category}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200 hover:shadow-md transition-shadow"
                    >
                      <div className="text-sm text-gray-600 mb-2 font-medium">
                        {category}
                      </div>
                      <div className="text-2xl font-bold text-orange-700">
                        #{rank}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <PlacementsSection
            placementData={placementData}
            topRecruiters={(institute as any).placements?.topRecruiters || []}
            sectors={(institute as any).placements?.sectors || []}
          />

          <AdmissionsSection
            admissions={institute.admissions}
            contact={institute.contact}
            onApplyClick={handleApplyClick}
          />

          {(institute as any).rankings?.data &&
            (institute as any).rankings.data.filter((r: any) =>
              isValidNumber(r?.rank),
            ).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Publisher Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(institute as any).rankings.data
                      .filter((r: any) => isValidNumber(r?.rank))
                      .map((ranking: any, index: number) => (
                        <div
                          key={index}
                          className="text-center p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="text-2xl font-bold text-blue-600">
                            #{ranking.rank}
                          </div>
                          {(isValidValue(ranking.agency) ||
                            isValidValue(ranking.year)) && (
                            <div className="text-sm text-gray-600">
                              {[ranking.agency, ranking.year]
                                .filter(Boolean)
                                .join(" ")}
                            </div>
                          )}
                          {isValidValue(ranking.category) && (
                            <div className="text-sm font-medium">
                              {ranking.category}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Application Modal */}
          {showApplicationModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-auto my-8 max-h-[95vh] overflow-hidden flex flex-col">
                <div className="block md:hidden flex-shrink-0">
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
                    <button
                      onClick={() => setShowApplicationModal(false)}
                      className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                    >
                      <X className="h-6 w-6" />
                    </button>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">
                        Apply for Course
                      </h2>
                      <p className="text-blue-100">
                        Start your educational journey today
                      </p>
                    </div>
                  </div>

                  <div className="p-4 flex-1 overflow-y-auto">
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-base font-semibold text-gray-900 pb-1 border-b border-gray-200">
                          Personal Details
                        </h3>

                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Enter your full name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Enter your email"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone *
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Your phone"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                City *
                              </label>
                              <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Your city"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Course
                            </label>
                            <input
                              type="text"
                              name="course"
                              value={formData.course}
                              readOnly
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowApplicationModal(false)}
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Application"
                          )}
                        </Button>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-xs text-green-600">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <span>
                            Your information is secure and confidential
                          </span>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="hidden md:flex h-[80vh]">
                  <div className="w-2/5 bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center text-gray-800 p-8 relative">
                    <div className="text-center max-w-sm">
                      <div className="mb-4">
                        <img
                          src="/3 SCENE.svg"
                          alt="Education Journey Illustration"
                          className="w-[614px] mx-auto object-contain"
                        />
                      </div>

                      <h3 className="text-2xl font-bold mb-3 text-gray-900">
                        Begin Your Journey
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed mb-4">
                        Take the first step towards your dream career. Join
                        thousands of successful graduates.
                      </p>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Quick Process</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Instant Response</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                          Course Application
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Fill in your details to apply
                        </p>
                      </div>
                      <button
                        onClick={() => setShowApplicationModal(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex-1 p-6">
                      <form
                        onSubmit={handleFormSubmit}
                        className="h-full flex flex-col space-y-4"
                      >
                        <div className="space-y-4">
                          <h3 className="text-base font-semibold text-gray-900 pb-1 border-b border-gray-200">
                            Personal Information
                          </h3>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                placeholder="Enter your full name"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                placeholder="Enter your email address"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                placeholder="Enter your phone number"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                City *
                              </label>
                              <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                placeholder="Enter your city"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course Interested In
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name="course"
                                value={formData.course}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                              />
                              <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 flex-1">
                          <h3 className="text-base font-semibold text-gray-900 pb-1 border-b border-gray-200">
                            Eligibility Exams
                          </h3>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Exam
                              </label>
                              <Select
                                value={currentExam}
                                onValueChange={setCurrentExam}
                              >
                                <SelectTrigger className="w-full h-9 text-sm">
                                  <SelectValue placeholder="Choose an exam" />
                                </SelectTrigger>
                                <SelectContent className="z-[99999]">
                                  <SelectGroup>
                                    <SelectLabel>Engineering (PCM)</SelectLabel>
                                    <SelectItem value="JEE Main">
                                      JEE Main
                                    </SelectItem>
                                    <SelectItem value="JEE Advanced">
                                      JEE Advanced
                                    </SelectItem>
                                    <SelectItem value="BITSAT">
                                      BITSAT
                                    </SelectItem>
                                    <SelectItem value="VITEEE">
                                      VITEEE
                                    </SelectItem>
                                    <SelectItem value="COMEDK">
                                      COMEDK
                                    </SelectItem>
                                    <SelectItem value="MHT CET">
                                      MHT CET
                                    </SelectItem>
                                    <SelectItem value="KCET">KCET</SelectItem>
                                    <SelectItem value="EAMCET">
                                      EAMCET
                                    </SelectItem>
                                    <SelectItem value="GUJCET">
                                      GUJCET
                                    </SelectItem>
                                    <SelectItem value="WBJEE">WBJEE</SelectItem>
                                  </SelectGroup>
                                  <SelectGroup>
                                    <SelectLabel>Medical (PCB)</SelectLabel>
                                    <SelectItem value="NEET">NEET</SelectItem>
                                    <SelectItem value="AIIMS">AIIMS</SelectItem>
                                    <SelectItem value="JIPMER">
                                      JIPMER
                                    </SelectItem>
                                  </SelectGroup>
                                  <SelectGroup>
                                    <SelectLabel>Management</SelectLabel>
                                    <SelectItem value="CAT">CAT</SelectItem>
                                    <SelectItem value="XAT">XAT</SelectItem>
                                    <SelectItem value="SNAP">SNAP</SelectItem>
                                    <SelectItem value="CMAT">CMAT</SelectItem>
                                    <SelectItem value="MAT">MAT</SelectItem>
                                  </SelectGroup>
                                  <SelectGroup>
                                    <SelectLabel>Law</SelectLabel>
                                    <SelectItem value="CLAT">CLAT</SelectItem>
                                    <SelectItem value="AILET">AILET</SelectItem>
                                  </SelectGroup>
                                  <SelectGroup>
                                    <SelectLabel>General/Others</SelectLabel>
                                    <SelectItem value="CUET">CUET</SelectItem>
                                    <SelectItem value="GATE">GATE</SelectItem>
                                    <SelectItem value="Diploma CET">
                                      Diploma CET
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Score/Rank
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={currentScore}
                                  onChange={(e) =>
                                    setCurrentScore(e.target.value)
                                  }
                                  onKeyPress={handleKeyPress}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                  placeholder="e.g., 95 percentile, 1500 rank"
                                />
                                <button
                                  type="button"
                                  onClick={addEligibilityExam}
                                  disabled={
                                    !currentExam.trim() || !currentScore.trim()
                                  }
                                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {formData.eligibilityExams.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {formData.eligibilityExams.map((exam, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                                >
                                  <span>{exam.exam}</span>
                                  <span className="text-blue-600">•</span>
                                  <span>{exam.score}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeEligibilityExam(index)}
                                    className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowApplicationModal(false)}
                              className="flex-1 py-2 rounded-lg border-2 hover:bg-gray-50 text-sm"
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                "Submit Application"
                              )}
                            </Button>
                          </div>

                          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                            <span>
                              Your information is secure and confidential
                            </span>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
