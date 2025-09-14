// components/forms/SkillsForm.tsx
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
import { addSkill, updateSkill, deleteSkill, fetchProfile, removeSkillOptimistic, addSkillOptimistic } from "@/lib/redux/slices/profileSlice";
import type { ISkill } from "@/lib/redux/slices/profileSlice";

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
});

type SkillFormData = z.infer<typeof skillSchema>;

interface SkillsFormProps {
  open: boolean;
  onClose: () => void;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const profile = useAppSelector((state) => state.profile.profile);
  const isLoading = useAppSelector((state) => state.profile.isLoading);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "", 
      level: "BEGINNER",
    },
  });

  // Reset form when dialog opens/closes and fetch profile if needed
  React.useEffect(() => {
    if (!open) {
      form.reset();
    } else if (open && !profile) {
      // Fetch profile when dialog opens if not already loaded
      dispatch(fetchProfile());
    }
  }, [open, form, profile, dispatch]);

  const onSubmit = async (data: SkillFormData) => {
    try {
      setIsSubmitting(true);
      
      // Check if skill already exists
      const existingSkill = profile?.skills?.find(
        skill => skill.name.toLowerCase() === data.name.toLowerCase()
      );
      
      if (existingSkill) {
        toast({
          variant: "destructive",
          title: "Skill Already Exists",
          description: "This skill has already been added to your profile."
        });
        return;
      }
      
      await dispatch(addSkill(data)).unwrap();
      toast({
        title: "Skill Added",
        description: "New skill has been added successfully."
      });
      
      // Reset form after successful submission
      form.reset({
        name: "",
        level: "BEGINNER",
      });
      
    } catch (error) {
      console.error('Failed to save skill:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save skill. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    // Optimistic update - remove locally first
    const skillToDelete = profile?.skills?.find(skill => skill.id === skillId);
    if (skillToDelete) {
      // Dispatch optimistic update
      dispatch(removeSkillOptimistic(skillId));
      
      toast({
        title: "Skill Deleted",
        description: "Skill has been removed successfully."
      });
    }

    // API call in background
    try {
      await dispatch(deleteSkill(skillId)).unwrap();
    } catch (error) {
      console.error('Failed to delete skill:', error);
      
      // Revert optimistic update on error
      if (skillToDelete) {
        dispatch(addSkillOptimistic(skillToDelete));
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete skill. Please try again."
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-red-100 text-red-700 border-red-200";
      case "INTERMEDIATE":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "ADVANCED":
        return "bg-green-100 text-green-700 border-green-200";
      case "EXPERT":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const commonSkills = [
    "JavaScript", "Python", "React", "Node.js", "HTML", "CSS", "Java",
    "SQL", "MongoDB", "Git", "AWS", "Docker", "TypeScript", "Angular",
    "Vue.js", "PHP", "C++", "Machine Learning", "Data Analysis", "Project Management"
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Skills</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Manage your professional skills
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Skill Form */}
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
                          <FormLabel>Skill Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Enter skill (e.g., React, Python)"
                                {...field}
                                list="skills-list"
                              />
                              <datalist id="skills-list">
                                {commonSkills.map((skill) => (
                                  <option key={skill} value={skill} />
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
                          <FormLabel>Skill Level</FormLabel>
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
                              <SelectItem value="BEGINNER">Beginner</SelectItem>
                              <SelectItem value="INTERMEDIATE">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="ADVANCED">Advanced</SelectItem>
                              <SelectItem value="EXPERT">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Skill
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Skills List */}
          <div className="space-y-3">
            <h3 className="font-medium">
              Added Skills ({profile?.skills?.length || 0})
            </h3>
            {!profile?.skills || profile.skills.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  No skills added yet. Add your first skill above.
                </p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {profile?.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="group flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {skill.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 rounded-full ${getLevelColor(skill.level)}`}
                      >
                        {skill.level}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSkill(skill.id)}
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

          {/* Skill Level Guide */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-3">
                Skill Level Guide
              </h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Beginner:</span>
                  <span>Basic understanding and limited experience</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Intermediate:</span>
                  <span>Good working knowledge with some experience</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Advanced:</span>
                  <span>Strong expertise and extensive experience</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Expert:</span>
                  <span>Mastery level with deep understanding</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};