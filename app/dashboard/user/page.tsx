// // "use client";

// // import { useState, useEffect } from "react";
// // import { useAuth } from "@/hooks/use-auth";
// // import {
// //   Search,
// //   Target,
// //   BookOpen,
// //   Users,
// //   BarChart2,
// //   MessageSquare,
// //   MapPin,
// //   Building2,
// //   Globe,
// //   Edit2,
// //   Plus,
// //   Briefcase,
// //   GraduationCap,
// //   Languages,
// // } from "lucide-react";
// // import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// // import { Button } from "@/components/ui/button";
// // import { Card } from "@/components/ui/card";
// // import { Progress } from "@/components/ui/progress";
// // import { Badge } from "@/components/ui/badge";
// // import { Separator } from "@/components/ui/separator";
// // import { ProfileEditorModal } from "@/components/profile-editor-modal";
// // import { LoadingSpinner } from "@/components/ui/loading-spinner";
// // import { type UserProfile } from "@/lib/types/profile";

// // interface Activity {
// //   id: string;
// //   type: "course" | "goal" | "connection";
// //   title: string;
// //   timestamp: string;
// // }

// // export default function UserDashboard() {
// //   const { user } = useAuth({ skipOnboarding: true });
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [profile, setProfile] = useState<UserProfile | null>(null);
// //   const [stats, setStats] = useState({
// //     completedCourses: 0,
// //     skillsAssessed: 0,
// //     careerGoals: 0,
// //     networkSize: 0,
// //   });
// //   const [activities, setActivities] = useState<Activity[]>([]);
// //   const [progress, setProgress] = useState({
// //     overall: 0,
// //     skills: 0,
// //     goals: 0,
// //   });

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       setIsLoading(true);
// //       try {
// //         // Fetch user stats
// //         const statsResponse = await fetch("/api/user/stats");
// //         if (statsResponse.ok) {
// //           const statsData = await statsResponse.json();
// //           setStats(statsData);
// //         }

// //         // Fetch recent activities
// //         const activitiesResponse = await fetch("/api/user/activities");
// //         if (activitiesResponse.ok) {
// //           const activitiesData = await activitiesResponse.json();
// //           setActivities(activitiesData.activities || []);
// //         }

// //         // Fetch progress
// //         const progressResponse = await fetch("/api/user/progress");
// //         if (progressResponse.ok) {
// //           const progressData = await progressResponse.json();
// //           setProgress(progressData);
// //         }

// //         // Fetch profile data
// //         const profileResponse = await fetch("/api/user/profile");
// //         if (profileResponse.ok) {
// //           const profileData = await profileResponse.json();
// //           setProfile(profileData);
// //         }
// //       } catch (error) {
// //         console.error("Error fetching dashboard data:", error);
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchData();
// //   }, []);

// //   if (isLoading || !profile) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <LoadingSpinner size="lg" text="Loading dashboard..." />
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {/* Profile Header */}
// //       <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-600">
// //         <div className="absolute -bottom-16 left-8">
// //           <Avatar className="h-32 w-32 border-4 border-white">
// //             <AvatarImage src={profile.profileImage || user?.image || ""} />
// //             <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-4xl text-white">
// //               {profile.personalDetails?.firstName?.[0]}
// //               {profile.personalDetails?.lastName?.[0]}
// //             </AvatarFallback>
// //           </Avatar>
// //         </div>
// //       </div>

// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
// //         {/* Profile Info */}
// //         <div className="flex justify-between items-start mb-8">
// //           <div>
// //             <h1 className="text-3xl font-bold">
// //               {profile.personalDetails?.firstName}{" "}
// //               {profile.personalDetails?.lastName}
// //             </h1>
// //             <p className="text-gray-600 mt-1">
// //               {profile.bio || "No bio added yet"}
// //             </p>
// //             <div className="flex items-center gap-4 mt-3">
// //               {profile.location && (
// //                 <div className="flex items-center text-gray-600">
// //                   <MapPin className="h-4 w-4 mr-1" />
// //                   {profile.location}
// //                 </div>
// //               )}
// //               {profile.personalDetails?.professionalHeadline && (
// //                 <div className="flex items-center text-gray-600">
// //                   <Briefcase className="h-4 w-4 mr-1" />
// //                   {profile.personalDetails.professionalHeadline}
// //                 </div>
// //               )}
// //               {profile.website && (
// //                 <div className="flex items-center text-gray-600">
// //                   <Globe className="h-4 w-4 mr-1" />
// //                   <a
// //                     href={profile.website}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="hover:text-blue-600"
// //                   >
// //                     Website
// //                   </a>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //           <Button
// //             variant="outline"
// //             className="flex items-center gap-2"
// //             onClick={() => setIsEditing(true)}
// //           >
// //             <Edit2 className="h-4 w-4" />
// //             Edit Profile
// //           </Button>
// //         </div>

// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// //           {/* Left Column */}
// //           <div className="space-y-8">
// //             {/* Skills */}
// //             <Card className="p-6">
// //               <div className="flex items-center justify-between mb-4">
// //                 <h2 className="text-lg font-semibold">Skills</h2>
// //               </div>
// //               <div className="flex flex-wrap gap-2">
// //                 {profile.skills?.map((skill) => (
// //                   <Badge key={skill} variant="secondary">
// //                     {skill}
// //                   </Badge>
// //                 ))}
// //                 {!profile.skills?.length && (
// //                   <p className="text-gray-500 text-sm">No skills added yet</p>
// //                 )}
// //               </div>
// //             </Card>

// //             {/* Languages */}
// //             <Card className="p-6">
// //               <div className="flex items-center justify-between mb-4">
// //                 <h2 className="text-lg font-semibold">Languages</h2>
// //               </div>
// //               <div className="space-y-3">
// //                 {profile.languages?.map((lang) => (
// //                   <div
// //                     key={lang.name}
// //                     className="flex items-center justify-between"
// //                   >
// //                     <span>{lang.name}</span>
// //                     <Badge>{lang.level}</Badge>
// //                   </div>
// //                 ))}
// //                 {!profile.languages?.length && (
// //                   <p className="text-gray-500 text-sm">
// //                     No languages added yet
// //                   </p>
// //                 )}
// //               </div>
// //             </Card>
// //           </div>

// //           {/* Center Column */}
// //           <div className="lg:col-span-2 space-y-8">
// //             {/* Stats Grid */}
// //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //               <Card className="p-4">
// //                 <div className="flex items-center justify-between">
// //                   <div>
// //                     <p className="text-sm font-medium text-gray-500">
// //                       Completed Courses
// //                     </p>
// //                     <h3 className="text-2xl font-bold">
// //                       {stats.completedCourses}
// //                     </h3>
// //                   </div>
// //                   <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
// //                     <BookOpen className="h-5 w-5 text-blue-600" />
// //                   </div>
// //                 </div>
// //               </Card>

