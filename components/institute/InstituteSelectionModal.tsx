"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import {
  fetchUserInstitutes,
  setSelectedInstitute,
} from "@/lib/redux/slices/instituteSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle,
  Award,
  Star,
  Calendar,
  Globe,
  Phone,
  Mail,
} from "lucide-react";

interface InstituteSelectionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
}

export const InstituteSelectionModal: React.FC<
  InstituteSelectionModalProps
> = ({
  isOpen,
  onClose,
  title = "Select Institute",
  description = "Please select an institute to continue",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInstitutes, selectedInstitute, loading } = useSelector(
    (state: RootState) => state.institute
  );

  useEffect(() => {
    if (isOpen && userInstitutes.length === 0) {
      dispatch(fetchUserInstitutes());
    }
  }, [isOpen, userInstitutes.length, dispatch]);

  const handleSelectInstitute = (institute: any) => {
    dispatch(setSelectedInstitute(institute));
    onClose?.();
  };

  const handleCreateInstitute = () => {
    // Navigate to institute creation page
    window.location.href = "/register/institute";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            {title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-2 text-sm text-muted-foreground">
                Loading institutes...
              </span>
            </div>
          ) : userInstitutes.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Institutes Found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                You don't have any institutes registered yet. Create your first
                institute to get started with comprehensive institute management
                including courses, admissions, placements, and more.
              </p>
              <Button
                onClick={handleCreateInstitute}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Create Institute
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userInstitutes.map((institute) => (
                <Card
                  key={institute._id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedInstitute?._id === institute._id
                      ? "ring-2 ring-orange-600 bg-orange-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectInstitute(institute)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                          <span className="flex-1">
                            {institute.shortName || institute.name}
                          </span>
                          {institute.isVerified && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {selectedInstitute?._id === institute._id && (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-800"
                            >
                              Selected
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {institute.location?.city || institute.address.city}
                            ,{" "}
                            {institute.location?.state ||
                              institute.address.state}
                          </div>
                          {institute.overview?.motto && (
                            <div className="text-xs italic text-muted-foreground">
                              "{institute.overview.motto}"
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      {institute.logo && (
                        <img
                          src={institute.logo}
                          alt={`${institute.name} logo`}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Enhanced Statistics */}
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-blue-600" />
                        <span className="text-muted-foreground">Students:</span>
                        <span className="font-medium">
                          {institute.totalStudents ||
                            institute.studentCount ||
                            0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3 text-green-600" />
                        <span className="text-muted-foreground">Faculty:</span>
                        <span className="font-medium">
                          {institute.totalFaculty ||
                            institute.facultyCount ||
                            0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-purple-600" />
                        <span className="text-muted-foreground">Programs:</span>
                        <span className="font-medium">
                          {institute.totalPrograms ||
                            institute.courseCount ||
                            0}
                        </span>
                      </div>
                    </div>

                    {/* Institute Type and Accreditation */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {institute.type && (
                        <Badge variant="outline" className="text-xs">
                          {institute.type}
                        </Badge>
                      )}
                      {typeof institute?.accreditation === "object" &&
                        !Array.isArray(institute.accreditation) &&
                        institute.accreditation?.naac?.grade &&
                        institute.accreditation.naac.grade !== "None" && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700"
                          >
                            <Award className="h-3 w-3 mr-1" />
                            NAAC {institute.accreditation?.naac?.grade}
                          </Badge>
                        )}
                      {typeof institute.accreditation === "object" &&
                        !Array.isArray(institute.accreditation) &&
                        institute.accreditation?.nirf?.overallRank && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-yellow-50 text-yellow-700"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            NIRF #{institute.accreditation?.nirf?.overallRank}
                          </Badge>
                        )}
                    </div>

                    {/* Enhanced Contact Information */}
                    <div className="space-y-1 mb-3 text-xs text-muted-foreground">
                      {institute.contact?.phone?.[0] && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{institute.contact.phone[0]}</span>
                        </div>
                      )}
                      {institute.contact?.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{institute.contact.email}</span>
                        </div>
                      )}
                      {institute.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span className="truncate">{institute.website}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {(institute.overview?.description ||
                      institute.description) && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {institute.overview?.description ||
                          institute.description}
                      </p>
                    )}

                    {/* Rankings and Achievements */}
                    {institute.rankings?.national &&
                      institute.rankings.national.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {institute.rankings.national
                              .slice(0, 2)
                              .map((ranking, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700"
                                >
                                  {ranking.agency} #{ranking.rank} (
                                  {ranking.year})
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Campus and Facilities */}
                    {institute.campusDetails?.campusType && (
                      <div className="mb-3">
                        <span className="text-xs text-muted-foreground">
                          Campus: {institute.campusDetails.campusType}
                          {institute.campusDetails.environment &&
                            ` • ${institute.campusDetails.environment}`}
                        </span>
                      </div>
                    )}

                    {/* Bottom Row - Status and Establishment */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            institute.status === "Active" ||
                            institute.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            institute.status === "Active" ||
                            institute.status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : ""
                          }
                        >
                          {institute.status || "Active"}
                        </Badge>

                        {institute.studentFacultyRatio && (
                          <span className="text-xs text-muted-foreground">
                            Ratio: {institute.studentFacultyRatio}
                          </span>
                        )}
                      </div>

                      {(institute.establishedYear ||
                        institute.establishmentYear) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Est.{" "}
                            {institute.establishedYear ||
                              institute.establishmentYear}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {userInstitutes.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCreateInstitute}
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Create New Institute
              </Button>

              {selectedInstitute && (
                <Button
                  onClick={() => onClose?.()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Continue with {selectedInstitute.name}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstituteSelectionModal;
