"use client";

import { useState, useEffect, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchUserInstitutes, setSelectedInstitute, InstituteData } from "@/lib/redux/slices/instituteSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InstituteSelectorProps {
  variant?: "dropdown" | "compact";
  onInstituteChange?: (instituteId: string) => void;
}

const InstituteSelector = memo(function InstituteSelector({
  variant = "dropdown",
  onInstituteChange
}: InstituteSelectorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { userInstitutes, selectedInstitute, loading } = useSelector((state: RootState) => state.institute);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Ensure userInstitutes is an array
  const institutesArray = Array.isArray(userInstitutes) ? userInstitutes : [];

  // Fetch user's institutes on component mount - only if not already loaded and not already initialized
  useEffect(() => {
    if (!hasInitialized && institutesArray.length === 0 && !loading) {
      dispatch(fetchUserInstitutes());
      setHasInitialized(true);
    } else if (institutesArray.length > 0) {
      setHasInitialized(true);
    }
  }, [dispatch, institutesArray.length, loading, hasInitialized]);

  // If user has only one institute, select it automatically
  useEffect(() => {
    if (institutesArray.length === 1 && !selectedInstitute) {
      dispatch(setSelectedInstitute(institutesArray[0]));
    }
  }, [institutesArray, selectedInstitute, dispatch]);

  const handleInstituteChange = (instituteId: string) => {
    const institute = institutesArray.find((inst: InstituteData) => inst._id.toString() === instituteId);
    if (institute) {
      dispatch(setSelectedInstitute(institute));
      if (onInstituteChange) {
        onInstituteChange(instituteId);
      }
    }
  };


  // Don't render selector if user has no institutes
  if (!institutesArray || institutesArray.length === 0) {
    return null;
  }

  // Don't render selector if user has only one institute (auto-selected)
  if (institutesArray.length === 1) {
    if (variant === "compact") {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
          <Building2 className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-gray-900">
            {institutesArray[0].name}
          </span>
        </div>
      );
    }
    return null;
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <Select
          value={selectedInstitute?._id.toString()}
          onValueChange={handleInstituteChange}
        >
          <SelectTrigger className="w-auto min-w-[200px] bg-orange-50 border-orange-200 hover:bg-orange-100 transition-colors">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-600" />
              <SelectValue placeholder="Select Institute">
                {selectedInstitute?.name || "Select Institute"}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {institutesArray.map((institute: InstituteData) => (
              <SelectItem
                key={institute._id.toString()}
                value={institute._id.toString()}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-orange-600" />
                  <div className="flex-1">
                    <p className="font-medium">{institute.name}</p>
                    {institute.city && institute.state && (
                      <p className="text-xs text-gray-500">
                        {institute.city}, {institute.state}
                      </p>
                    )}
                  </div>
                  {institute.isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-orange-600" />
          <span className="text-sm font-semibold text-gray-700">Current Institute</span>
        </div>
        {institutesArray.length > 1 && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {institutesArray.length} Institutes
          </Badge>
        )}
      </div>

      <Select
        value={selectedInstitute?._id.toString()}
        onValueChange={handleInstituteChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className="w-full bg-white hover:bg-gray-50 transition-colors">
          <SelectValue placeholder="Select an institute to manage">
            {selectedInstitute ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{selectedInstitute.name}</p>
                    {selectedInstitute.city && selectedInstitute.state && (
                      <p className="text-xs text-gray-500">
                        {selectedInstitute.city}, {selectedInstitute.state}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-gray-500">Select an institute to manage</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <div className="p-2">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Your Institutes
            </p>
            {institutesArray.map((institute: InstituteData) => (
              <SelectItem
                key={institute._id.toString()}
                value={institute._id.toString()}
                className="cursor-pointer p-3 mb-1"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {institute.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {institute.city && institute.state && (
                        <span className="text-xs text-gray-500">
                          {institute.city}, {institute.state}
                        </span>
                      )}
                      {institute.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                      {institute.status === 'active' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedInstitute?._id.toString() === institute._id.toString() && (
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
                  )}
                </div>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>

      {selectedInstitute && (
        <div className="mt-3 pt-3 border-t border-orange-200">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {selectedInstitute.studentCount || 0}
              </p>
              <p className="text-xs text-gray-600">Students</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {selectedInstitute.courseCount || 0}
              </p>
              <p className="text-xs text-gray-600">Courses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {selectedInstitute.facultyCount || 0}
              </p>
              <p className="text-xs text-gray-600">Faculty</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default InstituteSelector;