// //               <Card className="p-4">
// //                 <div className="flex items-center justify-between">
// //                   <div>
// //                     <p className="text-sm font-medium text-gray-500">
// //                       Skills Assessed
// //                     </p>
// //                     <h3 className="text-2xl font-bold">
// //                       {stats.skillsAssessed}
// //                     </h3>
// //                   </div>
// //                   <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
// //                     <Target className="h-5 w-5 text-green-600" />
// //                   </div>
// //                 </div>
// //               </Card>

// //               <Card className="p-4">
// //                 <div className="flex items-center justify-between">
// //                   <div>
// //                     <p className="text-sm font-medium text-gray-500">
// //                       Career Goals
// //                     </p>
// //                     <h3 className="text-2xl font-bold">{stats.careerGoals}</h3>
// //                   </div>
// //                   <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
// //                     <BarChart2 className="h-5 w-5 text-purple-600" />
// //                   </div>
// //                 </div>
// //               </Card>

// //               <Card className="p-4">
// //                 <div className="flex items-center justify-between">
// //                   <div>
// //                     <p className="text-sm font-medium text-gray-500">Network</p>
// //                     <h3 className="text-2xl font-bold">{stats.networkSize}</h3>
// //                   </div>
// //                   <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
// //                     <Users className="h-5 w-5 text-orange-600" />
// //                   </div>
// //                 </div>
// //               </Card>
// //             </div>

// //             {/* Career Progress */}
// //             <Card className="p-6">
// //               <h2 className="text-lg font-semibold mb-4">Career Progress</h2>
// //               <div className="space-y-6">
// //                 <div>
// //                   <div className="flex justify-between mb-2">
// //                     <span className="text-sm font-medium">
// //                       Overall Progress
// //                     </span>
// //                     <span className="text-sm text-gray-500">
// //                       {progress.overall}%
// //                     </span>
// //                   </div>
// //                   <Progress value={progress.overall} className="h-2" />
// //                 </div>
// //                 <div>
// //                   <div className="flex justify-between mb-2">
// //                     <span className="text-sm font-medium">
// //                       Skills Development
// //                     </span>
// //                     <span className="text-sm text-gray-500">
// //                       {progress.skills}%
// //                     </span>
// //                   </div>
// //                   <Progress value={progress.skills} className="h-2" />
// //                 </div>
// //                 <div>
// //                   <div className="flex justify-between mb-2">
// //                     <span className="text-sm font-medium">
// //                       Goal Achievement
// //                     </span>
// //                     <span className="text-sm text-gray-500">
// //                       {progress.goals}%
// //                     </span>
// //                   </div>
// //                   <Progress value={progress.goals} className="h-2" />
// //                 </div>
// //               </div>
// //             </Card>

// //             {/* Recent Activities */}
// //             <Card className="p-6">
// //               <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
// //               <div className="space-y-4">
// //                 {activities.map((activity) => (
// //                   <div key={activity.id} className="flex items-start space-x-3">
// //                     <div
// //                       className={`
// //                         h-2 w-2 mt-2 rounded-full
// //                         ${activity.type === "course" ? "bg-blue-500" : ""}
// //                         ${activity.type === "goal" ? "bg-green-500" : ""}
// //                         ${activity.type === "connection" ? "bg-purple-500" : ""}
// //                       `}
// //                     />
// //                     <div>
// //                       <p className="text-sm">{activity.title}</p>
// //                       <p className="text-xs text-gray-500">
// //                         {activity.timestamp}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 ))}
// //                 {activities.length === 0 && (
// //                   <p className="text-gray-500 text-center py-4">
// //                     No recent activities
// //                   </p>
// //                 )}
// //               </div>
// //             </Card>
// //           </div>
// //         </div>
// //       </div>

// //       <ProfileEditorModal
// //         open={isEditing}
// //         onOpenChange={setIsEditing}
// //         initialData={profile}
// //         onUpdate={setProfile}
// //       />
// //     </div>
// //   );
// // }
// // "use client";

// // import { useState, useEffect } from "react";
// // import { useAuth } from "@/hooks/use-auth";
// // import {
// //   Search,
// //   Target,
// //   BookOpen,
// //   Users,
// //   BarChart2,
// //   MessageSquare,
// //   MapPin,
// //   Building2,
// //   Globe,
// //   Edit2,
// //   Plus,
// //   Briefcase,
// //   GraduationCap,
// //   Languages,
// // } from "lucide-react";
// // import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// // import { Button } from "@/components/ui/button";
// // import { Card } from "@/components/ui/card";
// // import { Progress } from "@/components/ui/progress";
// // import { Badge } from "@/components/ui/badge";
// // import { Separator } from "@/components/ui/separator";
// // import { ProfileEditorModal } from "@/components/profile-editor-modal";
// // import { LoadingSpinner } from "@/components/ui/loading-spinner";
// // import { type PublicUser } from "@/lib/types/user";

// // interface Activity {
// //   id: string;
// //   type: "course" | "goal" | "connection";
// //   title: string;
// //   timestamp: string;
// // }

// // interface DashboardStats {
// //   completedCourses: number;
// //   skillsAssessed: number;
// //   careerGoals: number;
// //   networkSize: number;
// // }

// // interface DashboardProgress {
// //   overall: number;
// //   skills: number;
// //   goals: number;
// // }

// // export default function UserDashboard() {
// //   const { user } = useAuth({ skipOnboarding: true });
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [profile, setProfile] = useState<PublicUser | null>(null);
// //   const [stats, setStats] = useState<DashboardStats>({
// //     completedCourses: 0,
// //     skillsAssessed: 0,
// //     careerGoals: 0,
// //     networkSize: 0,
// //   });
// //   const [activities, setActivities] = useState<Activity[]>([]);
// //   const [progress, setProgress] = useState<DashboardProgress>({
// //     overall: 0,
// //     skills: 0,
// //     goals: 0,
// //   });

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       setIsLoading(true);
// //       try {
// //         // Fetch profile data first as it's most important
// //         const profileResponse = await fetch("/api/user/profile");
// //         if (profileResponse.ok) {
// //           const profileData = await profileResponse.json();
// //           setProfile(profileData);
// //         }

// //         // Fetch user stats - handle gracefully if endpoint doesn't exist
// //         try {
// //           const statsResponse = await fetch("/api/user/stats");
// //           if (statsResponse.ok) {
// //             const statsData = await statsResponse.json();
// //             setStats(statsData);
// //           }
// //         } catch (error) {
// //           console.log("Stats endpoint not available, using defaults");
// //         }

// //         // Fetch recent activities
// //         try {
// //           const activitiesResponse = await fetch("/api/user/activities");
// //           if (activitiesResponse.ok) {
// //             const activitiesData = await activitiesResponse.json();
// //             setActivities(activitiesData.activities || []);
// //           }
// //         } catch (error) {
// //           console.log("Activities endpoint not available, using defaults");
// //         }

