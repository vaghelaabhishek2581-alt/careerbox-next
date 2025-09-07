"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { EducationSchema, type Education } from "@/lib/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InstituteSearch } from "@/components/ui/institute-search";
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
import { useToast } from "@/components/ui/use-toast";

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<Education>({
    resolver: zodResolver(EducationSchema),
    defaultValues: {
      degreeName: "",
      specialization: "",
      instituteName: "",
      state: "",
      city: "",
      passingYear: "",
      isCurrentlyStudying: false,
    },
  });

  const onSubmit = (data: Education) => {
    const newEducation = {
      ...data,
      id: crypto.randomUUID(),
    };

    // Collapse all other sections
    setExpandedId(null);

    onChange([...education, newEducation]);
    form.reset();

    toast({
      title: "Education Added",
      description: `${data.degreeName} at ${data.instituteName} has been added to your profile.`,
    });
  };

  const removeEducation = (id: string) => {
    onChange(education.filter((edu) => edu.id !== id));
    toast({
      title: "Education Removed",
      description: "The education entry has been removed from your profile.",
      variant: "destructive",
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleInstituteSelect = (institute: any, field: any) => {
    form.setValue("instituteName", institute.name);
    form.setValue("state", institute.state);
    form.setValue("city", institute.city);
    if (institute.examBoards?.length) {
      form.setValue("examBoard", institute.examBoards[0]);
    }
  };

  return (
    <div className="space-y-4">
      {education.map((edu) => (
        <Card key={edu.id} className="relative">
          <CardContent className="pt-6">
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleExpand(edu.id!)}
              >
                {expandedId === edu.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600"
                onClick={() => removeEducation(edu.id!)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="font-medium">{edu.degreeName}</h3>
              <span className="text-gray-500">in</span>
              <h4 className="font-medium">{edu.specialization}</h4>
            </div>

            {expandedId === edu.id && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {edu.instituteName}
                  </span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {edu.isCurrentlyStudying
                      ? "Currently Studying"
                      : edu.passingYear}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  {edu.city}, {edu.state}
                  {edu.examBoard && ` • ${edu.examBoard}`}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="degreeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree / Course Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="instituteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institute Name</FormLabel>
                    <FormControl>
                      <InstituteSearch
                        value={field.value}
                        onChange={field.onChange}
                        onSelect={(institute) =>
                          handleInstituteSelect(institute, field)
                        }
                        state={form.watch("state")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="examBoard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Board</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select board" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CBSE">CBSE</SelectItem>
                          <SelectItem value="ICSE">ICSE</SelectItem>
                          <SelectItem value="STATE">State Board</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="passingYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1900}
                          max={2100}
                          {...field}
                          disabled={form.watch("isCurrentlyStudying")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isCurrentlyStudying"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">
                        Currently studying here
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
