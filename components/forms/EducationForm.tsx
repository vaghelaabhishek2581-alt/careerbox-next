// components/forms/EducationForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
import { Education } from "@/lib/redux/slices/educationSlice";
import { useAppSelector } from "@/lib/redux/hooks";

const educationSchema = z
  .object({
    degree: z.string().min(1, "Course Level/Degree is required"),
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
  education?: Education;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  open,
  onClose,
  education,
}) => {
  const { addEducation, updateEducation } = useAppSelector(
    (state: { education: { addEducation: any; updateEducation: any } }) =>
      state.education
  );
  const isEditing = !!education;

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      degree: education?.degree || "",
      institution: education?.institution || "",
      startDate: education?.startDate || undefined,
      endDate: education?.endDate || null,
      isCurrent: education?.isCurrent || false,
      location: education?.location || "",
      grade: education?.grade || "",
      description: education?.description || "",
    },
  });

  const isCurrent = form.watch("isCurrent");

  React.useEffect(() => {
    if (isCurrent) {
      form.setValue("endDate", null);
    }
  }, [isCurrent, form]);

  const onSubmit = (data: EducationFormData) => {
    const educationData = {
      ...data,
      endDate: data.isCurrent ? null : data.endDate,
    };

    if (isEditing && education) {
      updateEducation(education.id, educationData);
    } else {
      addEducation(educationData);
    }
    onClose();
    form.reset();
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

  const fieldOfStudy = [
    "Computer Science",
    "Information Technology",
    "Engineering",
    "Business Administration",
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
    "Other",
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Education Details" : "Add Education Details"}
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

            {/* Course Name / Branch / Stream */}
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name / Branch / Stream *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Course Name / Branch"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Specialization / Field of Study */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization / Field of Study</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Specialization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* School / College / Institute */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School / College / Institute</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Institution Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Exam Board / University */}
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Board / University *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Exam Board / University"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Passing Year */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passing Year</FormLabel>
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
                            format(field.value, "yyyy")
                          ) : (
                            <span>Enter End Year</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {isEditing ? "Update Education" : "Save Education"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