// //         // Fetch progress - handle gracefully if endpoint doesn't exist
// //         try {
// //           const progressResponse = await fetch("/api/user/progress");
// //           if (progressResponse.ok) {
// //             const progressData = await progressResponse.json();
// //             setProgress(progressData);
// //           }
// //         } catch (error) {
// //           console.log("Progress endpoint not available, using defaults");
// //         }
// //       } catch (error) {
// //         console.error("Error fetching dashboard data:", error);
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchData();
// //   }, []);

// //   const handleProfileUpdate = (updatedProfile: PublicUser) => {
// //     setProfile(updatedProfile);
// //   };

// //   if (isLoading || !profile) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <LoadingSpinner size="lg" text="Loading dashboard..." />
// //       </div>
// //     );
// //   }

// //   // Helper function to get user's display name
// //   const getDisplayName = () => {
// //     if (
// //       profile.personalDetails?.firstName &&
// //       profile.personalDetails?.lastName
// //     ) {
// //       return `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`;
// //     }
// //     return profile.name || "User";
// //   };

// //   // Helper function to get user's initials
// //   const getInitials = () => {
// //     if (
// //       profile.personalDetails?.firstName &&
// //       profile.personalDetails?.lastName
// //     ) {
// //       return `${profile.personalDetails.firstName[0]}${profile.personalDetails.lastName[0]}`;
// //     }
// //     const name = profile.name || "User";
// //     const parts = name.split(" ");
// //     if (parts.length >= 2) {
// //       return `${parts[0][0]}${parts[1][0]}`;
// //     }
// //     return name[0] || "U";
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {/* Profile Header */}
// //       <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-600">
// //         {profile.coverImage && (
// //           <img
// //             src={profile.coverImage}
// //             alt="Cover"
// //             className="w-full h-full object-cover"
// //           />
// //         )}
// //         <div className="absolute -bottom-16 left-8">
// //           <Avatar className="h-32 w-32 border-4 border-white">
// //             <AvatarImage src={profile.profileImage || profile.avatar || ""} />
// //             <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-4xl text-white">
// //               {getInitials()}
// //             </AvatarFallback>
// //           </Avatar>
// //         </div>
// //       </div>

// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
// //         {/* Profile Info */}
// //         <div className="flex justify-between items-start mb-8">
// //           <div>
// //             <h1 className="text-3xl font-bold">{getDisplayName()}</h1>
// //             <p className="text-gray-600 mt-1">
// //               {profile.bio || "No bio added yet"}
// //             </p>
// //             <div className="flex items-center gap-4 mt-3">
// //               {profile.location && (
// //                 <div className="flex items-center text-gray-600">
// //                   <MapPin className="h-4 w-4 mr-1" />
// //                   {profile.location}
// //                 </div>
// //               )}
// //               {profile.company && (
// //                 <div className="flex items-center text-gray-600">
// //                   <Building2 className="h-4 w-4 mr-1" />
// //                   {profile.company}
// //                 </div>
// //               )}
// //               {profile.userType && (
// //                 <Badge variant="outline" className="capitalize">
// //                   {profile.userType}
// //                 </Badge>
// //               )}
// //               {profile.activeRole && (
// //                 <Badge variant="secondary" className="capitalize">
// //                   {profile.activeRole.replace("_", " ")}
// //                 </Badge>
// //               )}
// //               {profile.website && (
// //                 <div className="flex items-center text-gray-600">
// //                   <Globe className="h-4 w-4 mr-1" />
// //                   <a
// //                     href={profile.website}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="hover:text-blue-600"
// //                   >
// //                     Website
// //                   </a>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //           <Button
// //             variant="outline"
// //             className="flex items-center gap-2"
// //             onClick={() => setIsEditing(true)}
// //           >
// //             <Edit2 className="h-4 w-4" />
// //             Edit Profile
// //           </Button>
// //         </div>

// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// //           {/* Left Column */}
// //           <div className="space-y-8">
// //             {/* Skills */}
// //             <Card className="p-6">
// //               <div className="flex items-center justify-between mb-4">
// //                 <h2 className="text-lg font-semibold">Skills</h2>
// //                 <Button
// //                   variant="ghost"
// //                   size="sm"
// //                   onClick={() => setIsEditing(true)}
// //                 >
// //                   <Plus className="h-4 w-4" />
// //                 </Button>
// //               </div>
// //               <div className="flex flex-wrap gap-2">
// //                 {profile.skills && profile.skills.length > 0 ? (
// //                   profile.skills.map((skill) => (
// //                     <Badge key={skill} variant="secondary">
// //                       {skill}
// //                     </Badge>
// //                   ))
// //                 ) : (
// //                   <p className="text-gray-500 text-sm">No skills added yet</p>
// //                 )}
// //               </div>
// //             </Card>

// //             {/* Languages */}
// //             <Card className="p-6">
// //               <div className="flex items-center justify-between mb-4">
// //                 <h2 className="text-lg font-semibold">Languages</h2>
// //                 <Button
// //                   variant="ghost"
// //                   size="sm"
// //                   onClick={() => setIsEditing(true)}
// //                 >
// //                   <Plus className="h-4 w-4" />
// //                 </Button>
// //               </div>
// //               <div className="space-y-3">
// //                 {profile.languages && profile.languages.length > 0 ? (
// //                   profile.languages.map((lang) => (
// //                     <div
// //                       key={lang.name}
// //                       className="flex items-center justify-between"
// //                     >
// //                       <span>{lang.name}</span>
// //                       <Badge variant="outline" className="capitalize">
// //                         {lang.level.toLowerCase()}
// //                       </Badge>
// //                     </div>
// //                   ))
// //                 ) : (
// //                   <p className="text-gray-500 text-sm">
// //                     No languages added yet
// //                   </p>
// //                 )}
// //               </div>
// //             </Card>

// //             {/* Work Experience */}
// //             {profile.workExperiences && profile.workExperiences.length > 0 && (
// //               <Card className="p-6">
// //                 <div className="flex items-center justify-between mb-4">
// //                   <h2 className="text-lg font-semibold">Experience</h2>
// //                   <Button
// //                     variant="ghost"
// //                     size="sm"
// //                     onClick={() => setIsEditing(true)}
// //                   >
// //                     <Edit2 className="h-4 w-4" />
// //                   </Button>
// //                 </div>
// //                 <div className="space-y-4">
// //                   {profile.workExperiences.slice(0, 2).map((exp) => (
// //                     <div key={exp.id || `${exp.company}-${exp.position}`}>
// //                       <h3 className="font-medium">{exp.position}</h3>
// //                       <p className="text-sm text-gray-600">{exp.company}</p>
// //                       <p className="text-xs text-gray-500">
// //                         {exp.startDate} -{" "}
// //                         {exp.current ? "Present" : exp.endDate}
// //                       </p>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </Card>
// //             )}

