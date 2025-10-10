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
import { X, Plus, Trash2 } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/lib/redux/store'
import { createExam } from '@/lib/redux/slices/examSlice'
import { useRouter } from 'next/navigation'

const examFormSchema = z.object({
  title: z.string().min(2, 'Exam title must be at least 2 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  type: z.enum(['admission', 'recruitment', 'certification']),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  passingMarks: z.number().min(0, 'Passing marks must be non-negative'),
  instructions: z.array(z.string()).min(1, 'At least one instruction is required'),
  eligibilityCriteria: z.array(z.string()).min(1, 'At least one eligibility criteria is required'),
  examDate: z.string().min(1, 'Exam date is required'),
  registrationDeadline: z.string().min(1, 'Registration deadline is required'),
  fee: z.number().min(0, 'Fee must be non-negative'),
  questions: z.array(z.object({
    id: z.string(),
    type: z.enum(['multiple-choice', 'true-false', 'short-answer', 'essay']),
    question: z.string().min(1, 'Question is required'),
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.number()]).optional(),
    marks: z.number().min(1, 'Marks must be at least 1'),
  })).min(1, 'At least one question is required'),
})

type ExamFormValues = z.infer<typeof examFormSchema>

const examTypes = [
  { value: 'admission', label: 'Admission Exam' },
  { value: 'recruitment', label: 'Recruitment Exam' },
  { value: 'certification', label: 'Certification Exam' },
]

const questionTypes = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'true-false', label: 'True/False' },
  { value: 'short-answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
]

export default function ExamCreationForm() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [instructionInput, setInstructionInput] = useState('')
  const [criteriaInput, setCriteriaInput] = useState('')

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'admission',
      duration: 60,
      totalMarks: 100,
      passingMarks: 50,
      instructions: [],
      eligibilityCriteria: [],
      examDate: '',
      registrationDeadline: '',
      fee: 0,
      questions: [],
    },
  })

  const addInstruction = () => {
    if (instructionInput.trim()) {
      const currentInstructions = form.getValues('instructions')
      form.setValue('instructions', [...currentInstructions, instructionInput.trim()])
      setInstructionInput('')
    }
  }

  const removeInstruction = (index: number) => {
    const currentInstructions = form.getValues('instructions')
    form.setValue('instructions', currentInstructions.filter((_, i) => i !== index))
  }

  const addCriteria = () => {
    if (criteriaInput.trim()) {
      const currentCriteria = form.getValues('eligibilityCriteria')
      form.setValue('eligibilityCriteria', [...currentCriteria, criteriaInput.trim()])
      setCriteriaInput('')
    }
  }

  const removeCriteria = (index: number) => {
    const currentCriteria = form.getValues('eligibilityCriteria')
    form.setValue('eligibilityCriteria', currentCriteria.filter((_, i) => i !== index))
  }

  const addQuestion = () => {
    const currentQuestions = form.getValues('questions')
    const newQuestion = {
      id: crypto.randomUUID(),
      type: 'multiple-choice' as const,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
    }
    form.setValue('questions', [...currentQuestions, newQuestion])
  }

  const removeQuestion = (index: number) => {
    const currentQuestions = form.getValues('questions')
    form.setValue('questions', currentQuestions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const currentQuestions = form.getValues('questions')
    currentQuestions[index] = { ...currentQuestions[index], [field]: value }
    form.setValue('questions', [...currentQuestions])
  }

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const currentQuestions = form.getValues('questions')
    if (currentQuestions[questionIndex].options) {
      currentQuestions[questionIndex].options![optionIndex] = value
      form.setValue('questions', [...currentQuestions])
    }
  }

  const onSubmit = async (data: ExamFormValues) => {
    setIsSubmitting(true)
    try {
      const examData = {
        ...data,
        examDate: new Date(data.examDate),
        registrationDeadline: new Date(data.registrationDeadline),
      }
      await dispatch(createExam(examData)).unwrap()
      router.push('/dashboard/institute/exams')
    } catch (error) {
      console.error('Failed to create exam:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Exam</CardTitle>
          <CardDescription>
            Design and publish a new exam for students to take.
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
                        <FormLabel>Exam Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Computer Science Admission Test" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select exam type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {examTypes.map((type) => (
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
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="60"
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
                        <FormLabel>Registration Fee (USD) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="25"
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
                      <FormLabel>Exam Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of the exam, topics covered, and what students can expect..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be visible to students when they register for the exam.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Schedule</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="examDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Date *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
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
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Scoring */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Scoring</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="totalMarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Marks *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
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
                    name="passingMarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Marks *</FormLabel>
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
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Exam Instructions</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an instruction (e.g., Read all questions carefully before answering)"
                      value={instructionInput}
                      onChange={(e) => setInstructionInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInstruction())}
                    />
                    <Button type="button" onClick={addInstruction}>
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {form.watch('instructions').map((instruction, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm">{instruction}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInstruction(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="instructions"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Eligibility Criteria */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Eligibility Criteria</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add eligibility criteria (e.g., Must have completed high school)"
                      value={criteriaInput}
                      onChange={(e) => setCriteriaInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCriteria())}
                    />
                    <Button type="button" onClick={addCriteria}>
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {form.watch('eligibilityCriteria').map((criteria, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm">{criteria}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCriteria(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="eligibilityCriteria"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Exam Questions</h3>
                  <Button type="button" onClick={addQuestion} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
                <div className="space-y-4">
                  {form.watch('questions').map((question, index) => (
                    <Card key={question.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Question {index + 1}</CardTitle>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`questions.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Question Type</FormLabel>
                                <Select
                                  value={question.type}
                                  onValueChange={(value) => updateQuestion(index, 'type', value)}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {questionTypes.map((type) => (
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
                            name={`questions.${index}.marks`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Marks</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="1"
                                    value={question.marks}
                                    onChange={(e) => updateQuestion(index, 'marks', parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`questions.${index}.question`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter the question..."
                                  value={question.question}
                                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {(question.type === 'multiple-choice' || question.type === 'true-false') && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Options</label>
                            {question.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <Input
                                  placeholder={`Option ${optionIndex + 1}`}
                                  value={option}
                                  onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value)}
                                />
                                {optionIndex === 0 && question.type === 'true-false' && (
                                  <span className="text-xs text-muted-foreground">True</span>
                                )}
                                {optionIndex === 1 && question.type === 'true-false' && (
                                  <span className="text-xs text-muted-foreground">False</span>
                                )}
                              </div>
                            ))}
                            <FormField
                              control={form.control}
                              name={`questions.${index}.correctAnswer`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Correct Answer</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={question.type === 'multiple-choice' ? 'Enter correct option' : 'Enter correct answer'}
                                      value={question.correctAnswer || ''}
                                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        {(question.type === 'short-answer' || question.type === 'essay') && (
                          <FormField
                            control={form.control}
                            name={`questions.${index}.correctAnswer`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sample Answer (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Provide a sample answer or key points..."
                                    value={question.correctAnswer || ''}
                                    onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <FormField
                  control={form.control}
                  name="questions"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Exam'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
