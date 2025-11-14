import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { createCourse, updateCourse } from "@/lib/redux/slices/courseSlice";
import {
    CourseFormProps,
    CourseFormData,
    courseFormSchema,
    courseTypes,
    modeOfStudyOptions,
    feesFrequencyOptions,
    commonExams,
    engineeringSpecializations,
    getDefaultCourseValues
} from "./types";

export const CourseForm: React.FC<CourseFormProps> = ({
    open,
    onClose,
    course,
    onSuccess,
    variant = 'full-screen',
}) => {
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const { selectedInstitute } = useAppSelector((state) => state.institute);
    const isEditing = !!course;

    // Lock body scroll when full-screen variant is open
    React.useEffect(() => {
        if (variant === 'full-screen' && open) {
            const previous = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = previous;
            };
        }
    }, [variant, open]);

    const form = useForm<CourseFormData>({
        resolver: zodResolver(courseFormSchema),
        defaultValues: getDefaultCourseValues(course),
        mode: 'onSubmit',
    });

    const onSubmit = async (data: CourseFormData) => {
        try {
            // Check if institute is selected
            if (!selectedInstitute?._id) {
                toast({
                    title: "Error",
                    description: "Please select an institute first",
                    variant: "destructive",
                });
                return;
            }

            // Prepare course data with instituteId
            const courseData = {
                ...data,
                instituteId: selectedInstitute._id,
            };

            console.log('Submitting course data:', courseData);

            if (isEditing) {
                const result = await dispatch(updateCourse({
                    courseId: course._id,
                    courseData: courseData
                })).unwrap();

                toast({
                    title: "Success",
                    description: "Course updated successfully",
                });

                onSuccess?.(result);
            } else {
                const result = await dispatch(createCourse(courseData)).unwrap();

                toast({
                    title: "Success",
                    description: "Course created successfully",
                });

                onSuccess?.(result);
            }

            onClose();
            form.reset();
        } catch (error: any) {
            console.error('Course submission error:', error);
            toast({
                title: "Error",
                description: error.message || `Failed to ${isEditing ? 'update' : 'create'} course`,
                variant: "destructive",
            });
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const content = (
        <div className="flex h-full min-h-[90vh]">
            <div className="flex-1 overflow-y-auto">
                <Form {...form}>
                    <form id="course-form" onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">

                        {/* Course Information - Responsive 4-3-2-1 column layout */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Course Information</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2 lg:col-span-2 xl:col-span-3">
                                            <FormLabel>Course Title *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter course title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="courseType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course Type *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {courseTypes.map((type) => (
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
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter course description"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Course Details - Responsive 4-3-2-1 column layout */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Course Details</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (years) *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="3"
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
                                    name="modeOfStudy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mode *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {modeOfStudyOptions.map((mode) => (
                                                        <SelectItem key={mode.value} value={mode.value}>
                                                            {mode.label}
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
                                    name="fee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fee (₹) *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="50000"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="feesFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Frequency</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {feesFrequencyOptions.map((frequency) => (
                                                        <SelectItem key={frequency} value={frequency}>
                                                            {frequency}
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

                        {/* Capacity & Placement - Responsive 4-3-2-1 column layout */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Capacity & Placement</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name="totalSeats"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Seats</FormLabel>
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
                                    name="managementQuota"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Management Quota</FormLabel>
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

                                <FormField
                                    control={form.control}
                                    name="highestPackageAmount"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                                            <FormLabel>Highest Package (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="1200000"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Specializations & Streams - Responsive 4-3-2-1 column layout */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Specializations & Streams</h3>
                            <p className="text-sm text-gray-600">Add multiple entries on separate lines</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name="specializations"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-1 lg:col-span-2 xl:col-span-2">
                                            <FormLabel>Specializations</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Civil Engineering&#10;Mechanical Engineering&#10;Computer Science"
                                                    rows={4}
                                                    {...field}
                                                    value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                                    onChange={(e) => field.onChange(e.target.value.split('\n').filter(item => item.trim()))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="applicableStreams"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-1 lg:col-span-1 xl:col-span-2">
                                            <FormLabel>Applicable Streams</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Science&#10;Commerce&#10;Arts"
                                                    rows={4}
                                                    {...field}
                                                    value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                                    onChange={(e) => field.onChange(e.target.value.split('\n').filter(item => item.trim()))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Exams & Eligibility - Responsive 4-3-2-1 column layout */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Exams & Eligibility</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {/* Exams Accepted */}
                                <FormField
                                    control={form.control}
                                    name="examsAccepted"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-1 lg:col-span-2 xl:col-span-2">
                                            <FormLabel>Exams Accepted</FormLabel>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 gap-2">
                                                    {commonExams.slice(0, 6).map((exam) => (
                                                        <div key={exam} className="flex items-center justify-between rounded-lg border p-2 hover:bg-gray-50 transition-colors">
                                                            <span className="text-sm font-medium">{exam}</span>
                                                            <Switch
                                                                checked={field.value?.includes(exam) || false}
                                                                onCheckedChange={(checked) => {
                                                                    const currentValue = field.value || [];
                                                                    if (checked) {
                                                                        field.onChange([...currentValue, exam]);
                                                                    } else {
                                                                        field.onChange(currentValue.filter((item: string) => item !== exam));
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Add other exams (one per line)"
                                                        rows={2}
                                                        value={Array.isArray(field.value) ? field.value.filter(exam => !commonExams.includes(exam)).join('\n') : ''}
                                                        onChange={(e) => {
                                                            const otherExams = e.target.value.split('\n').filter(item => item.trim());
                                                            const selectedCommonExams = (field.value || []).filter((exam: string) => commonExams.includes(exam));
                                                            field.onChange([...selectedCommonExams, ...otherExams]);
                                                        }}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Eligibility Requirements */}
                                <FormField
                                    control={form.control}
                                    name="eligibilityRequirements"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-1 lg:col-span-1 xl:col-span-2">
                                            <FormLabel>Eligibility Requirements</FormLabel>
                                            <div className="space-y-2">
                                                {[
                                                    { id: '10th', label: '10th Standard' },
                                                    { id: '12th', label: '12th Standard' },
                                                    { id: '10th+2', label: '10th+2' },
                                                    { id: 'diploma', label: 'Diploma' },
                                                    { id: 'under_graduate', label: 'Under Graduate' },
                                                    { id: 'post_graduate', label: 'Post Graduate' },
                                                    { id: 'certificate', label: 'Certificate' }
                                                ].map((requirement) => (
                                                    <div key={requirement.id} className="flex items-center justify-between rounded-lg border p-2 hover:bg-gray-50 transition-colors">
                                                        <span className="text-sm font-medium">{requirement.label}</span>
                                                        <Switch
                                                            checked={field.value?.includes(requirement.id) || false}
                                                            onCheckedChange={(checked) => {
                                                                const currentValue = field.value || [];
                                                                if (checked) {
                                                                    field.onChange([...currentValue, requirement.id]);
                                                                } else {
                                                                    field.onChange(currentValue.filter((item: string) => item !== requirement.id));
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>


                        {/* Course Dates */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Course Schedule</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Course Start Date */}
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course Start Date *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Course End Date */}
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course End Date *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Registration Deadline */}
                                <FormField
                                    control={form.control}
                                    name="registrationDeadline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Registration Deadline *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Publishing */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Publishing</h3>

                            <FormField
                                control={form.control}
                                name="isPublished"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-lg">🚀</span>
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base font-medium">Publish Course</FormLabel>
                                                <div className="text-sm text-muted-foreground">
                                                    Make this course visible and available to students for enrollment
                                                </div>
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
                        </div>

                    </form>
                </Form>
            </div>
        </div>
    );

    // Full-screen modal similar to WorkExperienceForm
    if (variant === 'full-screen') {
        if (!open) return null;
        return (
            <>
                <div className="fixed inset-0 z-40 bg-black/40" aria-hidden="true" />
                <section
                    role="dialog"
                    aria-modal="true"
                    aria-label={isEditing ? 'Edit Course' : 'Create New Course'}
                    className="fixed inset-0 z-50 mt-[18vh] rounded-t-2xl bg-background overflow-hidden"
                >
                    <header className="flex items-center justify-between px-6 py-4 border-b bg-orange-50">
                        <h1 className="text-lg font-semibold">
                            🎓 {isEditing ? 'Edit Course' : 'Create New Course'}
                        </h1>
                        <div className="flex items-center gap-2">
                            <Button
                                type="submit"
                                form="course-form"
                                disabled={form.formState.isSubmitting}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {isEditing ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    isEditing ? "Update Course" : "Create Course"
                                )}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </header>
                    <main className="h-[calc(100%-4rem)]">{content}</main>
                </section>
            </>
        );
    }

    // Modal version with DialogTitle for accessibility
    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden">
                <VisuallyHidden>
                    <DialogTitle>
                        {isEditing ? 'Edit Course' : 'Create New Course'}
                    </DialogTitle>
                </VisuallyHidden>
                {content}
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 h-8 w-8 p-0"
                    onClick={handleClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            </DialogContent>
        </Dialog>
    );
};