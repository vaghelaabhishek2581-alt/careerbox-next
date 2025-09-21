import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X, Plus, Trash2, GraduationCap, BookOpen, Award } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addEducation } from "@/lib/redux/slices/profileSlice";
import { EducationFormData, educationSchema, courseLevels, fieldsOfStudy } from "./types";
import { getDefaultValues, formatEducationForSubmission } from "./utils";
import { EnhancedDatePicker } from "./EnhancedDatePicker";
import { cn } from "@/lib/utils";

interface MultiEducationFormProps {
  open: boolean;
  onClose: () => void;
  variant?: 'modal' | 'full-screen';
}

interface EducationEntry extends EducationFormData {
  tempId: string;
}

export const MultiEducationForm: React.FC<MultiEducationFormProps> = ({
  open,
  onClose,
  variant = 'modal',
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [educationList, setEducationList] = React.useState<EducationEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: getDefaultValues(),
  });

  const watchedData = form.watch();
  const isCurrent = form.watch("isCurrent");

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      form.reset();
      setEducationList([]);
    }
  }, [open, form]);

  // Handle current studying toggle
  React.useEffect(() => {
    if (isCurrent) {
      form.setValue("endDate", null, { shouldValidate: true });
    }
  }, [isCurrent, form]);

  const addEducationToList = async (data: EducationFormData) => {
    const newEducation: EducationEntry = {
      ...data,
      tempId: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };

    setEducationList(prev => [...prev, newEducation]);
    form.reset(getDefaultValues());
    
    toast({
      title: "Education Added to List",
      description: `${data.degree} at ${data.institution} has been added to your list.`,
    });
  };

  const removeEducationFromList = (tempId: string) => {
    setEducationList(prev => prev.filter(edu => edu.tempId !== tempId));
    toast({
      title: "Education Removed",
      description: "Education entry has been removed from the list.",
    });
  };

  const submitAllEducation = async () => {
    if (educationList.length === 0) {
      toast({
        variant: "destructive",
        title: "No Education to Save",
        description: "Please add at least one education entry before saving.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit each education entry individually for now
      // TODO: Use batch API when Redux slice is updated
      const promises = educationList.map(education => {
        const educationData = formatEducationForSubmission(education);
        return dispatch(addEducation(educationData)).unwrap();
      });

      await Promise.all(promises);

      toast({
        title: "Education Saved Successfully",
        description: `${educationList.length} education ${educationList.length === 1 ? 'entry' : 'entries'} have been saved to your profile.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Failed to save education entries:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save education entries. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForDisplay = (dateString: string | Date | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const content = (
    <div className="flex h-full min-h-[90vh]">
      {/* Left side - Form */}
      <div className="flex-1 lg:w-1/2 p-6 overflow-y-auto border-r border-gray-200">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Education</h2>
            <p className="text-sm text-gray-600">
              Add multiple education entries to build your academic journey.
            </p>
          </div>

          <Form {...form}>
            <form id="education-form" onSubmit={form.handleSubmit(addEducationToList)} className="space-y-6">
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

              {/* Add to List Button */}
              <div className="flex justify-center pt-4 border-t">
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Education List
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Right side - Education List */}
      <div className="flex-1 lg:w-1/2 p-6 overflow-y-auto bg-gray-50/30">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Education List ({educationList.length})
            </h3>
            {educationList.length > 0 && (
              <Button 
                onClick={submitAllEducation}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Save All ({educationList.length})
                  </>
                )}
              </Button>
            )}
          </div>

          {educationList.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-white">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Education Added Yet</h4>
              <p className="text-gray-500">
                Fill out the form on the left and click "Add to Education List" to start building your academic journey.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {educationList.map((education, index) => (
                <Card key={education.tempId} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          education.isCurrent ? "bg-green-100" : "bg-blue-100"
                        )}>
                          <GraduationCap className={cn(
                            "h-5 w-5",
                            education.isCurrent ? "text-green-600" : "text-blue-600"
                          )} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{education.institution}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {education.degree}
                            {education.fieldOfStudy && ` in ${education.fieldOfStudy}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducationFromList(education.tempId)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>
                          {formatDateForDisplay(education.startDate)} - {" "}
                          {education.isCurrent ? "Present" : formatDateForDisplay(education.endDate)}
                        </span>
                      </div>
                      
                      {education.location && (
                        <p className="text-sm text-gray-500">{education.location}</p>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={education.isCurrent ? "default" : "secondary"}
                          className={cn(
                            "text-xs",
                            education.isCurrent 
                              ? "bg-green-500 hover:bg-green-600 text-white" 
                              : "bg-gray-100 text-gray-700"
                          )}
                        >
                          {education.isCurrent ? (
                            <>
                              <BookOpen className="h-3 w-3 mr-1" />
                              Currently Studying
                            </>
                          ) : (
                            <>
                              <Award className="h-3 w-3 mr-1" />
                              Completed
                            </>
                          )}
                        </Badge>
                        
                        {education.grade && (
                          <Badge variant="outline" className="text-xs">
                            {education.grade}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
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
          aria-label="Add Multiple Education Entries"
          className="fixed inset-0 z-50 mt-[5vh] rounded-t-2xl bg-background overflow-hidden"
        >
          <header className="flex items-center justify-between px-6 py-4 border-b">
            <h1 className="text-lg font-semibold">Add Education Entries</h1>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
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
