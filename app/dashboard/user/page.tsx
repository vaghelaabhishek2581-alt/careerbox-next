'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedLogo from '@/components/animated-logo';
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
  ChevronRight
} from 'lucide-react';

interface DashboardStats {
  completedCourses: number;
  skillsAssessed: number;
  careerGoals: number;
  networkConnections: number;
}

interface User {
  name: string;
  email: string;
  role: string;
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    completedCourses: 12,
    skillsAssessed: 8,
    careerGoals: 3,
    networkConnections: 45
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/signup');
      return;
    }

    // Mock user data - in a real app, you'd decode the JWT or fetch from API
    setUser({
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'user'
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (!user) {
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
              <AnimatedLogo />
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
              <Button variant="ghost" size="sm" onClick={handleLogout}>
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
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600">Ready to accelerate your career growth today?</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
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
                  <p className="text-sm font-medium text-gray-600">Skills Assessed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.skillsAssessed}</p>
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
                  <p className="text-sm font-medium text-gray-600">Career Goals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.careerGoals}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.networkConnections}</p>
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
                  <CardDescription>Your journey to career excellence</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-gray-500">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Skills Development</span>
                      <span className="text-sm text-gray-500">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Goal Achievement</span>
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
                      <p className="text-sm font-medium">Completed "Advanced React" course</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Updated career goal: "Team Lead"</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Connected with Sarah Johnson</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Skills Assessment</CardTitle>
                  <CardDescription>Track and develop your professional skills</CardDescription>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'React Development', level: 85, category: 'Technical' },
                    { name: 'Project Management', level: 70, category: 'Leadership' },
                    { name: 'Data Analysis', level: 60, category: 'Technical' },
                    { name: 'Team Collaboration', level: 90, category: 'Soft Skills' },
                    { name: 'UI/UX Design', level: 55, category: 'Creative' },
                    { name: 'Public Speaking', level: 40, category: 'Communication' }
                  ].map((skill, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{skill.name}</h4>
                        <Badge variant="secondary" className="text-xs">{skill.category}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={skill.level} className="h-2 flex-1" />
                        <span className="text-sm font-medium text-gray-600">{skill.level}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Career Goals</CardTitle>
                  <CardDescription>Set and track your professional objectives</CardDescription>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Goal
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: 'Become a Senior Frontend Developer',
                    progress: 75,
                    deadline: 'Dec 2024',
                    status: 'In Progress'
                  },
                  {
                    title: 'Complete AWS Certification',
                    progress: 40,
                    deadline: 'Jun 2024',
                    status: 'Active'
                  },
                  {
                    title: 'Lead a Development Team',
                    progress: 25,
                    deadline: 'Mar 2025',
                    status: 'Planning'
                  }
                ].map((goal, index) => (
                  <div key={index} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{goal.title}</h4>
                      <Badge 
                        variant={goal.status === 'In Progress' ? 'default' : 'secondary'}
                        className={goal.status === 'In Progress' ? 'bg-blue-600' : ''}
                      >
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Deadline</p>
                        <p className="font-medium">{goal.deadline}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Professional Network</CardTitle>
                  <CardDescription>Connect and grow your professional relationships</CardDescription>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Find Connections
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Sarah Johnson', role: 'Senior Developer', company: 'TechCorp', mutual: 5 },
                    { name: 'Mike Chen', role: 'Product Manager', company: 'StartupXYZ', mutual: 3 },
                    { name: 'Emily Davis', role: 'UX Designer', company: 'DesignHub', mutual: 8 },
                    { name: 'Alex Rodriguez', role: 'Team Lead', company: 'InnovateCo', mutual: 12 },
                    { name: 'Lisa Wang', role: 'Data Scientist', company: 'DataFlow', mutual: 2 },
                    { name: 'James Wilson', role: 'DevOps Engineer', company: 'CloudTech', mutual: 7 }
                  ].map((connection, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                            {connection.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{connection.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{connection.role}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{connection.company}</p>
                      <p className="text-xs text-blue-600 mb-3">{connection.mutual} mutual connections</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Message
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}