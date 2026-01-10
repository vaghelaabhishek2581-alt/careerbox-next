// components/forms/LanguagesForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useToast } from "@/components/ui/use-toast";
import { addLanguage, updateLanguage, deleteLanguage, fetchProfile } from "@/lib/redux/slices/profileSlice";
import type { ILanguage } from "@/lib/redux/slices/profileSlice";

const languageSchema = z.object({
  name: z.string().min(1, "Language name is required"),
  level: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "FLUENT", "NATIVE"]),
});

type LanguageFormData = z.infer<typeof languageSchema>;

interface LanguagesFormProps {
  isEditing: boolean;
  onClose: () => void;
}

export const LanguagesForm: React.FC<LanguagesFormProps> = ({
  isEditing,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const profile = useAppSelector((state) => state.profile.profile);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<LanguageFormData>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      name: "",
      level: "BASIC",
    },
  });

  // Reset form when dialog opens/closes and fetch profile if needed
  React.useEffect(() => {
    if (!isEditing) {
      form.reset();
    } else if (isEditing && !profile) {
      // Fetch profile when dialog opens if not already loaded
      dispatch(fetchProfile());
    }
  }, [isEditing, form, profile, dispatch]);

  React.useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isEditing]);

  const onSubmit = async (data: LanguageFormData) => {
    try {
      setIsSubmitting(true);
      
      // Check if language already exists
      const existingLanguage = profile?.languages?.find(
        language => language.name.toLowerCase() === data.name.toLowerCase()
      );
      
      if (existingLanguage) {
        toast({
          variant: "destructive",
          title: "Language Already Exists",
          description: "This language has already been added to your profile."
        });
        return;
      }
      
      await dispatch(addLanguage(data)).unwrap();
      // Toast is now handled by the thunk
      
      form.reset({
        name: "",
        level: "BASIC",
      });
    } catch (error) {
      console.error('Failed to save language:', error);
      // Error toast is now handled by the thunk
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLanguage = async (languageId: string) => {
    try {
      await dispatch(deleteLanguage(languageId)).unwrap();
      // Success toast and optimistic updates are now handled by the thunk
    } catch (error) {
      console.error('Failed to delete language:', error);
      // Error toast and rollback are now handled by the thunk
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BASIC":
        return "bg-red-100 text-red-700 border-red-200";
      case "INTERMEDIATE":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "ADVANCED":
        return "bg-green-100 text-green-700 border-green-200";
      case "FLUENT":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "NATIVE":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const commonLanguages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Russian",
    "Chinese (Mandarin)",
    "Japanese",
    "Korean",
    "Arabic",
    "Hindi",
    "Bengali",
    "Gujarati",
    "Marathi",
    "Tamil",
    "Telugu",
    "Kannada",
    "Malayalam",
    "Punjabi",
  ];

  if (!isEditing) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 flex items-start justify-center p-4 pt-24">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[calc(100vh-120px)] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Languages</h2>
            <p className="text-sm text-muted-foreground">
              Showcase your language proficiencies
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">

        <div className="space-y-6">
          {/* Add/Edit Language Form */}
          <Card>
            <CardContent className="p-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Enter language (e.g., English)"
                                {...field}
                                list="languages"
                              />
                              <datalist id="languages">
                                {commonLanguages.map((lang) => (
                                  <option key={lang} value={lang} />
                                ))}
                              </datalist>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proficiency Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BASIC">Basic</SelectItem>
                              <SelectItem value="INTERMEDIATE">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="ADVANCED">Advanced</SelectItem>
                              <SelectItem value="FLUENT">Fluent</SelectItem>
                              <SelectItem value="NATIVE">Native</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Language
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Languages List */}
          <div className="space-y-3">
            <h3 className="font-medium">Added Languages ({profile?.languages?.length || 0})</h3>
            {!profile?.languages || profile.languages.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  No languages added yet. Add your first language above.
                </p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {profile?.languages?.map((language) => (
                    <div
                      key={language.id}
                      className="group flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {language.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 rounded-full ${getLevelColor(language.level)}`}
                      >
                        {language.level}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLanguage(language.id)}
                        className="h-5 w-5 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Proficiency Level Guide */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-3">
                Proficiency Level Guide
              </h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Basic:</span>
                  <span>Elementary proficiency</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Intermediate:</span>
                  <span>Limited working proficiency</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Advanced:</span>
                  <span>Professional working proficiency</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Fluent:</span>
                  <span>Full professional proficiency</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Native:</span>
                  <span>Native or bilingual proficiency</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
