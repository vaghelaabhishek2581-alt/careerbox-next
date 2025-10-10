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
import { X, Plus } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/lib/redux/store'
import { createCourse } from '@/lib/redux/slices/courseSlice'
import { useRouter } from 'next/navigation'

const courseFormSchema = z.object({
  title: z.string().min(2, 'Course title must be at least 2 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().min(1, 'Please select a category'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().min(1, 'Duration must be at least 1 week'),
  fee: z.number().min(0, 'Fee must be non-negative'),
  currency: z.string().min(1, 'Currency is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  registrationDeadline: z.string().min(1, 'Registration deadline is required'),
  maxStudents: z.number().min(1, 'Maximum students must be at least 1'),
  prerequisites: z.array(z.string()),
  curriculum: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    duration: z.number(),
    lessons: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      duration: z.number(),
      type: z.enum(['video', 'text', 'quiz', 'assignment']),
    }))
  })),
  instructor: z.object({
    name: z.string().min(1, 'Instructor name is required'),
    bio: z.string().min(10, 'Instructor bio must be at least 10 characters'),
    qualifications: z.array(z.string()).min(1, 'At least one qualification is required'),
    experience: z.string().min(1, 'Experience is required'),
  }),
})

type CourseFormValues = z.infer<typeof courseFormSchema>

interface CourseCreationFormProps {
  onSuccess?: () => void;
}

const categories = [
  'Computer Science',
  'Business Administration',
  'Engineering',
  'Medicine',
  'Arts & Humanities',
  'Social Sciences',
  'Natural Sciences',
  'Mathematics',
  'Languages',
  'Design',
  'Marketing',
  'Finance',
  'Data Science',
  'Cybersecurity',
  'Other'
]

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
]

