import React from "react";
import { Edit2, Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IProfile, ILanguage } from "@/lib/redux/slices/profileSlice";

interface LanguagesSectionProps {
  profile: IProfile;
  onEdit: () => void;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({ profile, onEdit }) => {
  return (
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
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {profile?.languages && profile.languages.length > 0 ? (
            profile.languages.map((language: ILanguage) => (
              <div
                key={language.id}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium">
                  {language.name}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${language.level === "NATIVE"
                    ? "border-green-200 text-green-700"
                    : language.level === "FLUENT"
                      ? "border-purple-200 text-purple-700"
                      : language.level === "ADVANCED"
                        ? "border-blue-200 text-blue-700"
                        : language.level === "INTERMEDIATE"
                          ? "border-orange-200 text-orange-700"
                          : "border-red-200 text-red-700"
                    }`}
                >
                  {language.level.toUpperCase()}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No languages added yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