// //             {/* Education */}
// //             {profile.education && profile.education.length > 0 && (
// //               <Card className="p-6">
// //                 <div className="flex items-center justify-between mb-4">
// //                   <h2 className="text-lg font-semibold">Education</h2>
// //                   <Button
// //                     variant="ghost"
// //                     size="sm"
// //                     onClick={() => setIsEditing(true)}
// //                   >
// //                     <Edit2 className="h-4 w-4" />
// //                   </Button>
// //                 </div>
// //                 <div className="space-y-4">
// //                   {profile.education.slice(0, 2).map((edu) => (
// //                     <div key={edu.id || `${edu.institution}-${edu.degree}`}>
// //                       <h3 className="font-medium">{edu.degree}</h3>
// //                       <p className="text-sm text-gray-600">{edu.institution}</p>
// //                       <p className="text-xs text-gray-500">
// //                         {edu.startDate} -{" "}
// //                         {edu.current ? "Present" : edu.endDate}
// //                       </p>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </Card>
// //             )}
// //           </div>

// //           {/* Center Column */}
// //           <div className="lg:col-span-2 space-y-8">
// //             {/* Stats Grid */}
// //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //               <Card className="p-4">
// //                 <div className="flex items-center justify-between">
// //                   <div>
// //                     <p className="text-sm font-medium text-gray-500">
// //                       Completed Courses
// //                     </p>
// //                     <h3 className="text-2xl font-bold">
// //                       {stats.completedCourses}
// //                     </h3>
// //                   </div>
// //                   <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
// //                     <BookOpen className="h-5 w-5 text-blue-600" />
// //                   </div>
// //                 </div>
// //               </Card>

// //               <Card className="p-4">
// //                 <div className="flex items-center justify-between">
// //                   <div>
// //                     <p className="text-sm font-medium text-gray-500">
// //                       Skills Assessed
// //                     </p>
// //                     <h3 className="text-2xl font-bold">
// //                       {stats.skillsAssessed}
// //                     </h3>
// //                   </div>
// //                   <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
// //                     <Target className="h-5 w-5 text-green-600" />
// //                   </div>
// //                 </div>
// //               </Card>

// //               <Card className="p-4">
// //                 <div className="flex items-center justify-between">
// //                   <div>
// //                     <p className="text-sm font-medium text-gray-500">
// //                       Career Goals
// //                     </p>
// //                     <h3 className="text-2xl font-bold">{stats.careerGoals}</h3>
// //                   </div>
// //                   <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
// //                     <BarChart2 className="h-5 w-5 text-purple-600" />
// //                   </div>
// //                 </div>
// //               </Card>

// //               <Card className="p-4">
// //                 <div className="flex items-center justify-between">
// //                   <div>
// //                     <p className="text-sm font-medium text-gray-500">Network</p>
// //                     <h3 className="text-2xl font-bold">{stats.networkSize}</h3>
// //                   </div>
// //                   <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
// //                     <Users className="h-5 w-5 text-orange-600" />
// //                   </div>
// //                 </div>
// //               </Card>
// //             </div>

// //             {/* Career Progress */}
// //             <Card className="p-6">
// //               <h2 className="text-lg font-semibold mb-4">Career Progress</h2>
// //               <div className="space-y-6">
// //                 <div>
// //                   <div className="flex justify-between mb-2">
// //                     <span className="text-sm font-medium">
// //                       Overall Progress
// //                     </span>
// //                     <span className="text-sm text-gray-500">
// //                       {progress.overall}%
// //                     </span>
// //                   </div>
// //                   <Progress value={progress.overall} className="h-2" />
// //                 </div>
// //                 <div>
// //                   <div className="flex justify-between mb-2">
// //                     <span className="text-sm font-medium">
// //                       Skills Development
// //                     </span>
// //                     <span className="text-sm text-gray-500">
// //                       {progress.skills}%
// //                     </span>
// //                   </div>
// //                   <Progress value={progress.skills} className="h-2" />
// //                 </div>
// //                 <div>
// //                   <div className="flex justify-between mb-2">
// //                     <span className="text-sm font-medium">
// //                       Goal Achievement
// //                     </span>
// //                     <span className="text-sm text-gray-500">
// //                       {progress.goals}%
// //                     </span>
// //                   </div>
// //                   <Progress value={progress.goals} className="h-2" />
// //                 </div>
// //               </div>
// //             </Card>

// //             {/* Recent Activities */}
// //             <Card className="p-6">
// //               <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
// //               <div className="space-y-4">
// //                 {activities.length > 0 ? (
// //                   activities.map((activity) => (
// //                     <div
// //                       key={activity.id}
// //                       className="flex items-start space-x-3"
// //                     >
// //                       <div
// //                         className={`
// //                           h-2 w-2 mt-2 rounded-full
// //                           ${activity.type === "course" ? "bg-blue-500" : ""}
// //                           ${activity.type === "goal" ? "bg-green-500" : ""}
// //                           ${
// //                             activity.type === "connection"
// //                               ? "bg-purple-500"
// //                               : ""
// //                           }
// //                         `}
// //                       />
// //                       <div>
// //                         <p className="text-sm">{activity.title}</p>
// //                         <p className="text-xs text-gray-500">
// //                           {activity.timestamp}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   ))
// //                 ) : (
// //                   <div className="text-center py-8">
// //                     <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
// //                     <p className="text-gray-500 text-sm">
// //                       No recent activities
// //                     </p>
// //                     <p className="text-gray-400 text-xs">
// //                       Start exploring to see your activities here
// //                     </p>
// //                   </div>
// //                 )}
// //               </div>
// //             </Card>
// //           </div>
// //         </div>
// //       </div>

// //       <ProfileEditorModal
// //         open={isEditing}
// //         onOpenChange={setIsEditing}
// //         initialData={profile}
// //         onUpdate={handleProfileUpdate}
// //       />
// //     </div>
// //   );
// // }
// "use client";

// import { useState, useEffect } from "react";
// import {
//   Edit2,
//   Plus,
//   MapPin,
//   Building2,
//   Globe,
//   Briefcase,
//   GraduationCap,
//   Languages,
//   Award,
//   Users,
//   Camera,
//   Settings,
//   Share2,
//   MoreHorizontal,
//   Star,
//   Calendar,
//   Mail,
//   Phone,
//   Verified,
//   BookOpen,
//   Target,
//   BarChart2,
//   MessageSquare,
// } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Progress } from "@/components/ui/progress";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";

