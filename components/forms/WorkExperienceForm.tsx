// components/forms/WorkExperienceForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, X, Loader2, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/lib/redux/hooks";
import type { WorkExperience } from "@/lib/types/profile.unified";
import type { SubmitHandler } from "react-hook-form";
import { updateWorkExperience, addWorkExperience } from "@/lib/redux/slices/profileSlice";

const positionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Job title is required").max(100, "Job title must be less than 100 characters"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().nullable(),
  isCurrent: z.boolean().default(false),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "FREELANCE",
  ]),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
  skills: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (!data.isCurrent && !data.endDate) {
      return false;
    }
    if (data.endDate && data.startDate && data.endDate < data.startDate) {
      return false;
    }
    return true;
  },
  {
    message: "End date must be after start date, or mark as current role",
    path: ["endDate"],
  }
);

const workExperienceSchema = z.object({
  company: z.string().min(1, "Company name is required").max(100, "Company name must be less than 100 characters"),
  location: z.string().min(1, "Location is required").max(100, "Location must be less than 100 characters"),
  positions: z.array(positionSchema).min(1, "At least one position is required"),
});

type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;

interface WorkExperienceFormProps {
  open: boolean;
  onClose: () => void;
  experience?: WorkExperience;
}

export const WorkExperienceForm: React.FC<WorkExperienceFormProps> = ({
  open,
  onClose,
  experience,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [newSkill, setNewSkill] = React.useState("");
  const [activePositionIndex, setActivePositionIndex] = React.useState(0);
  const isEditing = !!experience;

  const form = useForm<WorkExperienceFormData>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      company: experience?.company || "",
      location: experience?.location || "",
      positions: experience?.positions
        ? experience.positions.map((pos) => ({
            ...pos,
            // Convert string dates to Date objects if needed
            startDate: typeof pos.startDate === "string" ? new Date(pos.startDate) : pos.startDate,
            endDate: pos.endDate ? (typeof pos.endDate === "string" ? new Date(pos.endDate) : pos.endDate) : null,
            employmentType: pos.employmentType || "FULL_TIME",
            skills: pos.skills || [],
          }))
        : [
            {
              id: Date.now().toString(),
              title: "",
              startDate: new Date(),
              endDate: null,
              isCurrent: false,
              employmentType: "FULL_TIME",
              description: "",
              skills: [],
            },
          ],
    },
  });

  const positions = form.watch("positions");
  const currentPosition = positions[activePositionIndex];

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      form.reset();
      setNewSkill("");
      setActivePositionIndex(0);
    }
  }, [open, form]);

  // Handle current role toggle
  React.useEffect(() => {
    if (currentPosition?.isCurrent) {
      const newPositions = [...positions];
      newPositions[activePositionIndex] = {
        ...newPositions[activePositionIndex],
        endDate: null,
      };
      form.setValue("positions", newPositions, { shouldValidate: true });
    }
  }, [currentPosition?.isCurrent, activePositionIndex, positions, form]);

  const onSubmit: SubmitHandler<WorkExperienceFormData> = async (data) => {
    const workData = {
      ...data,
      id: experience?.id || Date.now().toString(),
      positions: data.positions.map((pos) => ({
        ...pos,
        id: pos.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
        startDate: pos.startDate instanceof Date ? pos.startDate.toISOString() : pos.startDate,
        // Convert null to undefined to match the expected type
        endDate: pos.isCurrent
          ? undefined
          : pos.endDate
          ? pos.endDate instanceof Date
            ? pos.endDate.toISOString()
            : pos.endDate
          : undefined,
        skills: pos.skills || [],
      })),
    };

    try {
      if (isEditing && experience) {
        await dispatch(
          updateWorkExperience({
            id: experience.id,
            workData,
          })
        ).unwrap();
      } else {
        await dispatch(addWorkExperience(workData)).unwrap();
      }

      toast({
        title: isEditing ? "Experience Updated" : "Experience Added",
        description: isEditing
          ? "Work experience has been updated successfully."
          : "New work experience has been added successfully.",
      });
      onClose();
    } catch (error) {
      console.error("Failed to save work experience:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save work experience. Please try again.",
      });
    }
  };

  const addPosition = () => {
    const currentPositions = form.getValues("positions");
    const newPosition = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: "",
      startDate: new Date(),
      endDate: null,
      isCurrent: false,
      employmentType: "FULL_TIME" as const,
      description: "",
      skills: [],
    };

    form.setValue("positions", [...currentPositions, newPosition]);
    setActivePositionIndex(currentPositions.length);
  };

  const removePosition = (index: number) => {
    const currentPositions = form.getValues("positions");
    if (currentPositions.length <= 1) {
      toast({
        variant: "destructive",
        title: "Cannot Remove",
        description: "At least one position is required.",
      });
      return;
    }

    const newPositions = currentPositions.filter((_, i) => i !== index);
    form.setValue("positions", newPositions);
    
    // Adjust active position index if needed
    if (activePositionIndex >= newPositions.length) {
      setActivePositionIndex(newPositions.length - 1);
    } else if (activePositionIndex > index) {
      setActivePositionIndex(activePositionIndex - 1);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const currentPositions = form.getValues("positions");
      const currentSkills = currentPositions[activePositionIndex].skills || [];
      
      // Check if skill already exists
      if (currentSkills.includes(newSkill.trim())) {
        toast({
          variant: "destructive",
          title: "Duplicate Skill",
          description: "This skill has already been added.",
        });
        return;
      }

      const newPositions = [...currentPositions];
      newPositions[activePositionIndex] = {
        ...newPositions[activePositionIndex],
        skills: [...currentSkills, newSkill.trim()],
      };
      form.setValue("positions", newPositions);
      setNewSkill("");
    }
  };

  const removeSkill = (skillIndex: number) => {
    const currentPositions = form.getValues("positions");
    const currentSkills = currentPositions[activePositionIndex].skills || [];
    const newPositions = [...currentPositions];
    newPositions[activePositionIndex] = {
      ...newPositions[activePositionIndex],
      skills: currentSkills.filter((_, i) => i !== skillIndex),
    };
    form.setValue("positions", newPositions);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Work Experience" : "Add Work Experience"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Details */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Company Details</h3>

              {/* Company Name */}
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Positions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Positions</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPosition}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Add Position
                </Button>
              </div>

              {positions.map((position, index) => (
                <div key={position.id || index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">
                      Position {index + 1}
                      {position.title && ` - ${position.title}`}
                    </h4>
                    <div className="flex items-center gap-2">
                      {index === activePositionIndex ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActivePositionIndex(index)}
                        >
                          Edit
                        </Button>
                      )}
                      {positions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePosition(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {index === activePositionIndex && (
                    <>
                      {/* Job Title */}
                      <FormField
                        control={form.control}
                        name={`positions.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter Job Title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Employment Type */}
                      <FormField
                        control={form.control}
                        name={`positions.${index}.employmentType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employment Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select employment type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                <SelectItem value="PART_TIME">Part Time</SelectItem>
                                <SelectItem value="CONTRACT">Contract</SelectItem>
                                <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                <SelectItem value="FREELANCE">Freelance</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Start Date and End Date */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`positions.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "MMM yyyy")
                                      ) : (
                                        <span>MM/YYYY</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value || undefined}
                                    onSelect={field.onChange}
                                    disabled={(date) => date ? date > new Date() : false}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`positions.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      disabled={positions[index].isCurrent}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        (!field.value || positions[index].isCurrent) &&
                                          "text-muted-foreground"
                                      )}
                                    >
                                      {field.value && !positions[index].isCurrent ? (
                                        format(field.value, "MMM yyyy")
                                      ) : (
                                        <span>MM/YYYY</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value || undefined}
                                    onSelect={field.onChange}
                                    disabled={(date) => date ? date > new Date() : false}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Current Role Switch */}
                      <FormField
                        control={form.control}
                        name={`positions.${index}.isCurrent`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Current Role</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                I am currently working in this role
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Job Description */}
                      <FormField
                        control={form.control}
                        name={`positions.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your role and key responsibilities"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Skills Used */}
                      <div className="space-y-3">
                        <FormLabel>Skills Used</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a skill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addSkill();
                              }
                            }}
                          />
                          <Button type="button" onClick={addSkill} variant="outline">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {positions[index].skills?.map((skill, skillIndex) => (
                            <Badge
                              key={skillIndex}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {skill}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeSkill(skillIndex)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? "Updating..." : "Saving..."}
                  </>
                ) : isEditing ? (
                  "Update Experience"
                ) : (
                  "Save Experience"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};