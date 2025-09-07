"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { WorkExperienceSchema, type WorkExperience } from "@/lib/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanySearch } from "@/components/ui/company-search";
import { TagInput } from "@/components/ui/tag-input";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface WorkExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}

export function WorkExperienceForm({
  experiences,
  onChange,
}: WorkExperienceFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const form = useForm<WorkExperience>({
    resolver: zodResolver(WorkExperienceSchema),
    defaultValues: {
      companyName: "",
      jobDesignation: "",
      employmentType: "FULL_TIME",
      startDate: "",
      isCurrentJob: false,
      skills: [],
    },
  });

  const onSubmit = (data: WorkExperience) => {
    const newExperience = {
      ...data,
      id: crypto.randomUUID(),
    };
    onChange([...experiences, newExperience]);
    form.reset();
  };

  const removeExperience = (id: string) => {
    onChange(experiences.filter((exp) => exp.id !== id));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {experiences.map((experience) => (
        <Card key={experience.id} className="relative">
          <CardContent className="pt-6">
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleExpand(experience.id!)}
              >
                {expandedId === experience.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600"
                onClick={() => removeExperience(experience.id!)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="font-medium">{experience.jobDesignation}</h3>
              <span className="text-gray-500">at</span>
              <h4 className="font-medium">{experience.companyName}</h4>
            </div>

            {expandedId === experience.id && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {experience.startDate} -{" "}
                    {experience.isCurrentJob ? "Present" : experience.endDate}
                  </span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {experience.employmentType.replace("_", " ")}
                  </span>
                </div>

                {experience.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {experience.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-sm bg-gray-100 text-gray-800 px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {experience.description && (
                  <p className="text-sm text-gray-600">
                    {experience.description}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <CompanySearch
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobDesignation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Designation</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employmentType"
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="month" {...field} />
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
                        <Input
                          type="month"
                          {...field}
                          disabled={form.watch("isCurrentJob")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isCurrentJob"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      I currently work here
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills Used</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add skills..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Describe your role and achievements..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
