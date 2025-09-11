// components/forms/LanguagesForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { addLanguage, updateLanguage, deleteLanguage } from "@/lib/redux/slices/profileSlice";
import type { Language } from "@/lib/types/profile.unified";

const languageSchema = z.object({
  name: z.string().min(1, "Language name is required"),
  level: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "FLUENT", "NATIVE"]),
});

type LanguageFormData = z.infer<typeof languageSchema>;

interface LanguagesFormProps {
  open: boolean;
  onClose: () => void;
}

export const LanguagesForm: React.FC<LanguagesFormProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const profile = useAppSelector((state) => state.profile.profile);
  const [editingLanguage, setEditingLanguage] = React.useState<Language | null>(
    null
  );

  const form = useForm<LanguageFormData>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      name: "",
      level: "Basic",
    },
  });

  // Cleanup form state on unmount
  React.useEffect(() => {
    return () => {
      form.reset();
      setEditingLanguage(null);
    };
  }, []);

  const onSubmit = async (data: LanguageFormData) => {
    try {
      if (editingLanguage) {
        await dispatch(updateLanguage({ id: editingLanguage.id, languageData: data })).unwrap();
        toast({
          title: "Language Updated",
          description: "Language proficiency has been updated successfully."
        });
        setEditingLanguage(null);
      } else {
        await dispatch(addLanguage(data)).unwrap();
        toast({
          title: "Language Added",
          description: "New language proficiency has been added successfully."
        });
      }
      form.reset();
    } catch (error) {
      console.error('Failed to save language:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save language proficiency. Please try again."
      });
    }
  };

  const handleEditLanguage = (language: Language) => {
    setEditingLanguage(language);
    form.setValue("name", language.name);
    form.setValue("level", language.level);
  };

  const handleDeleteLanguage = async (languageId: string) => {
    try {
      await dispatch(deleteLanguage(languageId)).unwrap();
      toast({
        title: "Language Deleted",
        description: "Language proficiency has been removed successfully."
      });
      if (editingLanguage?.id === languageId) {
        setEditingLanguage(null);
        form.reset();
      }
    } catch (error) {
      console.error('Failed to delete language:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete language proficiency. Please try again."
      });
    }
  };

  const handleCancel = () => {
    setEditingLanguage(null);
    form.reset();
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Basic":
        return "bg-red-100 text-red-700 border-red-200";
      case "Intermediate":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Advanced":
        return "bg-green-100 text-green-700 border-green-200";
      case "Fluent":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Native":
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Languages</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Showcase your language proficiencies
          </p>
        </DialogHeader>

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

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {editingLanguage ? "Updating..." : "Adding..."}
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          {editingLanguage ? "Update Language" : "Add Language"}
                        </>
                      )}
                    </Button>
                    {editingLanguage && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Languages List */}
          <div className="space-y-3">
            <h3 className="font-medium">Added Languages</h3>
            {profile?.languages?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No languages added yet.
              </p>
            ) : (
              <div className="space-y-2">
                {profile?.languages?.map((language) => (
                  <div
                    key={language.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      editingLanguage?.id === language.id
                        ? "ring-2 ring-purple-500 bg-purple-50"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        {language.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getLevelColor(language.level)}`}
                      >
                        {language.level}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLanguage(language)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLanguage(language.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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
          <div className="flex justify-end gap-2 pt-4 border-t">
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
      </DialogContent>
    </Dialog>
  );
};
