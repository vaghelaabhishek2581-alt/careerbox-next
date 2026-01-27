// components/forms/PersonalDetailsForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, X, Loader2, CheckCircle } from "lucide-react";
import { useProfileIdSocketValidation } from "@/hooks/use-profile-id-socket-validation";
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
import { ImprovedDatePicker } from "@/components/ui/improved-date-picker";
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
import { useToast } from "@/components/ui/use-toast";
import { updatePersonalDetails } from "@/lib/redux/slices/profileSlice";
import { SkillsForm } from "../../forms/SkillsForm";
import { LanguagesForm } from "../../forms/LanguagesForm";
import { EmailVerification } from "@/components/email-verification";
import { PersonalDetailsPreview } from "./PersonalDetailsPreview";

const personalDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.date().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  professionalHeadline: z.string().min(1, "Professional headline is required"),
  publicProfileId: z.string().min(1, "Public profile ID is required"),
  aboutMe: z.string().max(2000, "About me must be less than 2000 characters"),
  interests: z.array(z.string()).optional(),
  professionalBadges: z.array(z.string()).optional(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
});

type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

interface PersonalDetailsFormProps {
  isEditing: boolean;
  onClose: () => void;
  variant?: "modal" | "full-screen";
  profile?: any;
}

export const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  isEditing,
  onClose,
  variant = "modal",
  profile: externalProfile,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const profile = useAppSelector((state) => state.profile.profile);

  // Get email from populated user data
  const userEmail = typeof profile?.userId === 'object' ? profile.userId.email : '';
  const emailVerified = typeof profile?.userId === 'object' ? profile.userId.emailVerified : false;
  const [newInterest, setNewInterest] = React.useState("");
  const [newBadge, setNewBadge] = React.useState("");
  const [skillsDialogOpen, setSkillsDialogOpen] = React.useState(false);
  const [languagesDialogOpen, setLanguagesDialogOpen] = React.useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = React.useState(false);

  // Profile ID validation hook - called at top level (with socket support)
  const {
    validateProfileId,
    validateNow,
    isValidating,
    validationResult,
    isSocketConnected,
    subscribeToProfileId,
    unsubscribeFromProfileId
  } = useProfileIdSocketValidation();

  const form = useForm<PersonalDetailsFormData>({
    context: { mode: "onChange" },
    mode: "onChange",
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: profile?.personalDetails ? {
      email: userEmail, // Email from User table
      firstName: profile.personalDetails.firstName || "",
      middleName: profile.personalDetails.middleName || "",
      lastName: profile.personalDetails.lastName || "",
      dateOfBirth: profile.personalDetails.dateOfBirth ? new Date(profile.personalDetails.dateOfBirth) : null,
      gender: profile.personalDetails.gender || "PREFER_NOT_TO_SAY",
      professionalHeadline: profile.personalDetails.professionalHeadline || "",
      publicProfileId: profile.personalDetails.publicProfileId || "",
      aboutMe: profile.personalDetails.aboutMe || "",
      interests: profile.personalDetails.interests || [],
      professionalBadges: profile.personalDetails.professionalBadges || [],
      phone: profile.personalDetails.phone || "",
      nationality: profile.personalDetails.nationality || "",
    } : {
      email: userEmail,
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: null,
      gender: "PREFER_NOT_TO_SAY",
      professionalHeadline: "",
      publicProfileId: "",
      aboutMe: "",
      interests: [],
      professionalBadges: [],
      phone: "",
      nationality: "",
    },
  });

  const watchedData = form.watch();
  const publicProfileId = form.watch("publicProfileId");

  // Keep track of initial publicProfileId to avoid validating on initial load
  const initialPublicProfileIdRef = React.useRef<string>(profile?.personalDetails?.publicProfileId || '');

  // Validate only when editing, value changed, and field is dirty
  React.useEffect(() => {
    const val = publicProfileId;
    const hasChanged = val !== initialPublicProfileIdRef.current;
    const isDirty = !!(form.formState?.dirtyFields as any)?.publicProfileId;

    if (!isEditing) return; // only validate in edit mode
    if (!val || val.length < 3) return; // minimal length
    if (!hasChanged) return; // don't validate initial value
    if (!isDirty) return; // validate only after user changes

    validateProfileId(val);
    subscribeToProfileId(val);

    return () => {
      unsubscribeFromProfileId(val);
    };
  }, [isEditing, publicProfileId, validateProfileId, subscribeToProfileId, unsubscribeFromProfileId, form.formState?.dirtyFields]);

  // Cleanup form state on unmount
  React.useEffect(() => {
    return () => {
      form.reset();
      setNewInterest("");
      setNewBadge("");
      setSkillsDialogOpen(false);
      setLanguagesDialogOpen(false);
    };
  }, []);

  const onSubmit = async (data: PersonalDetailsFormData): Promise<void> => {
    try {
      // Validate profile ID if provided and different from current
      if (data.publicProfileId && data.publicProfileId !== profile?.personalDetails?.publicProfileId) {
        const result = await validateProfileId(data.publicProfileId);

        if (result && !result.isValid && !result.isOwnProfile) {
          form.setError("publicProfileId", {
            type: "manual",
            message: result.message || "Invalid profile ID"
          });
          return;
        }
      }

      // Convert form data to match API format (exclude email as it's in User table)
      const personalDetailsData = {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : undefined,
        gender: data.gender,
        professionalHeadline: data.professionalHeadline,
        publicProfileId: data.publicProfileId,
        aboutMe: data.aboutMe,
        interests: data.interests,
        professionalBadges: data.professionalBadges,
        phone: data.phone,
        nationality: data.nationality,
      };

      console.log('Submitting personal details:', personalDetailsData);
      await dispatch(updatePersonalDetails(personalDetailsData)).unwrap();
      // Toast is now handled by the thunk

      onClose();
    } catch (error) {
      console.error('Failed to update personal details:', error);
      // Error toast is now handled by the thunk
    }
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


  const content = (
    <div className="flex h-full min-h-[90vh] pb-44">
      {/* Left side - Form */}
      <div className="flex-1 lg:w-1/2 p-6 overflow-y-auto border-r border-gray-200">
        <Form {...form}>
          <form id="personal-details-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      {!emailVerified && (
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
              {emailVerified && (
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
              {/* Date of Birth using Improved Date Picker */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <ImprovedDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="DD/MM/YYYY - Enter your birth date"
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Gender Select */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                          <SelectItem value="PREFER_NOT_TO_SAY">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
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

            {/* Phone and Nationality */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter nationality"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Public Profile ID */}
            <FormField
              control={form.control}
              name="publicProfileId"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Public Profile ID
                      {isSocketConnected && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Real-time
                        </span>
                      )}
                    </FormLabel>
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
                            onBlur={() => {
                              const val = form.getValues("publicProfileId");
                              const hasChanged = val !== initialPublicProfileIdRef.current;
                              if (isEditing && val && val.length >= 3 && hasChanged) {
                                // Immediate validation on blur
                                validateNow(val);
                              }
                            }}
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
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-xs",
                            validationResult.isValid
                              ? validationResult.isOwnProfile
                                ? "text-blue-600"
                                : "text-green-600"
                              : "text-red-600"
                          )}>
                            {validationResult.message}
                          </p>
                          {isSocketConnected && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              ⚡ Live
                            </span>
                          )}
                          {validationResult.isOwnProfile && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              👤 Your ID
                            </span>
                          )}
                        </div>
                      )}

                      {/* Show suggestions if profile ID is not available */}
                      {validationResult && !validationResult.isValid && validationResult.suggestions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">Suggestions:</p>
                          <div className="flex flex-wrap gap-1">
                            {validationResult.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  field.onChange(suggestion);
                                  validateProfileId(suggestion);
                                }}
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          Choose a unique identifier for your public profile. Use only
                          letters, numbers, and underscores.
                        </p>
                        {!isSocketConnected && (
                          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                            API mode
                          </span>
                        )}
                      </div>
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
                    key={`badge-${badge}-${index}`}
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
                    key={`interest-${interest}-${index}`}
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
            {/* <div className="flex justify-end gap-2 pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div> */}

            {/* Dialog components moved outside the main form to avoid nested forms */}


            {/* Form actions - only show in modal mode */}
            {variant === 'modal' && (
              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
        {/* Skills Form Dialog (outside main form to prevent nested forms) */}
        <SkillsForm
          isEditing={skillsDialogOpen}
          onClose={() => setSkillsDialogOpen(false)}
        />

        {/* Languages Form Dialog (outside main form to prevent nested forms) */}
        <LanguagesForm
          isEditing={languagesDialogOpen}
          onClose={() => setLanguagesDialogOpen(false)}
        />
      </div>

      {/* Right side - Preview (hidden on smaller screens) */}
      <div className="hidden lg:block lg:w-1/2">
        <PersonalDetailsPreview
          data={watchedData}
          emailVerified={emailVerified}
        />
      </div>
    </div>
  );

  if (!isEditing) return null;

  if (variant === 'full-screen') {
    return (
      <>
        <div className={isEditing ? 'fixed inset-0 z-40' : 'hidden'}>
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Edit Personal Details"
            className="fixed inset-0 z-50 mt-[18vh] rounded-t-2xl bg-background overflow-hidden"
          >
            <header className="flex items-center justify-between px-6 py-4 border-b">
              <h1 className="text-lg font-semibold">Personal Details</h1>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  form="personal-details-form"
                  disabled={form.formState.isSubmitting}
                  className="h-8 px-3 text-sm"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </header>
            <main className="h-[calc(100%-4rem)]">{content}</main>
          </section>
        </div>

        {emailVerificationOpen && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Verify Email Address</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEmailVerificationOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                We'll send a verification code to your email address.
              </p>
              <EmailVerification
                email={form.getValues("email")}
                onVerified={() => {
                  setEmailVerificationOpen(false);
                  // Refresh the profile data
                  // TODO: Add profile refresh logic
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Personal Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {content}
        </div>
      </div>

      {emailVerificationOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Verify Email Address</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEmailVerificationOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              We'll send a verification code to your email address.
            </p>
            <EmailVerification
              email={form.getValues("email")}
              onVerified={() => {
                setEmailVerificationOpen(false);
                // Refresh the profile data
                // TODO: Add profile refresh logic
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
