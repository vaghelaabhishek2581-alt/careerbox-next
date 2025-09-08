// components/forms/WorkExperienceForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
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
import { useAppDispatch } from "@/lib/redux/hooks";
import { addWorkExperience, updateWorkExperience } from "@/lib/redux/slices/workExperienceSlice";
import type { WorkExperience, WorkPosition } from "@/lib/types/profile.unified";
import type { SubmitHandler } from "react-hook-form";

const positionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Job title is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().nullable(),
  isCurrent: z.boolean().default(false),
  employmentType: z.enum([
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Freelance",
  ]),
  description: z.string().optional(),
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
  company: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
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
  const [newSkill, setNewSkill] = React.useState("");
  const [activePositionIndex, setActivePositionIndex] = React.useState(0);
  const isEditing = !!experience;

  const form = useForm<WorkExperienceFormData>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      company: experience?.company || "",
      location: experience?.location || "",
      positions: experience?.positions || [{
        id: Date.now().toString(),
        title: "",
        startDate: new Date(),
        endDate: null,
        isCurrent: false,
        employmentType: "Full-time",
        description: "",
        skills: [],
      }],
    },
  });

  const positions = form.watch("positions");
  const isCurrent = positions[activePositionIndex]?.isCurrent;

  React.useEffect(() => {
    if (isCurrent) {
      const newPositions = [...positions];
      newPositions[activePositionIndex].endDate = null;
      form.setValue("positions", newPositions);
    }
  }, [isCurrent, form, positions, activePositionIndex]);

  const onSubmit: SubmitHandler<WorkExperienceFormData> = (data) => {
    const workData = {
      ...data,
      positions: data.positions.map(pos => ({
        ...pos,
        id: pos.id || Date.now().toString(),
        endDate: pos.isCurrent ? null : pos.endDate,
      })),
    };

    if (isEditing && experience) {
      dispatch(updateWorkExperience({ id: experience.id, workData }));
    } else {
      dispatch(addWorkExperience(workData));
    }
    onClose();
    form.reset();
  };

  const addPosition = () => {
    const currentPositions = form.getValues("positions");
    form.setValue("positions", [...currentPositions, {
      id: Date.now().toString(),
      title: "",
      startDate: new Date(),
      endDate: null,
      isCurrent: false,
      employmentType: "Full-time",
      description: "",
      skills: [],
    }]);
    setActivePositionIndex(currentPositions.length);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const currentPositions = form.getValues("positions");
      const currentSkills = currentPositions[activePositionIndex].skills || [];
      const newPositions = [...currentPositions];
      newPositions[activePositionIndex] = {
        ...newPositions[activePositionIndex],
        skills: [...currentSkills, newSkill.trim()]
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
      skills: currentSkills.filter((_, i) => i !== skillIndex)
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
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Position {index + 1}</h4>
                    {index === activePositionIndex ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setActivePositionIndex(index)}
                      >
                        Edit
                      </Button>
                    )}
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
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select employment type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Full-time">Full-time</SelectItem>
                                <SelectItem value="Part-time">Part-time</SelectItem>
                                <SelectItem value="Contract">Contract</SelectItem>
                                <SelectItem value="Internship">Internship</SelectItem>
                                <SelectItem value="Freelance">Freelance</SelectItem>
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
                            onKeyPress={(e) =>
                              e.key === "Enter" && (e.preventDefault(), addSkill())
                            }
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
              <Button type="submit">
                {isEditing ? "Update Experience" : "Save Experience"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
