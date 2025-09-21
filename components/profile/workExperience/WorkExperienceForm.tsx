import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Trash2 } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/lib/redux/hooks";
import { updateWorkExperience, addWorkExperience } from "@/lib/redux/slices/profileSlice";
import { WorkExperienceFormProps, WorkExperienceFormData, workExperienceSchema, employmentTypeLabels, locationTypeLabels } from "./types";
import { generateUniqueId } from "./utils";
import { EnhancedDatePicker } from "./EnhancedDatePicker";
import { WorkExperiencePreview } from "./WorkExperiencePreview";

export const WorkExperienceForm: React.FC<WorkExperienceFormProps> = ({
  open,
  onClose,
  experience,
  variant = 'modal',
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [newSkill, setNewSkill] = React.useState("");
  const [activePositionIndex, setActivePositionIndex] = React.useState(0);
  const isEditing = !!experience;

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

  const getDefaultValues = (exp?: any): WorkExperienceFormData => {
    return {
      company: exp?.company || "",
      location: exp?.location || "",
      positions: exp?.positions
        ? exp.positions.map((pos: any) => ({
            ...pos,
            startDate: typeof pos.startDate === "string" ? new Date(pos.startDate) : pos.startDate,
            endDate: pos.endDate ? (typeof pos.endDate === "string" ? new Date(pos.endDate) : pos.endDate) : null,
            employmentType: pos.employmentType || "FULL_TIME",
            locationType: pos.locationType || "ONSITE",
            skills: pos.skills || [],
          }))
        : [
            {
              id: generateUniqueId(),
              title: "",
              startDate: new Date(),
              endDate: null,
              isCurrent: false,
              employmentType: "FULL_TIME",
              locationType: "ONSITE",
              description: "",
              skills: [],
            },
          ],
    };
  };

  const form = useForm<WorkExperienceFormData>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: getDefaultValues(experience),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const positions = form.watch("positions");
  const watchedData = form.watch();

  React.useEffect(() => {
    if (!open) {
      form.reset();
      setNewSkill("");
      setActivePositionIndex(0);
    } else if (experience) {
      const formData = getDefaultValues(experience);
      form.reset(formData);
      setNewSkill("");
      setActivePositionIndex(0);
    }
  }, [open, form, experience]);

  const handleCurrentRoleChange = (index: number, isCurrent: boolean) => {
    if (isCurrent) {
      const currentPositions = form.getValues("positions");
      const newPositions = [...currentPositions];
      newPositions[index] = {
        ...newPositions[index],
        isCurrent: true,
        endDate: null,
      };
      form.setValue("positions", newPositions, { shouldValidate: true });
    }
  };

  const handleStartDateChange = (index: number, startDate: Date | undefined) => {
    if (!startDate) return;

    const currentPositions = form.getValues("positions");
    const newPositions = [...currentPositions];
    const currentEndDate = newPositions[index].endDate;
    
    if (currentEndDate && currentEndDate < startDate) {
      newPositions[index] = {
        ...newPositions[index],
        startDate,
        endDate: null,
      };
    } else {
      newPositions[index] = {
        ...newPositions[index],
        startDate,
      };
    }
    
    form.setValue("positions", newPositions, { shouldValidate: true });
  };

  const onSubmit = async (data: WorkExperienceFormData) => {
    const workData = {
      ...data,
      id: experience?.id || generateUniqueId(),
      positions: data.positions.map((pos) => ({
        ...pos,
        id: pos.id || generateUniqueId(),
        startDate: pos.startDate instanceof Date ? pos.startDate.toISOString() : pos.startDate,
        // Convert null to undefined to match the expected type
        endDate: pos.isCurrent
          ? undefined
          : pos.endDate
          ? pos.endDate instanceof Date
            ? pos.endDate.toISOString()
            : pos.endDate
          : undefined,
        employmentType: pos.employmentType || 'FULL_TIME',
        locationType: pos.locationType || 'ONSITE',
        skills: pos.skills || [],
      })),
    };

    console.log('🚀 Submitting work experience data:', JSON.stringify(workData, null, 2));

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
      id: generateUniqueId(),
      title: "",
      startDate: new Date(),
      endDate: null,
      isCurrent: false,
      employmentType: "FULL_TIME" as const,
      locationType: "ONSITE" as const,
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

  const content = (
    <div className="flex h-full min-h-[90vh]">
      {/* Left side - Form */}
      <div className="flex-1 lg:w-1/2 p-6 overflow-y-auto border-r border-gray-200">
       

        <Form {...form}>
          <form id="work-experience-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Details */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50">
              <h3 className="text-base font-medium text-gray-900">Company Details</h3>

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Google, Microsoft" {...field} />
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
                      <Input placeholder="e.g. San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Positions */}
            <div className="space-y-4 pb-20">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium text-gray-900">Positions</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPosition}
                  className="text-blue-600 hover:text-blue-700 border-blue-200"
                >
                  Add Position
                </Button>
              </div>

              {positions.map((position, index) => (
                <div key={`position-${position.id}-${index}`} className="p-4 border rounded-lg space-y-4 bg-white">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-700">
                      Position {index + 1}
                      {position.title && ` - ${position.title}`}
                    </h4>
                    <div className="flex items-center gap-2">
                      {index === activePositionIndex ? (
                        <Badge className="bg-blue-100 text-blue-800">Editing</Badge>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActivePositionIndex(index)}
                          className="text-blue-600 hover:text-blue-700"
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
                    <div className="space-y-4 pt-2 border-t">
                      <FormField
                        control={form.control}
                        name={`positions.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
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

                        <FormField
                          control={form.control}
                          name={`positions.${index}.locationType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select location type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="ONSITE">On-site</SelectItem>
                                  <SelectItem value="REMOTE">Remote</SelectItem>
                                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`positions.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <EnhancedDatePicker
                                  date={field.value}
                                  onDateChange={(date) => {
                                    field.onChange(date);
                                    if (date) {
                                      handleStartDateChange(index, date);
                                    }
                                  }}
                                  placeholder="MM/YYYY"
                                  maxDate={new Date()}
                                />
                              </FormControl>
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
                              <FormControl>
                                <EnhancedDatePicker
                                  date={field.value || undefined}
                                  onDateChange={(date) => {
                                    field.onChange(date);
                                    // Re-validate endDate to clear any stale errors
                                    form.trigger(`positions.${index}.endDate` as const);
                                  }}
                                  disabled={positions[index].isCurrent}
                                  placeholder="MM/YYYY"
                                  minDate={positions[index].startDate}
                                  maxDate={new Date()}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`positions.${index}.isCurrent`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-gray-50/50">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Current Role</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                I am currently working in this role
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  handleCurrentRoleChange(index, checked);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

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
                              key={`skill-${skill}-${skillIndex}-${position.id}`}
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
                    </div>
                  )}
                </div>
              ))}
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
                    "Update Experience"
                  ) : (
                    "Save Experience"
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>

      {/* Right side - Preview (hidden on smaller screens) */}
      <div className="hidden lg:block lg:w-1/2">
        <WorkExperiencePreview data={watchedData} />
      </div>
    </div>
  );

  if (variant === 'full-screen') {
    if (!open) return null;
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/40"  aria-hidden="true" />
        <section
          role="dialog"
          aria-modal="true"
          aria-label={isEditing ? 'Edit Work Experience' : 'Add Work Experience'}
          className="fixed inset-0 z-50 mt-[10vh] rounded-t-2xl bg-background overflow-hidden"
        >
        <header className="flex items-center justify-between px-6 py-4 border-b">
          <h1 className="text-lg font-semibold">
            {isEditing ? 'Edit Work Experience' : 'Add Work Experience'}
          </h1>
          <div className="flex items-center gap-2">
            <Button 
              type="submit" 
              form="work-experience-form"
              disabled={form.formState.isSubmitting}
            >
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
