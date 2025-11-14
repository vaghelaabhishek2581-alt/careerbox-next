import { MapPin, Phone, Mail, Globe, Calendar, Users, Briefcase, Building } from 'lucide-react'

interface BusinessProfileProps {
    business: any
}

export function BusinessProfile({ business }: BusinessProfileProps) {
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-green-600 to-blue-600"></div>
                <div className="p-6 -mt-16">
                    <div className="flex items-start space-x-6">
                        <div className="w-32 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center text-4xl font-bold text-green-600 border-4 border-white">
                            {business.name?.charAt(0) || 'B'}
                        </div>
                        <div className="flex-1 mt-16">
                            <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
                            <p className="text-gray-600 mt-2">{business.description}</p>
                            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                                {business.address && (
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{business.address.city}, {business.address.state}</span>
                                    </div>
                                )}
                                {business.establishmentYear && (
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Est. {business.establishmentYear}</span>
                                    </div>
                                )}
                                {business.industry && (
                                    <div className="flex items-center space-x-1">
                                        <Building className="w-4 h-4" />
                                        <span>{business.industry}</span>
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
                        {business.employeeCount || '50+'}
                    </div>
                    <div className="text-gray-600">Employees</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <Briefcase className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                        {business.jobPostings || '10+'}
                    </div>
                    <div className="text-gray-600">Job Openings</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <Building className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                        {business.locations || '1+'}
                    </div>
                    <div className="text-gray-600">Locations</div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {business.phone && (
                        <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span>{business.phone}</span>
                        </div>
                    )}
                    {business.email && (
                        <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span>{business.email}</span>
                        </div>
                    )}
                    {business.website && (
                        <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {business.website}
                            </a>
                        </div>
                    )}
                    {business.address && (
                        <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>
                                {business.address.street && `${business.address.street}, `}
                                {business.address.city}, {business.address.state} {business.address.zipCode}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
