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
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/lib/redux/store'
import { createInstitute } from '@/lib/redux/slices/instituteSlice'
import { useRouter } from 'next/navigation'

const instituteFormSchema = z.object({
  instituteName: z.string().min(2, 'Institute name must be at least 2 characters'),
  type: z.string().min(1, 'Please select institute type'),
  accreditation: z.array(z.string()).min(1, 'At least one accreditation is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
  }),
  contactInfo: z.object({
    email: z.string().email('Please enter a valid email'),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    linkedin: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
    twitter: z.string().url('Please enter a valid Twitter URL').optional().or(z.literal('')),
  }),
  socialMedia: z.object({
    linkedin: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
    twitter: z.string().url('Please enter a valid Twitter URL').optional().or(z.literal('')),
    facebook: z.string().url('Please enter a valid Facebook URL').optional().or(z.literal('')),
    instagram: z.string().url('Please enter a valid Instagram URL').optional().or(z.literal('')),
  }),
  establishedYear: z.string().optional(),
  studentCount: z.string().optional(),
  facultyCount: z.string().optional(),
})

type InstituteFormValues = z.infer<typeof instituteFormSchema>

const instituteTypes = [
  'University',
  'College',
  'Technical Institute',
  'Vocational School',
  'Community College',
  'Online University',
  'Research Institute',
  'Training Center',
  'Academy',
  'School',
  'Other'
]

const accreditations = [
  'AACSB',
  'ACBSP',
  'IACBE',
  'ABET',
  'AACSB International',
  'EQUIS',
  'AMBA',
  'NAAC',
  'NBA',
  'AICTE',
  'UGC',
  'Other'
]

export default function InstituteProfileForm() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accreditationInput, setAccreditationInput] = useState('')

  const form = useForm<InstituteFormValues>({
    resolver: zodResolver(instituteFormSchema),
    defaultValues: {
      instituteName: '',
      type: '',
      accreditation: [],
      website: '',
      description: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      },
      contactInfo: {
        email: '',
        phone: '',
        linkedin: '',
        twitter: '',
      },
      socialMedia: {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: '',
      },
      establishedYear: '',
      studentCount: '',
      facultyCount: '',
    },
  })

  const addAccreditation = () => {
    if (accreditationInput.trim()) {
      const currentAccreditations = form.getValues('accreditation')
      form.setValue('accreditation', [...currentAccreditations, accreditationInput.trim()])
      setAccreditationInput('')
    }
  }

  const removeAccreditation = (index: number) => {
    const currentAccreditations = form.getValues('accreditation')
    form.setValue('accreditation', currentAccreditations.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: InstituteFormValues) => {
    setIsSubmitting(true)
    try {
      const instituteData = {
        ...data,
        establishedYear: data.establishedYear ? Number(data.establishedYear) : undefined,
        studentCount: data.studentCount ? Number(data.studentCount) : undefined,
        facultyCount: data.facultyCount ? Number(data.facultyCount) : undefined,
      }
      await dispatch(createInstitute(instituteData)).unwrap()
      router.push('/dashboard/institute')
    } catch (error) {
      console.error('Failed to create institute profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Institute Profile</CardTitle>
          <CardDescription>
            Set up your institute profile to start offering courses and managing admissions.
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
                    name="instituteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institute Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter institute name" {...field} />
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
                        <FormLabel>Institute Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select institute type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {instituteTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
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
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.edu" {...field} />
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
                      <FormLabel>Institute Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your institute, its mission, programs, and what makes it unique..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be visible to students and potential applicants.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Accreditation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Accreditation</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add accreditation (e.g., AACSB, ABET)"
                      value={accreditationInput}
                      onChange={(e) => setAccreditationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAccreditation())}
                    />
                    <Button type="button" onClick={addAccreditation}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch('accreditation').map((accreditation, index) => (
                      <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                        {accreditation}
                        <button
                          type="button"
                          onClick={() => removeAccreditation(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="accreditation"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Education Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="Boston" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input placeholder="MA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="02101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactInfo.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="admissions@institute.edu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactInfo.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media (Optional)</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="socialMedia.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/school/yourinstitute" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialMedia.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/yourinstitute" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialMedia.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/yourinstitute" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialMedia.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/yourinstitute" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information (Optional)</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="establishedYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Established Year</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1850" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="studentCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Count</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="facultyCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faculty Count</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Institute Profile'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