const lessonTypes = [
  { value: 'video', label: 'Video Lesson' },
  { value: 'text', label: 'Text Content' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' },
]

export default function CourseCreationForm({ onSuccess }: CourseCreationFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [prerequisiteInput, setPrerequisiteInput] = useState('')
  const [qualificationInput, setQualificationInput] = useState('')

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      level: 'beginner',
      duration: 4,
      fee: 0,
      currency: 'USD',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      maxStudents: 50,
      prerequisites: [],
      curriculum: [],
      instructor: {
        name: '',
        bio: '',
        qualifications: [],
        experience: '',
      },
    },
  })

  const addPrerequisite = () => {
    if (prerequisiteInput.trim()) {
      const currentPrerequisites = form.getValues('prerequisites')
      form.setValue('prerequisites', [...currentPrerequisites, prerequisiteInput.trim()])
      setPrerequisiteInput('')
    }
  }

  const removePrerequisite = (index: number) => {
    const currentPrerequisites = form.getValues('prerequisites')
    form.setValue('prerequisites', currentPrerequisites.filter((_, i) => i !== index))
  }

  const addQualification = () => {
    if (qualificationInput.trim()) {
      const currentQualifications = form.getValues('instructor.qualifications')
      form.setValue('instructor.qualifications', [...currentQualifications, qualificationInput.trim()])
      setQualificationInput('')
    }
  }

  const removeQualification = (index: number) => {
    const currentQualifications = form.getValues('instructor.qualifications')
    form.setValue('instructor.qualifications', currentQualifications.filter((_, i) => i !== index))
  }

  const addModule = () => {
    const currentCurriculum = form.getValues('curriculum')
    const newModule = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      duration: 0,
      lessons: []
    }
    form.setValue('curriculum', [...currentCurriculum, newModule])
  }

  const removeModule = (index: number) => {
    const currentCurriculum = form.getValues('curriculum')
    form.setValue('curriculum', currentCurriculum.filter((_, i) => i !== index))
  }

  const addLesson = (moduleIndex: number) => {
    const currentCurriculum = form.getValues('curriculum')
    const newLesson = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      duration: 0,
      type: 'video' as const
    }
    currentCurriculum[moduleIndex].lessons.push(newLesson)
    form.setValue('curriculum', [...currentCurriculum])
  }

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const currentCurriculum = form.getValues('curriculum')
    currentCurriculum[moduleIndex].lessons = currentCurriculum[moduleIndex].lessons.filter((_, i) => i !== lessonIndex)
    form.setValue('curriculum', [...currentCurriculum])
  }

  const onSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true)
    try {
      const courseData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        registrationDeadline: new Date(data.registrationDeadline).toISOString(),
      }
      await dispatch(createCourse(courseData)).unwrap()
      
      // Call onSuccess callback if provided, otherwise navigate to courses page
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/institute/courses')
      }
    } catch (error) {
      console.error('Failed to create course:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Course</CardTitle>
          <CardDescription>
            Design and publish a new course for students to enroll in.
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
                        <FormLabel>Course Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Introduction to Web Development" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
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
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (weeks) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="4"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
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
                      <FormLabel>Course Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of the course, learning objectives, and what students will achieve..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be the main content that students see when browsing courses.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Schedule & Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Schedule & Pricing</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="registrationDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Deadline *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Students *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50"
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
                    name="fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Fee *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="299"
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
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency *</FormLabel>
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

              {/* Prerequisites */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Prerequisites</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a prerequisite (e.g., Basic knowledge of HTML)"
                      value={prerequisiteInput}
                      onChange={(e) => setPrerequisiteInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                    />
                    <Button type="button" onClick={addPrerequisite}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch('prerequisites').map((prerequisite, index) => (
                      <Badge key={`prerequisite-${prerequisite}-${index}`} variant="secondary" className="flex items-center gap-1">
                        {prerequisite}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removePrerequisite(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructor Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Instructor Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="instructor.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructor Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instructor.experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience *</FormLabel>
                        <FormControl>
                          <Input placeholder="10+ years in web development" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="instructor.bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor Bio *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief biography of the instructor, their background, and expertise..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qualifications *</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a qualification (e.g., PhD in Computer Science)"
                      value={qualificationInput}
                      onChange={(e) => setQualificationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                    />
                    <Button type="button" onClick={addQualification}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch('instructor.qualifications').map((qualification, index) => (
                      <Badge key={`qualification-${qualification}-${index}`} variant="secondary" className="flex items-center gap-1">
                        {qualification}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeQualification(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Curriculum */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Course Curriculum</h3>
                  <Button type="button" onClick={addModule} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                  </Button>
                </div>
                <div className="space-y-4">
                  {form.watch('curriculum').map((module, moduleIndex) => (
                    <Card key={module.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Module {moduleIndex + 1}</CardTitle>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeModule(moduleIndex)}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`curriculum.${moduleIndex}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Module Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Module title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`curriculum.${moduleIndex}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration (hours)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="2"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`curriculum.${moduleIndex}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Module Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe what this module covers..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Lessons</label>
                            <Button
                              type="button"
                              onClick={() => addLesson(moduleIndex)}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Lesson
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="flex items-center gap-2 p-2 border rounded">
                                <Input
                                  placeholder="Lesson title"
                                  value={lesson.title}
                                  onChange={(e) => {
                                    const currentCurriculum = form.getValues('curriculum')
                                    currentCurriculum[moduleIndex].lessons[lessonIndex].title = e.target.value
                                    form.setValue('curriculum', [...currentCurriculum])
                                  }}
                                />
                                <Input
                                  type="number"
                                  placeholder="Duration (min)"
                                  value={lesson.duration}
                                  onChange={(e) => {
                                    const currentCurriculum = form.getValues('curriculum')
                                    currentCurriculum[moduleIndex].lessons[lessonIndex].duration = parseInt(e.target.value) || 0
                                    form.setValue('curriculum', [...currentCurriculum])
                                  }}
                                  className="w-24"
                                />
                                <Select
                                  value={lesson.type}
                                  onValueChange={(value) => {
                                    const currentCurriculum = form.getValues('curriculum')
                                    currentCurriculum[moduleIndex].lessons[lessonIndex].type = value as any
                                    form.setValue('curriculum', [...currentCurriculum])
                                  }}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {lessonTypes.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Course'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
