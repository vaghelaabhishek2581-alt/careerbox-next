"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  PersonalDetailsSchema,
  type PersonalDetails,
} from "@/lib/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { validationSocket } from "@/lib/socket/validation-socket";
import { Loader2 } from "lucide-react";

interface PersonalDetailsFormProps {
  initialData?: PersonalDetails;
  onSubmit: (data: PersonalDetails) => void;
}

export function PersonalDetailsForm({
  initialData,
  onSubmit,
}: PersonalDetailsFormProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isPublicIdAvailable, setIsPublicIdAvailable] = useState<
    boolean | null
  >(null);
  const { toast } = useToast();

  const form = useForm<PersonalDetails>({
    resolver: zodResolver(PersonalDetailsSchema),
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "PREFER_NOT_TO_SAY",
      publicProfileId: "",
    },
  });

  const debouncedPublicId = useDebounce(form.watch("publicProfileId"), 500);

  useEffect(() => {
    if (!debouncedPublicId || debouncedPublicId.length < 3) {
      setIsPublicIdAvailable(null);
      return;
    }

    const validatePublicId = async () => {
      setIsValidating(true);
      try {
        const isAvailable = await validationSocket.validatePublicId(
          debouncedPublicId
        );
        setIsPublicIdAvailable(isAvailable);

        if (!isAvailable) {
          form.setError("publicProfileId", {
            type: "manual",
            message: "This profile ID is already taken",
          });
        } else {
          form.clearErrors("publicProfileId");
        }
      } catch (error) {
        console.error("Error validating public ID:", error);
      } finally {
        setIsValidating(false);
      }
    };

    validatePublicId();
  }, [debouncedPublicId, form]);

  const handleSubmit = async (data: PersonalDetails) => {
    if (!isPublicIdAvailable) {
      toast({
        title: "Invalid Public Profile ID",
        description: "Please choose a different profile ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit(data);
      toast({
        title: "Profile Updated",
        description: "Your personal details have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                        <SelectItem value="PREFER_NOT_TO_SAY">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="professionalHeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Headline</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Full Stack Developer | React Expert"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publicProfileId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Public Profile ID
                    {isValidating && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    )}
                    {!isValidating && isPublicIdAvailable === true && (
                      <span className="text-xs text-green-600">Available!</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="your-unique-id" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isValidating || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Details"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
