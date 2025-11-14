import { MapPin, Phone, Mail, Globe, Calendar, Users, BookOpen, Award } from 'lucide-react'

interface InstituteProfileProps {
    institute: any
}

export function InstituteProfile({ institute }: InstituteProfileProps) {
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <div className="p-6 -mt-16">
                    <div className="flex items-start space-x-6">
                        <div className="w-32 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-white">
                            {institute.name?.charAt(0) || 'I'}
                        </div>
                        <div className="flex-1 mt-16">
                            <h1 className="text-3xl font-bold text-gray-900">{institute.name}</h1>
                            <p className="text-gray-600 mt-2">{institute.description}</p>
                            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                                {institute.address && (
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{institute.address.city}, {institute.address.state}</span>
                                    </div>
                                )}
                                {institute.establishmentYear && (
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Est. {institute.establishmentYear}</span>
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
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                        {institute.studentCount || '1000+'}
                    </div>
                    <div className="text-gray-600">Students</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                        {institute.courseCount || '50+'}
                    </div>
                    <div className="text-gray-600">Courses</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                        {institute.facultyCount || '100+'}
                    </div>
                    <div className="text-gray-600">Faculty</div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {institute.phone && (
                        <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span>{institute.phone}</span>
                        </div>
                    )}
                    {institute.email && (
                        <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span>{institute.email}</span>
                        </div>
                    )}
                    {institute.website && (
                        <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <a href={institute.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {institute.website}
                            </a>
                        </div>
                    )}
                    {institute.address && (
                        <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>
                                {institute.address.street && `${institute.address.street}, `}
                                {institute.address.city}, {institute.address.state} {institute.address.zipCode}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