// // Sample data
// const profileData = {
//   id: "1",
//   name: "Mahesh Patel",
//   title: "Owner @ Kivi Cloud",
//   location: "Ahmedabad, India",
//   followers: "10000K+",
//   following: "156",
//   verified: true,
//   profileImage: "/api/placeholder/150/150",
//   coverImage: "/api/placeholder/800/300",
//   bio: "Passionate entrepreneur and tech enthusiast building the next generation of cloud solutions. I love connecting with like-minded individuals and sharing knowledge about emerging technologies.",
//   email: "mahesh@kivicloud.com",
//   phone: "+91 98765 43210",
//   website: "https://kivicloud.com",
//   skills: [
//     "Node.js - Intermediate",
//     "React - Intermediate",
//     "Next.js - Intermediate",
//     "Python",
//     "JavaScript",
//     "TypeScript",
//     "AWS",
//     "Docker",
//   ],
//   languages: [
//     { name: "Gujarati", level: "Native" },
//     { name: "Hindi", level: "Intermediate" },
//     { name: "English", level: "Intermediate" },
//   ],
//   workExperiences: [
//     {
//       id: "1",
//       title: "Owner",
//       company: "Kivi Cloud",
//       duration: "Jan 2023 - Present",
//       location: "Ahmedabad, India",
//       type: "Full-time",
//       description: "Founder of the company",
//       skills: ["Startup", "Management"],
//     },
//   ],
//   education: [
//     {
//       id: "1",
//       degree: "M.Sc. Technology",
//       institution: "Department of Mathematics, IITGU",
//       duration: "2020 - 2021",
//       location: "Gujarat, India",
//     },
//   ],
//   stats: {
//     completedCourses: 12,
//     skillsAssessed: 8,
//     careerGoals: 3,
//     networkSize: 150,
//   },
//   progress: {
//     overall: 85,
//     skills: 75,
//     goals: 90,
//   },
// };

// // Schemas for form validation
// const personalDetailsSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   title: z.string().optional(),
//   bio: z.string().optional(),
//   location: z.string().optional(),
//   email: z.string().email().optional(),
//   phone: z.string().optional(),
//   website: z.string().url().optional().or(z.literal("")),
// });

// const workExperienceSchema = z.object({
//   title: z.string().min(1, "Title is required"),
//   company: z.string().min(1, "Company is required"),
//   duration: z.string().min(1, "Duration is required"),
//   location: z.string().optional(),
//   type: z.string().optional(),
//   description: z.string().optional(),
// });

// const educationSchema = z.object({
//   degree: z.string().min(1, "Degree is required"),
//   institution: z.string().min(1, "Institution is required"),
//   duration: z.string().min(1, "Duration is required"),
//   location: z.string().optional(),
// });

// export default function ModernProfileDashboard() {
//   const [profile, setProfile] = useState(profileData);
//   const [activeModal, setActiveModal] = useState(null);
//   const [editingItem, setEditingItem] = useState(null);

//   // Form hooks
//   const personalForm = useForm({
//     resolver: zodResolver(personalDetailsSchema),
//     defaultValues: {
//       name: profile.name,
//       title: profile.title,
//       bio: profile.bio,
//       location: profile.location,
//       email: profile.email,
//       phone: profile.phone,
//       website: profile.website,
//     },
//   });

//   const workForm = useForm({
//     resolver: zodResolver(workExperienceSchema),
//     defaultValues: {
//       title: "",
//       company: "",
//       duration: "",
//       location: "",
//       type: "Full-time",
//       description: "",
//     },
//   });

//   const educationForm = useForm({
//     resolver: zodResolver(educationSchema),
//     defaultValues: {
//       degree: "",
//       institution: "",
//       duration: "",
//       location: "",
//     },
//   });

//   const openModal = (modalType, item = null) => {
//     setActiveModal(modalType);
//     setEditingItem(item);

//     if (modalType === "personal" && item) {
//       personalForm.reset(item);
//     } else if (modalType === "work" && item) {
//       workForm.reset(item);
//     } else if (modalType === "education" && item) {
//       educationForm.reset(item);
//     }
//   };

//   const closeModal = () => {
//     setActiveModal(null);
//     setEditingItem(null);
//   };

//   const handlePersonalSubmit = (data) => {
//     setProfile((prev) => ({ ...prev, ...data }));
//     closeModal();
//   };

//   const handleWorkSubmit = (data) => {
//     if (editingItem) {
//       setProfile((prev) => ({
//         ...prev,
//         workExperiences: prev.workExperiences.map((exp) =>
//           exp.id === editingItem.id ? { ...exp, ...data } : exp
//         ),
//       }));
//     } else {
//       setProfile((prev) => ({
//         ...prev,
//         workExperiences: [
//           ...prev.workExperiences,
//           { ...data, id: Date.now().toString() },
//         ],
//       }));
//     }
//     closeModal();
//     workForm.reset();
//   };

//   const handleEducationSubmit = (data) => {
//     if (editingItem) {
//       setProfile((prev) => ({
//         ...prev,
//         education: prev.education.map((edu) =>
//           edu.id === editingItem.id ? { ...edu, ...data } : edu
//         ),
//       }));
//     } else {
//       setProfile((prev) => ({
//         ...prev,
//         education: [...prev.education, { ...data, id: Date.now().toString() }],
//       }));
//     }
//     closeModal();
//     educationForm.reset();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Cover Image Section */}
//       <div className="relative">
//         <div
//           className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 bg-cover bg-center relative"
//           style={{ backgroundImage: `url(${profile.coverImage})` }}
//         >
//           <div className="absolute inset-0 bg-black bg-opacity-20"></div>
//           <Button
//             variant="secondary"
//             size="sm"
//             className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
//             onClick={() => openModal("cover")}
//           >
//             <Camera className="h-4 w-4 mr-2" />
//             Edit Cover
//           </Button>
//         </div>

//         {/* Profile Image */}
//         <div className="absolute -bottom-16 left-8">
//           <div className="relative">
//             <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
//               <AvatarImage src={profile.profileImage} alt={profile.name} />
//               <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
//                 {profile.name
//                   .split(" ")
//                   .map((n) => n[0])
//                   .join("")}
//               </AvatarFallback>
//             </Avatar>
//             <Button
//               size="sm"
//               variant="secondary"
//               className="absolute bottom-2 right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md"
//               onClick={() => openModal("profileImage")}
//             >
//               <Camera className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
//         {/* Profile Header */}
//         <div className="flex justify-between items-start mb-8">
//           <div className="flex-1">
//             <div className="flex items-center gap-3 mb-2">
//               <h1 className="text-3xl font-bold text-gray-900">
//                 {profile.name}
//               </h1>
//               {profile.verified && (
//                 <Verified className="h-6 w-6 text-blue-600" />
//               )}
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => openModal("personal", profile)}
//                 className="text-gray-600 hover:text-gray-900"
//               >
//                 <Edit2 className="h-4 w-4" />
//               </Button>
//             </div>

//             <p className="text-lg text-gray-600 mb-3">{profile.title}</p>

//             <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
//               {profile.location && (
//                 <div className="flex items-center">
//                   <MapPin className="h-4 w-4 mr-1" />
//                   {profile.location}
//                 </div>
//               )}
//               {profile.email && (
//                 <div className="flex items-center">
//                   <Mail className="h-4 w-4 mr-1" />
//                   {profile.email}
//                 </div>
//               )}
//               {profile.website && (
//                 <div className="flex items-center">
//                   <Globe className="h-4 w-4 mr-1" />
//                   <a
//                     href={profile.website}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 hover:underline"
//                   >
//                     Website
//                   </a>
//                 </div>
//               )}
//             </div>

