import { MapPin, Phone, Mail, Globe, Calendar, User, Briefcase, GraduationCap } from 'lucide-react'

interface UserProfileProps {
    user: any
}

export function UserProfile({ user }: UserProfileProps) {
    const personalDetails = user.personalDetails || {}
    const fullName = personalDetails.firstName
        ? `${personalDetails.firstName} ${personalDetails.lastName || ''}`.trim()
        : 'User'

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-purple-600 to-pink-600"></div>
                <div className="p-6 -mt-16">
                    <div className="flex items-start space-x-6">
                        <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center text-4xl font-bold text-purple-600 border-4 border-white">
                            {personalDetails.profileImage ? (
                                <img
                                    src={personalDetails.profileImage}
                                    alt={fullName}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                fullName.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 mt-16">
                            <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
                            {personalDetails.bio && (
                                <p className="text-gray-600 mt-2">{personalDetails.bio}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                                {personalDetails.location && (
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{personalDetails.location}</span>
                                    </div>
                                )}
                                {personalDetails.dateOfBirth && (
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Born {new Date(personalDetails.dateOfBirth).getFullYear()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                        {personalDetails.publicProfileId || 'N/A'}
                    </div>
                    <div className="text-gray-600">Profile ID</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <Briefcase className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                        {user.workExperience?.length || 0}
                    </div>
                    <div className="text-gray-600">Work Experience</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <GraduationCap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                        {user.education?.length || 0}
                    </div>
                    <div className="text-gray-600">Education</div>
                </div>
            </div>

            {/* Contact Information */}
            {(personalDetails.email || personalDetails.phone || personalDetails.website) && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {personalDetails.phone && (
                            <div className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <span>{personalDetails.phone}</span>
                            </div>
                        )}
                        {personalDetails.email && (
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <span>{personalDetails.email}</span>
                            </div>
                        )}
                        {personalDetails.website && (
                            <div className="flex items-center space-x-3">
                                <Globe className="w-5 h-5 text-gray-400" />
                                <a href={personalDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {personalDetails.website}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Professional Badges */}
            {personalDetails.professionalBadges && personalDetails.professionalBadges.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Badges</h2>
                    <div className="flex flex-wrap gap-2">
                        {personalDetails.professionalBadges.map((badge: string, index: number) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Interests */}
            {personalDetails.interests && personalDetails.interests.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Interests</h2>
                    <div className="flex flex-wrap gap-2">
                        {personalDetails.interests.map((interest: string, index: number) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                            >
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
