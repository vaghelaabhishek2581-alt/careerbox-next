// components/forms/EducationForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addEducation, updateEducation } from "@/lib/redux/slices/profileSlice";
import type { IEducation } from "@/lib/redux/slices/profileSlice";

const educationSchema = z
  .object({
    degree: z.string().min(1, "Course Level/Degree is required"),
    fieldOfStudy: z.string().min(1, "Field of study is required"),
    institution: z.string().min(1, "Institution name is required"),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date().nullable(),
    isCurrent: z.boolean().default(false),
    location: z.string().optional(),
    grade: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
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
      message:
        "End date must be after start date, or mark as currently studying",
      path: ["endDate"],
    }
  );

type EducationFormData = z.infer<typeof educationSchema>;

interface EducationFormProps {
  open: boolean;
  onClose: () => void;
  education?: IEducation;
}

// Helper function to generate unique IDs
const generateUniqueId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const EducationForm: React.FC<EducationFormProps> = ({
  open,
  onClose,
  education,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const isEditing = !!education;


  // Helper function to get default values
  const getDefaultValues = (edu?: IEducation): EducationFormData => {
    return {
      degree: edu?.degree || "",
      fieldOfStudy: edu?.fieldOfStudy || "",
      institution: edu?.institution || "",
      startDate: edu?.startDate ? new Date(edu.startDate) : new Date(),
      endDate: edu?.endDate ? new Date(edu.endDate) : null,
      isCurrent: edu?.isCurrent || false,
      location: edu?.location || "",
      grade: edu?.grade || "",
      description: edu?.description || "",
    };
  };

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: getDefaultValues(education),
  });

  const isCurrent = form.watch("isCurrent");

  // Reset form when dialog closes or education changes
  React.useEffect(() => {
    if (!open) {
      form.reset();
    } else if (education) {
      // Reset form with new education data when editing
      const formData = getDefaultValues(education);
      form.reset(formData);
    }
  }, [open, form, education]);

  // Handle current studying toggle
  React.useEffect(() => {
    if (isCurrent) {
      form.setValue("endDate", null, { shouldValidate: true });
    }
  }, [isCurrent, form]);

  const onSubmit = async (data: EducationFormData) => {
    const educationData = {
      ...data,
      id: education?.id || generateUniqueId(),
      startDate: data.startDate.toISOString(),
      endDate: data.isCurrent
        ? undefined
        : data.endDate
        ? data.endDate.toISOString()
        : undefined,
    };

    try {
      if (isEditing && education) {
        await dispatch(
          updateEducation({ id: education.id, educationData })
        ).unwrap();
      } else {
        await dispatch(addEducation(educationData)).unwrap();
      }
      // Toast is now handled by the thunk
      onClose();
    } catch (error) {
      console.error("Failed to save education:", error);
      // Error toast is now handled by the thunk
    }
  };

  const courseLevels = [
    "High School",
    "Diploma",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD",
    "Professional Degree",
    "Certificate",
    "Bootcamp",
    "Online Course",
  ];

  const fieldsOfStudy = [
    "Computer Science",
    "Information Technology",
    "Software Engineering",
    "Data Science",
    "Artificial Intelligence",
    "Cybersecurity",
    "Engineering",
    "Business Administration",
    "Management",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Medicine",
    "Economics",
    "Psychology",
    "Sociology",
    "Political Science",
    "Literature",
    "History",
    "Art & Design",
    "Marketing",
    "Finance",
    "Accounting",
    "Law",
    "Education",
    "Other",
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Education - ${education?.institution}` : "Add Education Details"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Share your comprehensive academic journey and achievements
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Course Level / Degree */}
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Level / Degree *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Course Level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courseLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Field of Study */}
            <FormField
              control={form.control}
              name="fieldOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field of Study *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Field of Study" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fieldsOfStudy.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Institution Name */}
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School / College / Institute *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Institution Name" {...field} />
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

            {/* Grade/GPA */}
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade / GPA / Percentage</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3.8 GPA, 85%, First Class" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date and End Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
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
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={isCurrent}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              (!field.value || isCurrent) &&
                                "text-muted-foreground"
                            )}
                          >
                            {field.value && !isCurrent ? (
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

            {/* Currently Studying Switch */}
            <FormField
              control={form.control}
              name="isCurrent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Currently Studying
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      I am currently studying this course
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about your education (activities, achievements, relevant coursework, etc.)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? "Updating..." : "Saving..."}
                  </>
                ) : isEditing ? (
                  "Update Education"
                ) : (
                  "Save Education"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};