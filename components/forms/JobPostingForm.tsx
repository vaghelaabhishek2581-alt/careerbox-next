import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/lib/redux/store'
import { createJob } from '@/lib/redux/slices/jobSlice'
import { useRouter } from 'next/navigation'

const jobFormSchema = z.object({
  title: z.string().min(2, 'Job title must be at least 2 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is required'),
  responsibilities: z.array(z.string()).min(1, 'At least one responsibility is required'),
  location: z.string().min(1, 'Location is required'),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  salaryRange: z.object({
    min: z.number().min(0, 'Minimum salary must be positive'),
    max: z.number().min(0, 'Maximum salary must be positive'),
    currency: z.string().min(1, 'Currency is required'),
  }),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experience: z.object({
    min: z.number().min(0, 'Minimum experience must be non-negative'),
    max: z.number().min(0, 'Maximum experience must be non-negative'),
  }),
  applicationDeadline: z.string().min(1, 'Application deadline is required'),
})

type JobFormValues = z.infer<typeof jobFormSchema>

const employmentTypes = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
]

export default function JobPostingForm() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requirementInput, setRequirementInput] = useState('')
  const [responsibilityInput, setResponsibilityInput] = useState('')
  const [skillInput, setSkillInput] = useState('')

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: [],
      responsibilities: [],
      location: '',
      employmentType: 'full-time',
      salaryRange: {
        min: 0,
        max: 0,
        currency: 'USD',
      },
      skills: [],
      experience: {
        min: 0,
        max: 10,
      },
      applicationDeadline: '',
    },
  })

  const addRequirement = () => {
    if (requirementInput.trim()) {
      const currentRequirements = form.getValues('requirements')
      form.setValue('requirements', [...currentRequirements, requirementInput.trim()])
      setRequirementInput('')
    }
  }

  const removeRequirement = (index: number) => {
    const currentRequirements = form.getValues('requirements')
    form.setValue('requirements', currentRequirements.filter((_, i) => i !== index))
  }

  const addResponsibility = () => {
    if (responsibilityInput.trim()) {
      const currentResponsibilities = form.getValues('responsibilities')
      form.setValue('responsibilities', [...currentResponsibilities, responsibilityInput.trim()])
      setResponsibilityInput('')
    }
  }

  const removeResponsibility = (index: number) => {
    const currentResponsibilities = form.getValues('responsibilities')
    form.setValue('responsibilities', currentResponsibilities.filter((_, i) => i !== index))
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = form.getValues('skills')
      form.setValue('skills', [...currentSkills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (index: number) => {
    const currentSkills = form.getValues('skills')
    form.setValue('skills', currentSkills.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: JobFormValues) => {
    setIsSubmitting(true)
    try {
      const jobData = {
        ...data,
        applicationDeadline: new Date(data.applicationDeadline).toISOString(),
      }
      await dispatch(createJob(jobData)).unwrap()
      router.push('/dashboard/business/jobs')
    } catch (error) {
      console.error('Failed to create job:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Job Posting</CardTitle>
          <CardDescription>
            Post a new job opportunity to attract qualified candidates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Senior Software Engineer" {...field} />
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
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., New York, NY or Remote" {...field} />
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
                        <FormLabel>Employment Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employmentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                    name="applicationDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Deadline *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of the role, company culture, and what makes this opportunity unique..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be the main content that candidates see. Be specific about the role and company.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a requirement (e.g., Bachelor's degree in Computer Science)"
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    />
                    <Button type="button" onClick={addRequirement}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch('requirements').map((requirement, index) => (
                      <Badge key={`requirement-${requirement}-${index}`} variant="secondary" className="flex items-center gap-1">
                        {requirement}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeRequirement(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="requirements"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Responsibilities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Responsibilities</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a responsibility (e.g., Develop and maintain web applications)"
                      value={responsibilityInput}
                      onChange={(e) => setResponsibilityInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                    />
                    <Button type="button" onClick={addResponsibility}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch('responsibilities').map((responsibility, index) => (
                      <Badge key={`responsibility-${responsibility}-${index}`} variant="secondary" className="flex items-center gap-1">
                        {responsibility}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeResponsibility(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="responsibilities"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Required Skills</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill (e.g., React, Python, AWS)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch('skills').map((skill, index) => (
                      <Badge key={`skill-${skill}-${index}`} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeSkill(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="skills"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Experience & Salary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Experience & Compensation</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Experience Required</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="experience.min"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum (years)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="experience.max"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum (years)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="10"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Salary Range</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="salaryRange.min"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="50000"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="salaryRange.max"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="80000"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="salaryRange.currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem key={currency.value} value={currency.value}>
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Job Posting'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
