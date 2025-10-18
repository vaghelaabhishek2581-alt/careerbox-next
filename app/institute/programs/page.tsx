"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  IndianRupee,
  Edit, 
  Trash2, 
  Eye,
  Award,
  BookOpen,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Program {
  id: string;
  name: string;
  code: string;
  degree: 'Certificate' | 'Diploma' | 'Bachelor' | 'Master' | 'PhD' | 'Post Graduate Diploma';
  field: string;
  specialization?: string;
  description: string;
  duration: {
    years: number;
    months: number;
  };
  mode: 'full-time' | 'part-time' | 'online' | 'hybrid';
  feeStructure: {
    totalFee: number;
    currency: string;
    paymentStructure: 'yearly' | 'semester' | 'monthly';
  };
  totalSeats: number;
  availableSeats: number;
  currentStudents: number;
  placementPercentage: number;
  status: 'active' | 'inactive' | 'discontinued';
  accreditation: string[];
  approvedBy: string[];
  createdAt: string;
}

export default function InstitutePrograms() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDegree, setFilterDegree] = useState("all");
  const [filterMode, setFilterMode] = useState("all");

  // Mock data - replace with actual API call
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: "1",
      name: "Computer Science Engineering",
      code: "CSE",
      degree: "Bachelor",
      field: "Engineering",
      specialization: "Computer Science",
      description: "Comprehensive program covering software development, algorithms, data structures, and emerging technologies.",
      duration: { years: 4, months: 0 },
      mode: "full-time",
      feeStructure: {
        totalFee: 400000,
        currency: "INR",
        paymentStructure: "yearly"
      },
      totalSeats: 120,
      availableSeats: 15,
      currentStudents: 105,
      placementPercentage: 95,
      status: "active",
      accreditation: ["NAAC A+", "NBA"],
      approvedBy: ["AICTE", "UGC"],
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "Master of Business Administration",
      code: "MBA",
      degree: "Master",
      field: "Management",
      specialization: "General Management",
      description: "Two-year full-time MBA program with specializations in Finance, Marketing, HR, and Operations.",
      duration: { years: 2, months: 0 },
      mode: "full-time",
      feeStructure: {
        totalFee: 800000,
        currency: "INR",
        paymentStructure: "yearly"
      },
      totalSeats: 60,
      availableSeats: 8,
      currentStudents: 52,
      placementPercentage: 98,
      status: "active",
      accreditation: ["NAAC A+", "AACSB"],
      approvedBy: ["AICTE", "UGC"],
      createdAt: "2024-01-20"
    },
    {
      id: "3",
      name: "Diploma in Mechanical Engineering",
      code: "DME",
      degree: "Diploma",
      field: "Engineering",
      specialization: "Mechanical",
      description: "Three-year diploma program focusing on mechanical systems, manufacturing, and industrial applications.",
      duration: { years: 3, months: 0 },
      mode: "full-time",
      feeStructure: {
        totalFee: 180000,
        currency: "INR",
        paymentStructure: "yearly"
      },
      totalSeats: 80,
      availableSeats: 25,
      currentStudents: 55,
      placementPercentage: 85,
      status: "active",
      accreditation: ["NAAC B+"],
      approvedBy: ["AICTE"],
      createdAt: "2024-02-01"
    },
    {
      id: "4",
      name: "Online Master of Computer Applications",
      code: "MCA-OL",
      degree: "Master",
      field: "Computer Applications",
      description: "Flexible online MCA program designed for working professionals with weekend classes.",
      duration: { years: 2, months: 0 },
      mode: "online",
      feeStructure: {
        totalFee: 250000,
        currency: "INR",
        paymentStructure: "semester"
      },
      totalSeats: 40,
      availableSeats: 12,
      currentStudents: 28,
      placementPercentage: 88,
      status: "active",
      accreditation: ["NAAC A"],
      approvedBy: ["UGC"],
      createdAt: "2024-02-10"
    }
  ]);

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

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (program.specialization && program.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDegree = filterDegree === "all" || program.degree === filterDegree;
    const matchesMode = filterMode === "all" || program.mode === filterMode;
    
    return matchesSearch && matchesDegree && matchesMode;
  });

  const getDegreeColor = (degree: string) => {
    switch (degree) {
      case 'Bachelor':
        return 'bg-blue-100 text-blue-700';
      case 'Master':
        return 'bg-purple-100 text-purple-700';
      case 'PhD':
        return 'bg-red-100 text-red-700';
      case 'Diploma':
        return 'bg-green-100 text-green-700';
      case 'Certificate':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'full-time':
        return 'bg-blue-100 text-blue-700';
      case 'part-time':
        return 'bg-orange-100 text-orange-700';
      case 'online':
        return 'bg-green-100 text-green-700';
      case 'hybrid':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatFee = (fee: number, currency: string) => {
    if (currency === 'INR') {
      return `₹${(fee / 100000).toFixed(1)}L`;
    }
    return `${currency} ${fee.toLocaleString()}`;
  };

  const handleDeleteProgram = (programId: string) => {
    setPrograms(prev => prev.filter(program => program.id !== programId));
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Program Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your institute's degree programs and courses
          </p>
        </div>
        <Button 
          onClick={() => router.push("/dashboard/institute/programs/new")}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Program
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Programs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {programs.filter(p => p.status === 'active').length}
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
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {programs.reduce((sum, program) => sum + program.currentStudents, 0)}
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
                <p className="text-sm font-medium text-gray-600">Avg. Placement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(programs.reduce((sum, program) => sum + program.placementPercentage, 0) / programs.length)}%
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
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Degree: {filterDegree === "all" ? "All" : filterDegree}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterDegree("all")}>
              All Degrees
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterDegree("Bachelor")}>
              Bachelor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterDegree("Master")}>
              Master
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterDegree("PhD")}>
              PhD
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterDegree("Diploma")}>
              Diploma
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterDegree("Certificate")}>
              Certificate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Mode: {filterMode === "all" ? "All" : filterMode}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterMode("all")}>
              All Modes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterMode("full-time")}>
              Full-time
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterMode("part-time")}>
              Part-time
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterMode("online")}>
              Online
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterMode("hybrid")}>
              Hybrid
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex gap-2">
                  <Badge className={getDegreeColor(program.degree)}>
                    {program.degree}
                  </Badge>
                  <Badge className={getModeColor(program.mode)}>
                    {program.mode}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      •••
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/institute/programs/${program.id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/institute/programs/${program.id}/edit`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Program
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteProgram(program.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Program
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-xl">{program.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{program.code}</span>
                <span>•</span>
                <span>{program.field}</span>
                {program.specialization && (
                  <>
                    <span>•</span>
                    <span>{program.specialization}</span>
                  </>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {program.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Duration and Fee */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-gray-600">
                        {program.duration.years} year{program.duration.years > 1 ? 's' : ''}
                        {program.duration.months > 0 && ` ${program.duration.months} months`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Fee</p>
                      <p className="text-sm text-gray-600">
                        {formatFee(program.feeStructure.totalFee, program.feeStructure.currency)}
                        <span className="text-xs ml-1">/{program.feeStructure.paymentStructure}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seats and Students */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{program.totalSeats}</p>
                    <p className="text-xs text-gray-600">Total Seats</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{program.availableSeats}</p>
                    <p className="text-xs text-gray-600">Available</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">{program.placementPercentage}%</p>
                    <p className="text-xs text-gray-600">Placement</p>
                  </div>
                </div>

                {/* Accreditation */}
                {program.accreditation.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {program.accreditation.map((acc, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {acc}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterDegree !== "all" || filterMode !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first program"
            }
          </p>
          {!searchTerm && filterDegree === "all" && filterMode === "all" && (
            <Button 
              onClick={() => router.push("/dashboard/institute/programs/new")}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Program
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
