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
import { addSkill, updateSkill, deleteSkill } from "@/lib/redux/slices/profileSlice";
import type { Skill } from "@/lib/types/profile.unified";

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
});

type SkillFormData = z.infer<typeof skillSchema>;

interface SkillsFormProps {
  open: boolean;
  onClose: () => void;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile.profile);
  const isLoading = useAppSelector((state) => state.profile.isLoading);
  const [editingSkill, setEditingSkill] = React.useState<Skill | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      level: "Beginner",
    },
  });

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setEditingSkill(null);
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: SkillFormData) => {
    try {
      setIsSubmitting(true);
      
      // Convert level to uppercase to match backend enum
      const formattedData = {
        ...data,
        level: data.level.toUpperCase() as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
      };

      if (editingSkill) {
        await dispatch(updateSkill({ id: editingSkill.id, skillData: formattedData })).unwrap();
        setEditingSkill(null);
      } else {
        await dispatch(addSkill(formattedData)).unwrap();
      }
      
      // Reset form after successful submission
      form.reset({
        name: "",
        level: "Beginner",
      });
      
    } catch (error) {
      console.error('Failed to save skill:', error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    form.reset({
      name: skill.name,
      level: skill.level as "Beginner" | "Intermediate" | "Advanced" | "Expert",
    });
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await dispatch(deleteSkill(skillId)).unwrap();
      if (editingSkill?.id === skillId) {
        setEditingSkill(null);
        form.reset();
      }
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  const handleCancel = () => {
    setEditingSkill(null);
    form.reset({
      name: "",
      level: "Beginner",
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-red-100 text-red-700 border-red-200";
      case "Intermediate":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Advanced":
        return "bg-green-100 text-green-700 border-green-200";
      case "Expert":
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
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Expert">Expert</SelectItem>
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
                      disabled={isSubmitting || isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {editingSkill ? "Update Skill" : "Add Skill"}
                    </Button>
                    {editingSkill && (
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

          {/* Skills List */}
          <div className="space-y-3">
            <h3 className="font-medium">
              Added Skills ({profile?.skills?.length || 0})
            </h3>
            {!profile?.skills || profile.skills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  No skills added yet.
                </p>
                <p className="text-xs text-gray-400">
                  Add your first skill using the form above
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {profile?.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      editingSkill?.id === skill.id
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        {skill.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getLevelColor(skill.level)}`}
                      >
                        {skill.level}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSkill(skill)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSkill(skill.id)}
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