//             <div className="flex items-center gap-6 mb-4">
//               <div className="text-sm">
//                 <span className="font-bold text-gray-900">
//                   {profile.followers}
//                 </span>
//                 <span className="text-gray-600 ml-1">Followers</span>
//               </div>
//               <div className="text-sm">
//                 <span className="font-bold text-gray-900">
//                   {profile.following}
//                 </span>
//                 <span className="text-gray-600 ml-1">Following</span>
//               </div>
//             </div>

//             {profile.bio && (
//               <p className="text-gray-700 mb-4 max-w-2xl">{profile.bio}</p>
//             )}
//           </div>

//           <div className="flex gap-2">
//             <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
//               <Plus className="h-4 w-4 mr-2" />
//               Add Profile Sections
//             </Button>
//             <Button variant="outline">
//               <Edit2 className="h-4 w-4 mr-2" />
//               Edit Profile
//             </Button>
//             <Button variant="outline">
//               <Share2 className="h-4 w-4 mr-2" />
//               Share
//             </Button>
//             <Button variant="outline" size="icon">
//               <MoreHorizontal className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column */}
//           <div className="space-y-6">
//             {/* About Section */}
//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold flex items-center">
//                     <Users className="h-5 w-5 mr-2 text-gray-600" />
//                     About
//                   </h2>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => openModal("personal", profile)}
//                   >
//                     <Edit2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//                 <p className="text-sm text-gray-600">
//                   {profile.bio ||
//                     "No description available. Click edit to add about section."}
//                 </p>
//               </CardContent>
//             </Card>

//             {/* Skills Section */}
//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold flex items-center">
//                     <Target className="h-5 w-5 mr-2 text-gray-600" />
//                     Skills
//                   </h2>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => openModal("skills")}
//                   >
//                     <Edit2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//                 <div className="space-y-2">
//                   {profile.skills.map((skill, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
//                     >
//                       <span className="text-sm font-medium">
//                         {skill.split(" - ")[0]}
//                       </span>
//                       {skill.includes(" - ") && (
//                         <Badge variant="secondary" className="text-xs">
//                           {skill.split(" - ")[1]}
//                         </Badge>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Languages Section */}
//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold flex items-center">
//                     <Languages className="h-5 w-5 mr-2 text-gray-600" />
//                     Languages
//                   </h2>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => openModal("languages")}
//                   >
//                     <Edit2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//                 <div className="space-y-3">
//                   {profile.languages.map((language, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between"
//                     >
//                       <span className="text-sm font-medium">
//                         {language.name}
//                       </span>
//                       <Badge
//                         variant="outline"
//                         className={`text-xs ${
//                           language.level === "Native"
//                             ? "border-green-200 text-green-700"
//                             : language.level === "Intermediate"
//                             ? "border-blue-200 text-blue-700"
//                             : "border-gray-200 text-gray-700"
//                         }`}
//                       >
//                         {language.level}
//                       </Badge>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Center Column */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Stats Grid */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <Card>
//                 <CardContent className="p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">
//                         Completed Courses
//                       </p>
//                       <h3 className="text-2xl font-bold">
//                         {profile.stats.completedCourses}
//                       </h3>
//                     </div>
//                     <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
//                       <BookOpen className="h-5 w-5 text-blue-600" />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">
//                         Skills Assessed
//                       </p>
//                       <h3 className="text-2xl font-bold">
//                         {profile.stats.skillsAssessed}
//                       </h3>
//                     </div>
//                     <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
//                       <Target className="h-5 w-5 text-green-600" />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">
//                         Career Goals
//                       </p>
//                       <h3 className="text-2xl font-bold">
//                         {profile.stats.careerGoals}
//                       </h3>
//                     </div>
//                     <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
//                       <BarChart2 className="h-5 w-5 text-purple-600" />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">
//                         Network
//                       </p>
//                       <h3 className="text-2xl font-bold">
//                         {profile.stats.networkSize}
//                       </h3>
//                     </div>
//                     <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
//                       <Users className="h-5 w-5 text-orange-600" />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Work Experience Section */}
//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <h2 className="text-lg font-semibold flex items-center">
//                     <Briefcase className="h-5 w-5 mr-2 text-gray-600" />
//                     Work Experience
//                   </h2>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => openModal("work")}
//                   >
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>

//                 <div className="space-y-6">
//                   {profile.workExperiences.map((experience) => (
//                     <div key={experience.id} className="relative group">
//                       <div className="flex items-start gap-4">
//                         <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                           <Building2 className="h-6 w-6 text-blue-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="flex items-start justify-between">
//                             <div>
//                               <h3 className="font-semibold text-gray-900">
//                                 {experience.title}
//                               </h3>
//                               <p className="text-gray-600">
//                                 {experience.company}
//                               </p>
//                               <p className="text-sm text-gray-500">
//                                 {experience.duration}
//                               </p>
//                               {experience.location && (
//                                 <p className="text-sm text-gray-500 flex items-center mt-1">
//                                   <MapPin className="h-3 w-3 mr-1" />
//                                   {experience.location}
//                                 </p>
//                               )}
//                             </div>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               className="opacity-0 group-hover:opacity-100 transition-opacity"
//                               onClick={() =>
//                                 openModal("work", experience as any)
//                               }
//                             >
//                               <Edit2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                           {experience.description && (
//                             <p className="text-sm text-gray-700 mt-2">
//                               {experience.description}
//                             </p>
//                           )}
//                           {experience.skills && (
//                             <div className="flex flex-wrap gap-2 mt-3">
//                               {experience.skills.map((skill, index) => (
//                                 <Badge
//                                   key={index}
//                                   variant="secondary"
//                                   className="text-xs"
//                                 >
//                                   {skill}
//                                 </Badge>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Education Section */}
//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <h2 className="text-lg font-semibold flex items-center">
//                     <GraduationCap className="h-5 w-5 mr-2 text-gray-600" />
//                     Education
//                   </h2>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => openModal("education")}
//                   >
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>

