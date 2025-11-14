import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addEducation, updateEducation } from "@/lib/redux/slices/profileSlice";
import { EducationFormProps, SingleEducationFormData, singleEducationSchema, courseLevels, fieldsOfStudy } from "./types";
import { getDefaultValues, formatEducationForSubmission } from "./utils";
import { EnhancedDatePicker } from "./EnhancedDatePicker";
import { EducationPreview } from "./EducationPreview";

export const EducationForm: React.FC<EducationFormProps> = ({
  open,
  onClose,
  education,
  variant = 'modal',
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const isEditing = !!education;

  // Lock body scroll only when full-screen variant is open
  React.useEffect(() => {
    if (variant === 'full-screen' && open) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [variant, open]);

  const form = useForm<SingleEducationFormData>({
    resolver: zodResolver(singleEducationSchema),
    defaultValues: getDefaultValues(education),
  });

  const watchedData = form.watch();
  const isCurrent = form.watch("isCurrent");

  // Reset form when dialog closes or education changes
  React.useEffect(() => {
    if (!open) {
      form.reset();
    } else if (education) {
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

  const onSubmit = async (data: SingleEducationFormData) => {
    const educationData = formatEducationForSubmission(data, education?.id);

    console.log('🚀 Submitting education data:', JSON.stringify(educationData, null, 2));

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

  const content = (
    <div className="flex h-full min-h-[90vh]">
      {/* Left side - Form */}
      <div className="flex-1 lg:w-1/2 p-6 overflow-y-auto border-r border-gray-200 pb-28">
        <Form {...form}>
          <form id="education-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Institution Details */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
              <h3 className="text-base font-medium text-gray-900">Institution Details</h3>

              <FormField
                control={form.control}
                name="institution"
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

            {/* Education Details */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
              <h3 className="text-base font-medium text-gray-900">Education Details</h3>

              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Level / Degree</FormLabel>
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

              <FormField
                control={form.control}
                name="fieldOfStudy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study</FormLabel>
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
            </div>

            {/* Duration */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
              <h3 className="text-base font-medium text-gray-900">Duration</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <EnhancedDatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select start date"
                        />
                      </FormControl>
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
                      <FormControl>
                        <EnhancedDatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select end date"
                          disabled={isCurrent}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
            </div>

            {/* Description */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
              <h3 className="text-base font-medium text-gray-900">Additional Details</h3>

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
            </div>

            {/* Form actions - only show in modal mode */}
            {variant === 'modal' && (
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
                    "Update Education"
                  ) : (
                    "Save Education"
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>

      {/* Right side - Preview (hidden on smaller screens) */}
      <div className="hidden lg:block lg:w-1/2">
        <EducationPreview data={watchedData} />
      </div>
    </div>
  );

  if (variant === 'full-screen') {
    if (!open) return null;
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/40" aria-hidden="true" />
        <section
          role="dialog"
          aria-modal="true"
          aria-label={isEditing ? 'Edit Education' : 'Add Education'}
          className="fixed inset-0 z-50 mt-[18vh] rounded-t-2xl bg-background overflow-hidden"
        >
          <header className="flex items-center justify-between px-6 py-4 border-b">
            <h1 className="text-lg font-semibold">
              {isEditing ? 'Edit Education' : 'Add Education'}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                form="education-form"
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
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="h-[calc(100%-4rem)]">{content}</main>
        </section>
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden">
        {content}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-8 w-8 p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};
