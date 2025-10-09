"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Award, 
  Plus, 
  Search, 
  Filter, 
  Trophy,
  Medal,
  Star,
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  TrendingUp,
  Target,
  Crown
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Ranking {
  id: string;
  title: string;
  organization: string;
  category: 'national' | 'state' | 'international' | 'university' | 'program-specific';
  rank: number;
  totalParticipants?: number;
  year: number;
  description: string;
  certificateUrl?: string;
  verificationUrl?: string;
  status: 'verified' | 'pending' | 'unverified';
  createdAt: string;
}

interface Achievement {
  id: string;
  title: string;
  type: 'accreditation' | 'certification' | 'award' | 'recognition' | 'milestone';
  organization: string;
  description: string;
  dateAwarded: string;
  validUntil?: string;
  certificateUrl?: string;
  status: 'active' | 'expired' | 'pending';
  createdAt: string;
}

export default function InstituteRankings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<'rankings' | 'achievements'>('rankings');
  const [isRankingDialogOpen, setIsRankingDialogOpen] = useState(false);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);

  // Mock data - replace with actual API calls
  const [rankings, setRankings] = useState<Ranking[]>([
    {
      id: "1",
      title: "NIRF Engineering Ranking 2024",
      organization: "National Institutional Ranking Framework",
      category: "national",
      rank: 45,
      totalParticipants: 200,
      year: 2024,
      description: "Ranked 45th among engineering colleges in India by NIRF 2024",
      status: "verified",
      createdAt: "2024-04-15"
    },
    {
      id: "2",
      title: "Times Higher Education Asia Rankings",
      organization: "Times Higher Education",
      category: "international",
      rank: 150,
      totalParticipants: 500,
      year: 2024,
      description: "Ranked 150th in Asia by THE Asia University Rankings 2024",
      status: "verified",
      createdAt: "2024-06-10"
    },
    {
      id: "3",
      title: "State Engineering College Ranking",
      organization: "State Higher Education Council",
      category: "state",
      rank: 8,
      totalParticipants: 50,
      year: 2024,
      description: "8th position among state engineering colleges",
      status: "verified",
      createdAt: "2024-03-20"
    }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "NAAC A+ Accreditation",
      type: "accreditation",
      organization: "National Assessment and Accreditation Council",
      description: "Awarded NAAC A+ grade with CGPA 3.6 for academic excellence",
      dateAwarded: "2023-09-15",
      validUntil: "2028-09-15",
      status: "active",
      createdAt: "2023-09-15"
    },
    {
      id: "2",
      title: "NBA Accreditation - Computer Science",
      type: "accreditation",
      organization: "National Board of Accreditation",
      description: "NBA accreditation for Computer Science Engineering program",
      dateAwarded: "2023-11-20",
      validUntil: "2026-11-20",
      status: "active",
      createdAt: "2023-11-20"
    },
    {
      id: "3",
      title: "Best Innovation Award 2024",
      type: "award",
      organization: "Ministry of Education",
      description: "Recognized for outstanding innovation in engineering education",
      dateAwarded: "2024-01-10",
      status: "active",
      createdAt: "2024-01-10"
    },
    {
      id: "4",
      title: "ISO 9001:2015 Certification",
      type: "certification",
      organization: "International Organization for Standardization",
      description: "Quality management system certification",
      dateAwarded: "2022-05-15",
      validUntil: "2025-05-15",
      status: "active",
      createdAt: "2022-05-15"
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'international':
        return 'bg-purple-100 text-purple-700';
      case 'national':
        return 'bg-blue-100 text-blue-700';
      case 'state':
        return 'bg-green-100 text-green-700';
      case 'university':
        return 'bg-orange-100 text-orange-700';
      case 'program-specific':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'accreditation':
        return 'bg-blue-100 text-blue-700';
      case 'certification':
        return 'bg-green-100 text-green-700';
      case 'award':
        return 'bg-yellow-100 text-yellow-700';
      case 'recognition':
        return 'bg-purple-100 text-purple-700';
      case 'milestone':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'unverified':
      case 'expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return Crown;
    if (rank <= 10) return Trophy;
    if (rank <= 50) return Medal;
    return Award;
  };

  const filteredRankings = rankings.filter(ranking => {
    const matchesSearch = ranking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ranking.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || ranking.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || achievement.type === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Rankings & Achievements</h1>
          <p className="text-gray-600 mt-2">
            Showcase your institute's rankings, accreditations, and achievements
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isRankingDialogOpen} onOpenChange={setIsRankingDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Trophy className="w-4 h-4 mr-2" />
                Add Ranking
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Ranking</DialogTitle>
                <DialogDescription>
                  Add a new ranking or rating received by your institute
                </DialogDescription>
              </DialogHeader>
              {/* Ranking form would go here */}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRankingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button>Add Ranking</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAchievementDialogOpen} onOpenChange={setIsAchievementDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Achievement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Achievement</DialogTitle>
                <DialogDescription>
                  Add a new achievement, accreditation, or recognition
                </DialogDescription>
              </DialogHeader>
              {/* Achievement form would go here */}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAchievementDialogOpen(false)}>
                  Cancel
                </Button>
                <Button>Add Achievement</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rankings</p>
                <p className="text-2xl font-bold text-gray-900">{rankings.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best National Rank</p>
                <p className="text-2xl font-bold text-gray-900">
                  #{Math.min(...rankings.filter(r => r.category === 'national').map(r => r.rank))}
                </p>
              </div>
              <Crown className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accreditations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {achievements.filter(a => a.type === 'accreditation').length}
                </p>
              </div>
              <Star className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('rankings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'rankings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Rankings ({rankings.length})
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'achievements'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Achievements ({achievements.length})
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {activeTab === 'rankings' ? 'Category' : 'Type'}: {filterCategory === "all" ? "All" : filterCategory}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterCategory("all")}>
              All {activeTab === 'rankings' ? 'Categories' : 'Types'}
            </DropdownMenuItem>
            {activeTab === 'rankings' ? (
              <>
                <DropdownMenuItem onClick={() => setFilterCategory("international")}>
                  International
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory("national")}>
                  National
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory("state")}>
                  State
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory("university")}>
                  University
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory("program-specific")}>
                  Program Specific
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => setFilterCategory("accreditation")}>
                  Accreditation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory("certification")}>
                  Certification
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory("award")}>
                  Award
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory("recognition")}>
                  Recognition
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory("milestone")}>
                  Milestone
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      {activeTab === 'rankings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRankings.map((ranking) => {
            const RankIcon = getRankIcon(ranking.rank);
            return (
              <Card key={ranking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <Badge className={getCategoryColor(ranking.category)}>
                        {ranking.category}
                      </Badge>
                      <Badge className={getStatusColor(ranking.status)}>
                        {ranking.status}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          •••
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Ranking
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Ranking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <RankIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    Rank #{ranking.rank}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-gray-900">
                    {ranking.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{ranking.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{ranking.year}</span>
                      </div>
                      {ranking.totalParticipants && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {ranking.rank}/{ranking.totalParticipants}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 font-medium">
                        {ranking.organization}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAchievements.map((achievement) => (
            <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(achievement.type)}>
                      {achievement.type}
                    </Badge>
                    <Badge className={getStatusColor(achievement.status)}>
                      {achievement.status}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        •••
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Achievement
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Achievement
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  {achievement.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(achievement.dateAwarded).toLocaleDateString()}
                      </span>
                    </div>
                    {achievement.validUntil && (
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Valid until {new Date(achievement.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 font-medium">
                      {achievement.organization}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty States */}
      {activeTab === 'rankings' && filteredRankings.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Add your first ranking to showcase your institute's performance"
            }
          </p>
        </div>
      )}

      {activeTab === 'achievements' && filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Add your first achievement to highlight your institute's accomplishments"
            }
          </p>
        </div>
      )}
    </div>
  );
}
