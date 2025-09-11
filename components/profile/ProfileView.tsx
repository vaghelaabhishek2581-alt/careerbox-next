import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Github, 
  Twitter, 
  Instagram, 
  Facebook,
  Youtube,
  Building2,
  GraduationCap,
  Briefcase,
  Award,
  Star,
  Users,
  Eye,
  Share2,
  MessageCircle,
  Plus,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserProfile, BusinessProfile, InstituteProfile } from '@/lib/types/unified.types'
import { getDisplayName, getInitials } from '@/lib/types/unified.types'

interface ProfileViewProps {
  profileId: string
}

type ProfileData = UserProfile | BusinessProfile | InstituteProfile

export default function ProfileView({ profileId }: ProfileViewProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileType, setProfileType] = useState<'user' | 'business' | 'institute'>('user')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${profileId}`)
        
        if (response.status === 404) {
          notFound()
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }
        
        const data = await response.json()
        setProfile(data.profile)
        setProfileType(data.type)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [profileId])

  if (loading) {
    return <ProfileSkeleton />
  }

  if (error || !profile) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader profile={profile} profileType={profileType} />
      
      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProfileContent profile={profile} profileType={profileType} />
        </div>
        <div className="space-y-6">
          <ProfileSidebar profile={profile} profileType={profileType} />
        </div>
      </div>
    </div>
  )
}

// Profile Header Component
function ProfileHeader({ profile, profileType }: { profile: ProfileData; profileType: string }) {
  const isUser = profileType === 'user'
  const isBusiness = profileType === 'business'
  const isInstitute = profileType === 'institute'

  const name = isUser 
    ? getDisplayName(profile as UserProfile)
    : isBusiness 
    ? (profile as BusinessProfile).companyName
    : (profile as InstituteProfile).instituteName

  const avatar = isUser 
    ? (profile as UserProfile).profileImage
    : isBusiness 
    ? (profile as BusinessProfile).logo
    : (profile as InstituteProfile).logo

  const coverImage = isUser 
    ? (profile as UserProfile).coverImage
    : isBusiness 
    ? (profile as BusinessProfile).coverImage
    : (profile as InstituteProfile).coverImage

  const bio = isUser 
    ? (profile as UserProfile).bio
    : isBusiness 
    ? (profile as BusinessProfile).description
    : (profile as InstituteProfile).description

  const verified = isUser 
    ? (profile as UserProfile).verified
    : isBusiness 
    ? (profile as BusinessProfile).isVerified
    : (profile as InstituteProfile).isVerified

  return (
    <Card className="overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        {coverImage && (
          <img 
            src={coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-2xl">
                {isUser ? getInitials(profile as UserProfile) : name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {verified && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{name}</h1>
              {verified && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            
            {bio && (
              <p className="text-muted-foreground text-lg">{bio}</p>
            )}

            {/* Profile Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {isUser && (
                <>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{(profile as UserProfile).stats?.connections || 0} connections</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{(profile as UserProfile).stats?.profileViews || 0} profile views</span>
                  </div>
                </>
              )}
              {isBusiness && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{(profile as BusinessProfile).stats?.jobPostings || 0} job postings</span>
                </div>
              )}
              {isInstitute && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>{(profile as InstituteProfile).stats?.courses || 0} courses</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Connect
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Profile Content Component
function ProfileContent({ profile, profileType }: { profile: ProfileData; profileType: string }) {
  const isUser = profileType === 'user'
  const isBusiness = profileType === 'business'
  const isInstitute = profileType === 'institute'

  if (isUser) {
    return <UserProfileContent profile={profile as UserProfile} />
  } else if (isBusiness) {
    return <BusinessProfileContent profile={profile as BusinessProfile} />
  } else {
    return <InstituteProfileContent profile={profile as InstituteProfile} />
  }
}

// User Profile Content
function UserProfileContent({ profile }: { profile: UserProfile }) {
  return (
    <Tabs defaultValue="about" className="space-y-4">
      <TabsList>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="experience">Experience</TabsTrigger>
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="about" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.personalDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Personal Information</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {profile.personalDetails.professionalHeadline && (
                      <p><strong>Headline:</strong> {profile.personalDetails.professionalHeadline}</p>
                    )}
                    {profile.personalDetails.dateOfBirth && (
                      <p><strong>Date of Birth:</strong> {new Date(profile.personalDetails.dateOfBirth).toLocaleDateString()}</p>
                    )}
                    {profile.personalDetails.phone && (
                      <p><strong>Phone:</strong> {profile.personalDetails.phone}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Location</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {profile.location || 'Not specified'}
                  </div>
                </div>
              </div>
            )}
            
            {profile.bio && (
              <div>
                <h4 className="font-medium mb-2">Bio</h4>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="experience" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.workExperiences && profile.workExperiences.length > 0 ? (
              <div className="space-y-4">
                {profile.workExperiences.map((experience) => (
                  <div key={experience.id} className="border-l-2 border-muted pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{experience.company}</h4>
                        {experience.positions.map((position) => (
                          <div key={position.id} className="mt-2">
                            <p className="font-medium">{position.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(position.startDate).toLocaleDateString()} - {' '}
                              {position.isCurrent ? 'Present' : new Date(position.endDate || '').toLocaleDateString()}
                            </p>
                            {position.description && (
                              <p className="text-sm mt-1">{position.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <Badge variant="outline">{experience.industry}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No work experience added yet.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="education" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.education && profile.education.length > 0 ? (
              <div className="space-y-4">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="border-l-2 border-muted pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{edu.institution}</h4>
                        <p className="font-medium">{edu.degree}</p>
                        {edu.fieldOfStudy && (
                          <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {new Date(edu.startDate).toLocaleDateString()} - {' '}
                          {edu.isCurrent ? 'Present' : new Date(edu.endDate || '').toLocaleDateString()}
                        </p>
                        {edu.grade && (
                          <p className="text-sm">Grade: {edu.grade}</p>
                        )}
                      </div>
                      {edu.grade && (
                        <Badge variant="outline">{edu.grade}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No education information added yet.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="skills" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Skills & Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary" className="flex items-center gap-1">
                        {skill.name}
                        {skill.verified && <CheckCircle className="h-3 w-3 text-green-600" />}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {profile.certifications && profile.certifications.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Certifications</h4>
                    <div className="space-y-2">
                      {profile.certifications.map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                            <p className="text-sm text-muted-foreground">
                              Issued: {new Date(cert.issueDate).toLocaleDateString()}
                            </p>
                          </div>
                          {cert.verified && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No skills or certifications added yet.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity to show.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// Business Profile Content
function BusinessProfileContent({ profile }: { profile: BusinessProfile }) {
  return (
    <Tabs defaultValue="about" className="space-y-4">
      <TabsList>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <TabsContent value="about" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Company Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Company Details</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong>Industry:</strong> {profile.industry}</p>
                  <p><strong>Size:</strong> {profile.size}</p>
                  {profile.foundedYear && (
                    <p><strong>Founded:</strong> {profile.foundedYear}</p>
                  )}
                  {profile.employeeCount && (
                    <p><strong>Employees:</strong> {profile.employeeCount}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Location</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {profile.headquarters?.city}, {profile.headquarters?.country}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{profile.description}</p>
            </div>

            {profile.services && profile.services.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.services.map((service) => (
                    <Badge key={service} variant="secondary">{service}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="jobs" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No open positions at the moment.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Team information not available.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Company Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No reviews yet.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// Institute Profile Content
function InstituteProfileContent({ profile }: { profile: InstituteProfile }) {
  return (
    <Tabs defaultValue="about" className="space-y-4">
      <TabsList>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="courses">Courses</TabsTrigger>
        <TabsTrigger value="faculty">Faculty</TabsTrigger>
        <TabsTrigger value="placement">Placement</TabsTrigger>
      </TabsList>

      <TabsContent value="about" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Institute Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Institute Details</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong>Type:</strong> {profile.type}</p>
                  {profile.establishedYear && (
                    <p><strong>Established:</strong> {profile.establishedYear}</p>
                  )}
                  {profile.studentCount && (
                    <p><strong>Students:</strong> {profile.studentCount}</p>
                  )}
                  {profile.facultyCount && (
                    <p><strong>Faculty:</strong> {profile.facultyCount}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Location</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {profile.address?.city}, {profile.address?.country}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{profile.description}</p>
            </div>

            {profile.accreditation && profile.accreditation.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Accreditation</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.accreditation.map((acc) => (
                    <Badge key={acc} variant="secondary">{acc}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="courses" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Course information not available.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="faculty" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Faculty information not available.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="placement" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Placement Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Placement information not available.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// Profile Sidebar Component
function ProfileSidebar({ profile, profileType }: { profile: ProfileData; profileType: string }) {
  const isUser = profileType === 'user'
  const isBusiness = profileType === 'business'
  const isInstitute = profileType === 'institute'

  return (
    <>
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isUser && (profile as UserProfile).personalDetails?.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{(profile as UserProfile).personalDetails?.phone}</span>
            </div>
          )}
          
          {isBusiness && (profile as BusinessProfile).contactInfo?.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{(profile as BusinessProfile).contactInfo?.phone}</span>
            </div>
          )}
          
          {isInstitute && (profile as InstituteProfile).contactInfo?.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{(profile as InstituteProfile).contactInfo?.phone}</span>
            </div>
          )}

          {profile.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Website
              </a>
            </div>
          )}

          {/* Social Links */}
          {profile.socialLinks && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Social Links</h4>
              <div className="flex gap-2">
                {profile.socialLinks.linkedin && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {profile.socialLinks.twitter && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {profile.socialLinks.github && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isUser && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connections</span>
                <span className="font-medium">{(profile as UserProfile).stats?.connections || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profile Views</span>
                <span className="font-medium">{(profile as UserProfile).stats?.profileViews || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Endorsements</span>
                <span className="font-medium">{(profile as UserProfile).stats?.endorsements || 0}</span>
              </div>
            </>
          )}
          
          {isBusiness && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Job Postings</span>
                <span className="font-medium">{(profile as BusinessProfile).stats?.jobPostings || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Employees</span>
                <span className="font-medium">{(profile as BusinessProfile).employeeCount || 0}</span>
              </div>
            </>
          )}
          
          {isInstitute && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Courses</span>
                <span className="font-medium">{(profile as InstituteProfile).stats?.courses || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Students</span>
                <span className="font-medium">{(profile as InstituteProfile).studentCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Faculty</span>
                <span className="font-medium">{(profile as InstituteProfile).facultyCount || 0}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}

// Profile Skeleton Component
function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card className="overflow-hidden">
        <div className="h-48 bg-muted animate-pulse" />
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
            <div className="w-32 h-32 bg-muted animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-96 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  )
}