//                 <div className="space-y-6">
//                   {profile.education.map((education) => (
//                     <div key={education.id} className="relative group">
//                       <div className="flex items-start gap-4">
//                         <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                           <GraduationCap className="h-6 w-6 text-green-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="flex items-start justify-between">
//                             <div>
//                               <h3 className="font-semibold text-gray-900">
//                                 {education.degree}
//                               </h3>
//                               <p className="text-gray-600">
//                                 {education.institution}
//                               </p>
//                               <p className="text-sm text-gray-500">
//                                 {education.duration}
//                               </p>
//                             </div>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               className="opacity-0 group-hover:opacity-100 transition-opacity"
//                               onClick={() => openModal("education", education)}
//                             >
//                               <Edit2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Career Progress */}
//             <Card>
//               <CardContent className="p-6">
//                 <h2 className="text-lg font-semibold mb-4">Career Progress</h2>
//                 <div className="space-y-6">
//                   <div>
//                     <div className="flex justify-between mb-2">
//                       <span className="text-sm font-medium">
//                         Overall Progress
//                       </span>
//                       <span className="text-sm text-gray-500">
//                         {profile.progress.overall}%
//                       </span>
//                     </div>
//                     <Progress
//                       value={profile.progress.overall}
//                       className="h-2"
//                     />
//                   </div>
//                   <div>
//                     <div className="flex justify-between mb-2">
//                       <span className="text-sm font-medium">
//                         Skills Development
//                       </span>
//                       <span className="text-sm text-gray-500">
//                         {profile.progress.skills}%
//                       </span>
//                     </div>
//                     <Progress value={profile.progress.skills} className="h-2" />
//                   </div>
//                   <div>
//                     <div className="flex justify-between mb-2">
//                       <span className="text-sm font-medium">
//                         Goal Achievement
//                       </span>
//                       <span className="text-sm text-gray-500">
//                         {profile.progress.goals}%
//                       </span>
//                     </div>
//                     <Progress value={profile.progress.goals} className="h-2" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>

//       {/* Personal Details Modal */}
//       <Dialog open={activeModal === "personal"} onOpenChange={closeModal}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Edit Personal Details</DialogTitle>
//           </DialogHeader>
//           <Form {...personalForm}>
//             <form
//               onSubmit={personalForm.handleSubmit(handlePersonalSubmit)}
//               className="space-y-4"
//             >
//               <FormField
//                 control={personalForm.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Name</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={personalForm.control}
//                 name="title"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Professional Title</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={personalForm.control}
//                 name="bio"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Bio</FormLabel>
//                     <FormControl>
//                       <Textarea {...field} rows={4} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={personalForm.control}
//                   name="email"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Email</FormLabel>
//                       <FormControl>
//                         <Input {...field} type="email" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={personalForm.control}
//                   name="phone"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Phone</FormLabel>
//                       <FormControl>
//                         <Input {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <FormField
//                 control={personalForm.control}
//                 name="location"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Location</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={personalForm.control}
//                 name="website"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Website</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div className="flex justify-end gap-2 pt-4">
//                 <Button type="button" variant="outline" onClick={closeModal}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">Save Changes</Button>
//               </div>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>

//       {/* Work Experience Modal */}
//       <Dialog open={activeModal === "work"} onOpenChange={closeModal}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>
//               {editingItem ? "Edit" : "Add"} Work Experience
//             </DialogTitle>
//           </DialogHeader>
//           <Form {...workForm}>
//             <form
//               onSubmit={workForm.handleSubmit(handleWorkSubmit)}
//               className="space-y-4"
//             >
//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={workForm.control}
//                   name="title"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Job Title</FormLabel>
//                       <FormControl>
//                         <Input {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={workForm.control}
//                   name="company"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Company</FormLabel>
//                       <FormControl>
//                         <Input {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={workForm.control}
//                   name="duration"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Duration</FormLabel>
//                       <FormControl>
//                         <Input
//                           {...field}
//                           placeholder="e.g., Jan 2023 - Present"
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={workForm.control}
//                   name="type"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Employment Type</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select type" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="Full-time">Full-time</SelectItem>
//                           <SelectItem value="Part-time">Part-time</SelectItem>
//                           <SelectItem value="Contract">Contract</SelectItem>
//                           <SelectItem value="Internship">Internship</SelectItem>
//                           <SelectItem value="Freelance">Freelance</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <FormField
//                 control={workForm.control}
//                 name="location"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Location</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="e.g., San Francisco, CA" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={workForm.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         {...field}
//                         rows={4}
//                         placeholder="Describe your role and achievements..."
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div className="flex justify-end gap-2 pt-4">
//                 <Button type="button" variant="outline" onClick={closeModal}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">
//                   {editingItem ? "Update" : "Add"} Experience
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>

//       {/* Education Modal */}
//       <Dialog open={activeModal === "education"} onOpenChange={closeModal}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>{editingItem ? "Edit" : "Add"} Education</DialogTitle>
//           </DialogHeader>
//           <Form {...educationForm}>
//             <form
//               onSubmit={educationForm.handleSubmit(handleEducationSubmit)}
//               className="space-y-4"
//             >
//               <FormField
//                 control={educationForm.control}
//                 name="degree"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Degree</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         placeholder="e.g., Bachelor of Science"
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={educationForm.control}
//                 name="institution"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Institution</FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         placeholder="e.g., Stanford University"
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={educationForm.control}
//                   name="duration"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Duration</FormLabel>
//                       <FormControl>
//                         <Input {...field} placeholder="e.g., 2018 - 2022" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={educationForm.control}
//                   name="location"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Location</FormLabel>
//                       <FormControl>
//                         <Input {...field} placeholder="e.g., California, USA" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <div className="flex justify-end gap-2 pt-4">
//                 <Button type="button" variant="outline" onClick={closeModal}>
//                   Cancel
//                 </Button>
//                 <Button type="submit">
//                   {editingItem ? "Update" : "Add"} Education
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>

