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
  editingPositionId,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [newSkill, setNewSkill] = React.useState("");
  const [activePositionIndex, setActivePositionIndex] = React.useState(0);
  const [collapsedPositions, setCollapsedPositions] = React.useState<Set<number>>(new Set());
  const isEditing = !!experience;
  const isEditingSpecificPosition = !!editingPositionId;
  const activePositionRef = React.useRef<HTMLDivElement>(null);

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

      // If editingPositionId is provided, find and set that position as active
      if (editingPositionId && experience.positions) {
        const positionIndex = experience.positions.findIndex(
          (pos: any) => pos.id === editingPositionId
        );

        const targetIndex = positionIndex >= 0 ? positionIndex : 0;
        setActivePositionIndex(targetIndex);

        // When editing a specific position, collapse all others initially
        if (experience.positions.length > 1) {
          const collapsedSet = new Set<number>();
          experience.positions.forEach((_: any, index: number) => {
            if (index !== targetIndex) {
              collapsedSet.add(index);
            }
          });
          setCollapsedPositions(collapsedSet);
        }

        // Auto-scroll to the target position after a short delay
        setTimeout(() => {
          if (activePositionRef.current) {
            activePositionRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 100);
      } else {
        setActivePositionIndex(0);
        // When editing whole experience, show all positions expanded
        setCollapsedPositions(new Set());
      }
    }
  }, [open, form, experience, editingPositionId]);

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

      // Toast is now handled by the thunk
      onClose();
    } catch (error) {
      console.error("Failed to save work experience:", error);
      // Error toast is now handled by the thunk
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

  const togglePositionCollapse = (index: number) => {
    const newCollapsed = new Set(collapsedPositions);
    if (newCollapsed.has(index)) {
      newCollapsed.delete(index);
    } else {
      newCollapsed.add(index);
    }
    setCollapsedPositions(newCollapsed);
  };

  const expandAllPositions = () => {
    setCollapsedPositions(new Set());
  };

  const collapseAllExceptActive = () => {
    const newCollapsed = new Set<number>();
    positions.forEach((_, index) => {
      if (index !== activePositionIndex) {
        newCollapsed.add(index);
      }
    });
    setCollapsedPositions(newCollapsed);
  };

  const content = (
    <div className="flex h-full min-h-[90vh] pb-24">
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
                <div className="flex items-center gap-4">
                  <h3 className="text-base font-medium text-gray-900">Positions</h3>
                  {isEditingSpecificPosition && positions.length > 1 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={expandAllPositions}
                        className="text-gray-600 hover:text-gray-800 h-7 px-2"
                      >
                        Expand All
                      </Button>
                      <span className="text-gray-400">|</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={collapseAllExceptActive}
                        className="text-gray-600 hover:text-gray-800 h-7 px-2"
                      >
                        Focus Mode
                      </Button>
                    </div>
                  )}
                </div>
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

              {isEditingSpecificPosition && positions.length > 1 && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Editing specific position - moved to top for easy access. Other positions are collapsed for focus.</span>
                  </div>
                </div>
              )}

              {(() => {
                // Reorder positions: active position first, then others
                const reorderedPositions = [...positions];
                if (isEditingSpecificPosition && activePositionIndex > 0) {
                  const activePos = reorderedPositions[activePositionIndex];
                  reorderedPositions.splice(activePositionIndex, 1);
                  reorderedPositions.unshift(activePos);
                }

                return reorderedPositions.map((position, displayIndex) => {
                  // Find the original index of this position
                  const originalIndex = positions.findIndex(p => p.id === position.id);
                  const isCollapsed = collapsedPositions.has(originalIndex);
                  const isActive = originalIndex === activePositionIndex;

                  return (
                    <div
                      key={`position-${position.id}-${originalIndex}`}
                      ref={isActive ? activePositionRef : null}
                      data-position-index={originalIndex}
                      className="border  rounded-lg bg-white border-gray-200 hover:border-gray-300 transition-all"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => togglePositionCollapse(originalIndex)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {isCollapsed ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </button>
                            <h4 className="font-medium flex items-center gap-2 text-gray-700">
                              {isActive && (
                                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">EDITING</span>
                              )}
                              Position {originalIndex + 1}
                              {position.title && ` - ${position.title}`}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isActive && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setActivePositionIndex(originalIndex);
                                  // Auto-expand when switching to edit this position
                                  const newCollapsed = new Set(collapsedPositions);
                                  newCollapsed.delete(originalIndex);
                                  setCollapsedPositions(newCollapsed);
                                }}
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
                                onClick={() => removePosition(originalIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Show collapsed summary */}
                        {isCollapsed && (
                          <div className="mt-2 text-sm text-gray-500">
                            {position.title && <span className="font-medium">{position.title}</span>}
                            {position.startDate && (
                              <span className="ml-2">
                                {new Date(position.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                {position.isCurrent ? ' - Present' : position.endDate ? ` - ${new Date(position.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!isCollapsed && isActive && (
                        <div className="space-y-4 p-4 pt-2 border-t">
                          <FormField
                            control={form.control}
                            name={`positions.${originalIndex}.title`}
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
                              name={`positions.${originalIndex}.employmentType`}
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
                              name={`positions.${originalIndex}.locationType`}
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
                              name={`positions.${originalIndex}.startDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Date</FormLabel>
                                  <FormControl>
                                    <EnhancedDatePicker
                                      date={field.value}
                                      onDateChange={(date) => {
                                        field.onChange(date);
                                        if (date) {
                                          handleStartDateChange(originalIndex, date);
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
                              name={`positions.${originalIndex}.endDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Date</FormLabel>
                                  <FormControl>
                                    <EnhancedDatePicker
                                      date={field.value || undefined}
                                      onDateChange={(date) => {
                                        field.onChange(date);
                                        // Re-validate endDate to clear any stale errors
                                        form.trigger(`positions.${originalIndex}.endDate` as const);
                                      }}
                                      disabled={positions[originalIndex].isCurrent}
                                      placeholder="MM/YYYY"
                                      minDate={positions[originalIndex].startDate}
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
                            name={`positions.${originalIndex}.isCurrent`}
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
                                      handleCurrentRoleChange(originalIndex, checked);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`positions.${originalIndex}.description`}
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
                              {positions[originalIndex].skills?.map((skill, skillIndex) => (
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
                  );
                });
              })()}
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
    console.log('🔍 Modal render check:', {
      open,
      variant,
      isEditing,
      isEditingSpecificPosition,
      editingPositionId,
      experienceId: experience?.id,
      positionsCount: experience?.positions?.length
    });
    if (!open) return null;
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/40" aria-hidden="true" />
        <section
          role="dialog"
          aria-modal="true"
          aria-label={isEditing ? 'Edit Work Experience' : 'Add Work Experience'}
          className="fixed inset-0 z-50 mt-[18vh] rounded-t-2xl bg-background overflow-hidden"
        >
          <header className="flex items-center justify-between px-6 py-4 border-b bg-blue-100">
            <h1 className="text-lg font-semibold">
              {isEditing ? (isEditingSpecificPosition ? 'Edit Position' : 'Edit Work Experience') : 'Add Work Experience'}
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
                ) : (
                  isEditing ? "Update Experience" : "Save Experience"
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
