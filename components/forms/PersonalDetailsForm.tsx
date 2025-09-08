// components/forms/PersonalDetailsForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, X, Loader2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProfileIdValidation } from "@/hooks/use-profile-id-validation";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { updatePersonalDetails } from "@/lib/redux/slices/profileSlice";
import type { PersonalDetails } from "@/lib/types/profile.unified";
import { SkillsForm } from "./SkillsForm";
import { LanguagesForm } from "./LanguagesForm";
import { EmailVerification } from "@/components/email-verification";

const personalDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.date().nullable(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),
  professionalHeadline: z.string().min(1, "Professional headline is required"),
  publicProfileId: z.string().min(1, "Public profile ID is required"),
  aboutMe: z.string().max(500, "About me must be less than 500 characters"),
  interests: z.array(z.string()).optional(),
  professionalBadges: z.array(z.string()).optional(),
});

type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

interface PersonalDetailsFormProps {
  open: boolean;
  onClose: () => void;
}

export const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile.profile);
  const [newInterest, setNewInterest] = React.useState("");
  const [newBadge, setNewBadge] = React.useState("");
  const [skillsDialogOpen, setSkillsDialogOpen] = React.useState(false);
  const [languagesDialogOpen, setLanguagesDialogOpen] = React.useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = React.useState(false);

  const form = useForm<PersonalDetailsFormData>({
    context: { mode: "onChange" },
    mode: "onChange",
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: profile?.personalDetails ? {
      email: profile.email || "",
      firstName: profile.personalDetails.firstName || "",
      middleName: profile.personalDetails.middleName || "",
      lastName: profile.personalDetails.lastName || "",
      dateOfBirth: profile.personalDetails.dateOfBirth || null,
      gender: profile.personalDetails.gender || "Prefer not to say",
      professionalHeadline: profile.personalDetails.professionalHeadline || "",
      publicProfileId: profile.personalDetails.publicProfileId || "",
      aboutMe: profile.personalDetails.aboutMe || "",
      interests: profile.personalDetails.interests || [],
      professionalBadges: profile.personalDetails.professionalBadges || [],
    } : {
      email: "",
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: null,
      gender: "Prefer not to say",
      professionalHeadline: "",
      publicProfileId: "",
      aboutMe: "",
      interests: [],
      professionalBadges: [],
    },
  });

  const onSubmit = async (data: PersonalDetailsFormData): Promise<void> => {
    const { validateProfileId } = useProfileIdValidation();
    const validationResult = await validateProfileId(data.publicProfileId);
    
    if (validationResult && !validationResult.isValid) {
      form.setError("publicProfileId", {
        type: "manual",
        message: validationResult.message || "Invalid profile ID"
      });
      return;
    }

    dispatch(updatePersonalDetails(data));
    onClose();
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      const currentInterests = form.getValues("interests") || [];
      form.setValue("interests", [...currentInterests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (index: number) => {
    const currentInterests = form.getValues("interests") || [];
    form.setValue(
      "interests",
      currentInterests.filter((_, i) => i !== index)
    );
  };

  const addBadge = () => {
    if (newBadge.trim()) {
      const currentBadges = form.getValues("professionalBadges") || [];
      form.setValue("professionalBadges", [...currentBadges, newBadge.trim()]);
      setNewBadge("");
    }
  };

  const removeBadge = (index: number) => {
    const currentBadges = form.getValues("professionalBadges") || [];
    form.setValue(
      "professionalBadges",
      currentBadges.filter((_, i) => i !== index)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personal Details</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                        />
                      </FormControl>
                      {!profile?.emailVerified && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEmailVerificationOpen(true)}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {profile?.emailVerified && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Email verified
                </div>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date of Birth and Gender */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth*</FormLabel>
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
                              format(field.value, "PPP")
                            ) : (
                              <span>DD/MM/YYYY</span>
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
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
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Professional Headline */}
            <FormField
              control={form.control}
              name="professionalHeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Headline</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of your professional role"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Public Profile ID */}
            <FormField
              control={form.control}
              name="publicProfileId"
              render={({ field }) => {
                const { validateProfileId, isValidating, validationResult } = useProfileIdValidation();
                
                React.useEffect(() => {
                  if (field.value) {
                    validateProfileId(field.value);
                  }
                }, [field.value, validateProfileId]);

                return (
                  <FormItem>
                    <FormLabel>Public Profile ID</FormLabel>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        careerbox.in/
                      </span>
                      <FormControl>
                        <div className="relative flex-1">
                          <Input
                            className="rounded-l-none pr-8"
                            placeholder="your-profile-id"
                            {...field}
                          />
                          {isValidating && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                    </div>
                    <div className="mt-1">
                      {validationResult && (
                        <p className={cn(
                          "text-xs",
                          validationResult.isValid ? "text-green-600" : "text-red-600"
                        )}>
                          {validationResult.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Choose a unique identifier for your public profile. Use only
                        letters, numbers, and underscores.
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* About Me */}
            <FormField
              control={form.control}
              name="aboutMe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Me</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a bit about yourself"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    Maximum 500 characters
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Professional Badges */}
            <div className="space-y-3">
              <FormLabel>Professional Badges</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a professional badge"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addBadge())
                  }
                />
                <Button type="button" onClick={addBadge} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch("professionalBadges")?.map((badge, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {badge}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeBadge(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <FormLabel>Interests</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an interest"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addInterest())
                  }
                />
                <Button type="button" onClick={addInterest} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch("interests")?.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {interest}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeInterest(index)}
                    />
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Display on Public Profile (visible to other users)
              </p>
            </div>

            {/* Skills and Languages */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.skills?.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name} - {skill.level}
                    </Badge>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSkillsDialogOpen(true)}
                >
                  Manage Skills
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.languages?.map((language) => (
                    <Badge key={language.id} variant="secondary">
                      {language.name} - {language.level}
                    </Badge>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLanguagesDialogOpen(true)}
                >
                  Manage Languages
                </Button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>

            {/* Skills Form Dialog */}
            <SkillsForm
              open={skillsDialogOpen}
              onClose={() => setSkillsDialogOpen(false)}
            />

            {/* Languages Form Dialog */}
            <LanguagesForm
              open={languagesDialogOpen}
              onClose={() => setLanguagesDialogOpen(false)}
            />

            {/* Email Verification Dialog */}
            <Dialog open={emailVerificationOpen} onOpenChange={setEmailVerificationOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verify Email Address</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    We'll send a verification code to your email address.
                  </p>
                </DialogHeader>
                <EmailVerification
                  email={form.getValues("email")}
                  onVerified={() => {
                    setEmailVerificationOpen(false);
                    // Refresh the profile data
                    // TODO: Add profile refresh logic
                  }}
                />
              </DialogContent>
            </Dialog>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