//       {/* Cover Image Modal */}
//       <Dialog open={activeModal === "cover"} onOpenChange={closeModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Update Cover Image</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="flex items-center justify-center w-full">
//               <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
//                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                   <Camera className="w-8 h-8 mb-4 text-gray-500" />
//                   <p className="mb-2 text-sm text-gray-500">
//                     <span className="font-semibold">Click to upload</span> or
//                     drag and drop
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     PNG, JPG or GIF (MAX. 800x400px)
//                   </p>
//                 </div>
//                 <input type="file" className="hidden" accept="image/*" />
//               </label>
//             </div>
//             <div className="flex justify-end gap-2">
//               <Button variant="outline" onClick={closeModal}>
//                 Cancel
//               </Button>
//               <Button>Upload Cover Image</Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Profile Image Modal */}
//       <Dialog open={activeModal === "profileImage"} onOpenChange={closeModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Update Profile Image</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="flex items-center justify-center w-full">
//               <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
//                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                   <Camera className="w-8 h-8 mb-4 text-gray-500" />
//                   <p className="mb-2 text-sm text-gray-500">
//                     <span className="font-semibold">Click to upload</span> or
//                     drag and drop
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     PNG, JPG or GIF (MAX. 400x400px)
//                   </p>
//                 </div>
//                 <input type="file" className="hidden" accept="image/*" />
//               </label>
//             </div>
//             <div className="flex justify-end gap-2">
//               <Button variant="outline" onClick={closeModal}>
//                 Cancel
//               </Button>
//               <Button>Upload Profile Image</Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
import React, { useState } from "react";
import {
  Edit2,
  Plus,
  MapPin,
  Building2,
  Globe,
  Briefcase,
  GraduationCap,
  Languages,
  Award,
  Users,
  Camera,
  Settings,
  Share2,
  MoreHorizontal,
  Star,
  Calendar,
  Mail,
  Phone,
  Verified,
  BookOpen,
  Target,
  BarChart2,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { PersonalDetailsForm } from "@/components/forms/PersonalDetailsForm";
import { WorkExperienceForm } from "@/components/forms/WorkExperienceForm";
import { EducationForm } from "@/components/forms/EducationForm";
import { SkillsForm } from "@/components/forms/SkillsForm";
import { LanguagesForm } from "@/components/forms/LanguagesForm";
import { useProfileStore } from "@/store/profileStore";

type ModalType =
  | "personal"
  | "work"
  | "education"
  | "skills"
  | "languages"
  | "cover"
  | "profile"
  | null;

export default function ModernProfileDashboard() {
  const { profile } = useProfileStore();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const openModal = (modalType: ModalType, item?: any) => {
    setActiveModal(modalType);
    setEditingItem(item || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image Section */}
      <div className="relative">
        <div
          className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${profile.coverImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            onClick={() => openModal("cover")}
          >
            <Camera className="h-4 w-4 mr-2" />
            Edit Cover
          </Button>
        </div>

        {/* Profile Image */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={profile.profileImage} alt={profile.name} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {profile.personalDetails.firstName[0]}
                {profile.personalDetails.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-2 right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md"
              onClick={() => openModal("profile")}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Profile Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.name}
              </h1>
              {profile.verified && (
                <Verified className="h-6 w-6 text-blue-600" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openModal("personal")}
                className="text-gray-600 hover:text-gray-900"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-lg text-gray-600 mb-3">
              {profile.personalDetails.professionalHeadline}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              {profile.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
              )}
              {profile.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {profile.email}
                </div>
              )}
              {profile.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 mb-4">
              <div className="text-sm">
                <span className="font-bold text-gray-900">
                  {profile.followers}
                </span>
                <span className="text-gray-600 ml-1">Followers</span>
              </div>
              <div className="text-sm">
                <span className="font-bold text-gray-900">
                  {profile.following}
                </span>
                <span className="text-gray-600 ml-1">Following</span>
              </div>
            </div>

            {profile.personalDetails.aboutMe &&
              profile.personalDetails.aboutMe !==
                "Tell us a bit about yourself" && (
                <p className="text-gray-700 mb-4 max-w-2xl">
                  {profile.personalDetails.aboutMe}
                </p>
              )}
          </div>

          <div className="flex gap-2">
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Profile Sections
            </Button>
            <Button variant="outline" onClick={() => openModal("personal")}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-600" />
                    About
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal("personal")}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  {profile.personalDetails.aboutMe &&
                  profile.personalDetails.aboutMe !==
                    "Tell us a bit about yourself"
                    ? profile.personalDetails.aboutMe
                    : "No description available. Click edit to add about section."}
                </p>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Target className="h-5 w-5 mr-2 text-gray-600" />
                    Skills
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal("skills")}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {profile.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium">{skill.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {skill.level}
                      </Badge>
                    </div>
                  ))}
                  {profile.skills.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No skills added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Languages Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Languages className="h-5 w-5 mr-2 text-gray-600" />
                    Languages
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal("languages")}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {profile.languages.map((language) => (
                    <div
                      key={language.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">
                        {language.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          language.level === "Native"
                            ? "border-green-200 text-green-700"
                            : language.level === "Fluent"
                            ? "border-purple-200 text-purple-700"
                            : language.level === "Advanced"
                            ? "border-blue-200 text-blue-700"
                            : language.level === "Intermediate"
                            ? "border-orange-200 text-orange-700"
                            : "border-red-200 text-red-700"
                        }`}
                      >
                        {language.level}
                      </Badge>
                    </div>
                  ))}
                  {profile.languages.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No languages added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Completed Courses
                      </p>
                      <h3 className="text-2xl font-bold">
                        {profile.stats.completedCourses}
                      </h3>
                    </div>
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Skills Assessed
                      </p>
                      <h3 className="text-2xl font-bold">
                        {profile.stats.skillsAssessed}
                      </h3>
                    </div>
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Career Goals
                      </p>
                      <h3 className="text-2xl font-bold">
                        {profile.stats.careerGoals}
                      </h3>
                    </div>
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <BarChart2 className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Network
                      </p>
                      <h3 className="text-2xl font-bold">
                        {profile.stats.networkSize}
                      </h3>
                    </div>
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Work Experience Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-gray-600" />
                    Work Experience
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal("work")}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {profile.workExperiences.map((experience) => (
                    <div key={experience.id} className="relative group">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {experience.title}
                              </h3>
                              <p className="text-gray-600">
                                {experience.company}
                              </p>
                              <p className="text-sm text-gray-500">
                                {experience.startDate
                                  ? new Date(
                                      experience.startDate
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : ""}{" "}
                                -{" "}
                                {experience.isCurrent
                                  ? "Present"
                                  : experience.endDate
                                  ? new Date(
                                      experience.endDate
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : ""}
                              </p>
                              {experience.location && (
                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {experience.location}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => openModal("work", experience)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {experience.description && (
                            <p className="text-sm text-gray-700 mt-2">
                              {experience.description}
                            </p>
                          )}
                          {experience.skills &&
                            experience.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {experience.skills.map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {profile.workExperiences.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No work experience added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-gray-600" />
                    Education
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal("education")}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {profile.education.map((education) => (
                    <div key={education.id} className="relative group">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {education.degree}
                              </h3>
                              <p className="text-gray-600">
                                {education.institution}
                              </p>
                              <p className="text-sm text-gray-500">
                                {education.startDate
                                  ? new Date(
                                      education.startDate
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                    })
                                  : ""}{" "}
                                -{" "}
                                {education.isCurrent
                                  ? "Present"
                                  : education.endDate
                                  ? new Date(
                                      education.endDate
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                    })
                                  : ""}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => openModal("education", education)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {profile.education.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No education added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Career Progress */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Career Progress</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Overall Progress
                      </span>
                      <span className="text-sm text-gray-500">
                        {profile.progress.overall}%
                      </span>
                    </div>
                    <Progress
                      value={profile.progress.overall}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Skills Development
                      </span>
                      <span className="text-sm text-gray-500">
                        {profile.progress.skills}%
                      </span>
                    </div>
                    <Progress value={profile.progress.skills} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Goal Achievement
                      </span>
                      <span className="text-sm text-gray-500">
                        {profile.progress.goals}%
                      </span>
                    </div>
                    <Progress value={profile.progress.goals} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <PersonalDetailsForm
        open={activeModal === "personal"}
        onClose={closeModal}
      />

      <WorkExperienceForm
        open={activeModal === "work"}
        onClose={closeModal}
        experience={editingItem}
      />

      <EducationForm
        open={activeModal === "education"}
        onClose={closeModal}
        education={editingItem}
      />

      <SkillsForm open={activeModal === "skills"} onClose={closeModal} />

      <LanguagesForm open={activeModal === "languages"} onClose={closeModal} />
    </div>
  );
}
