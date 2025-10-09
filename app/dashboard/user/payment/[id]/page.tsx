'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    ArrowLeft,
    Building,
    GraduationCap,
    CreditCard,
    Shield,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2,
    Check,
    Smartphone,
    Globe
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface RegistrationIntent {
    id: string
    type: 'institute' | 'business'
    organizationName: string
    contactName: string
    email: string
    contactPhone: string
    status: string
    subscriptionPlan?: string
    adminNotes?: string
    createdAt: string
    reviewedAt?: string
    city: string
    state: string
    country: string
}

interface PlanDetails {
    id: string
    name: string
    price: number
    originalPrice?: number
    currency: string
    duration: string
    features: string[]
    type: 'institute' | 'business'
}

const PLAN_CONFIGS: Record<string, PlanDetails> = {
    'institute-basic': {
        id: 'basic',
        name: 'Institute Plan',
        price: 49999,
        originalPrice: 80000,
        currency: 'INR',
        duration: '1 year',
        type: 'institute',
        features: [
            'Up to 100 students',
            'Course management system',
            'Student enrollment tracking',
            'Basic analytics dashboard',
            'Email support',
            'Certificate generation',
            'Assignment management',
            'Grade book functionality'
        ]
    },
    'institute-premium': {
        id: 'premium',
        name: 'Institute Premium Plan',
        price: 2999,
        originalPrice: 4499,
        currency: 'INR',
        duration: '1 year',
        type: 'institute',
        features: [
            'Up to 500 students',
            'Advanced course management',
            'Live class integration',
            'Advanced analytics & reports',
            'Priority support',
            'Custom branding',
            'API access',
            'Mobile app access',
            'Bulk operations',
            'Advanced certificate templates'
        ]
    },
    'institute-enterprise': {
        id: 'enterprise',
        name: 'Institute Enterprise Plan',
        price: 9999,
        originalPrice: 14999,
        currency: 'INR',
        duration: '1 year',
        type: 'institute',
        features: [
            'Unlimited students',
            'Full feature access',
            'White-label solution',
            '24/7 dedicated support',
            'Custom integrations',
            'Advanced security features',
            'Multi-campus support',
            'Custom workflows',
            'Dedicated account manager',
            'Training & onboarding'
        ]
    },
    'business-basic': {
        id: 'basic',
        name: 'Business Basic Plan',
        price: 999,
        originalPrice: 1499,
        currency: 'INR',
        duration: '1 year',
        type: 'business',
        features: [
            'Up to 50 job postings',
            'Candidate management',
            'Basic applicant tracking',
            'Email notifications',
            'Standard support',
            'Resume database access',
            'Interview scheduling',
            'Basic reporting'
        ]
    },
    'business-premium': {
        id: 'premium',
        name: 'Business Premium Plan',
        price: 2999,
        originalPrice: 4499,
        currency: 'INR',
        duration: '1 year',
        type: 'business',
        features: [
            'Unlimited job postings',
            'Advanced candidate screening',
            'AI-powered matching',
            'Advanced analytics',
            'Priority support',
            'Custom branding',
            'API access',
            'Team collaboration tools',
            'Advanced reporting',
            'Integration capabilities'
        ]
    },
    'business-enterprise': {
        id: 'enterprise',
        name: 'Business Enterprise Plan',
        price: 9999,
        originalPrice: 14999,
        currency: 'INR',
        duration: '1 year',
        type: 'business',
        features: [
            'Enterprise-grade features',
            'Custom workflows',
            'Dedicated account manager',
            '24/7 premium support',
            'Advanced security',
            'Custom integrations',
            'White-label solution',
            'Multi-location support',
            'Advanced compliance tools',
            'Training & consulting'
        ]
    }
}

// Dynamic Razorpay script loading function
const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof (window as any).Razorpay !== 'undefined') {
            resolve(true)
            return
        }

        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

export default function UserPaymentPage() {
    const params = useParams()
    const router = useRouter()
    
    // Handle potential null params with proper validation
    const registrationId = params?.id as string
    
    const [registrationIntent, setRegistrationIntent] = useState<RegistrationIntent | null>(null)
    const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Only fetch if we have a valid registration ID
        if (registrationId) {
            fetchRegistrationIntent()
        } else {
            setError('Invalid registration ID')
            setLoading(false)
        }
    }, [registrationId])

    const fetchRegistrationIntent = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/registration-intents/${registrationId}`)
            const data = await response.json()

            if (data.success) {
                setRegistrationIntent(data.data)

                // Determine the plan based on admin selection and type
                const planKey = `${data.data.type}-${data.data.subscriptionPlan || 'basic'}`
                const plan = PLAN_CONFIGS[planKey]

                if (plan) {
                    setSelectedPlan(plan)
                } else {
                    // Fallback to basic plan
                    setSelectedPlan(PLAN_CONFIGS[`${data.data.type}-basic`])
                }
            } else {
                setError(data.error || 'Failed to fetch registration details')
            }
        } catch (error) {
            console.error('Error fetching registration:', error)
            setError('Failed to load registration details. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handlePayment = async () => {
        if (!selectedPlan || !registrationIntent) return

        setPaymentLoading(true)
        setError(null)

        try {
            // Load Razorpay script
            const isRazorpayLoaded = await loadRazorpayScript()
            if (!isRazorpayLoaded) {
                throw new Error('Failed to load Razorpay. Please check your internet connection.')
            }

            // Create payment order
            const orderResponse = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: selectedPlan.price * 100, // Convert to paise
                    currency: 'INR',
                    registrationIntentId: registrationId,
                    subscriptionPlan: selectedPlan.id,
                    planType: registrationIntent.type.toUpperCase(),
                }),
            })

            const orderData = await orderResponse.json()

            if (!orderData.success) {
                throw new Error(orderData.error || 'Failed to create payment order')
            }

            // Initialize Razorpay payment
            const options = {
                key: orderData.data.key,
                amount: orderData.data.amount,
                currency: orderData.data.currency,
                name: 'CareerBox',
                description: `${selectedPlan.name} - ${registrationIntent.organizationName}`,
                order_id: orderData.data.orderId,
                handler: async function (response: any) {
                    try {
                        // Verify payment
                        const verifyResponse = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                registrationIntentId: registrationId,
                                subscriptionPlan: selectedPlan.id,
                            }),
                        })

                        const verifyData = await verifyResponse.json()

                        if (verifyData.success) {
                            // Redirect to success page
                            router.push(`/payment/success?type=${registrationIntent.type}&org=${encodeURIComponent(registrationIntent.organizationName)}`)
                        } else {
                            throw new Error(verifyData.error || 'Payment verification failed')
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error)
                        setError('Payment verification failed. Please contact support if amount was deducted.')
                    }
                },
                prefill: {
                    name: registrationIntent.contactName,
                    email: registrationIntent.email,
                    contact: registrationIntent.contactPhone,
                },
                notes: {
                    registrationIntentId: registrationId,
                    organizationType: registrationIntent.type,
                    planType: selectedPlan.id,
                },
                theme: {
                    color: registrationIntent.type === 'institute' ? '#f97316' : '#8b5cf6',
                },
                modal: {
                    ondismiss: function () {
                        setPaymentLoading(false)
                    }
                }
            }

            const razorpay = new (window as any).Razorpay(options)
            razorpay.open()

        } catch (error) {
            console.error('Payment error:', error)
            setError(error instanceof Error ? error.message : 'Payment failed. Please try again.')
            setPaymentLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading payment details...</p>
                </div>
            </div>
        )
    }

    if (error || !registrationIntent || !selectedPlan) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Payment Error</h2>
                        <p className="text-gray-600 mb-4">{error || 'Registration details not found'}</p>
                        <Button onClick={() => router.back()} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const savings = selectedPlan.originalPrice ? selectedPlan.originalPrice - selectedPlan.price : 0
    const IconComponent = registrationIntent.type === 'institute' ? GraduationCap : Building

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Registration Status
                    </Button>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
                        <p className="text-gray-600">
                            Secure payment for {registrationIntent.organizationName}
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Registration Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconComponent className={`h-6 w-6 ${registrationIntent.type === 'institute' ? 'text-orange-600' : 'text-purple-600'}`} />
                                Registration Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">{registrationIntent.organizationName}</h3>
                                <Badge variant="outline" className="capitalize mt-1">
                                    {registrationIntent.type}
                                </Badge>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Contact Person:</span>
                                    <span className="font-medium">{registrationIntent.contactName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium">{registrationIntent.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="font-medium">{registrationIntent.contactPhone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Location:</span>
                                    <span className="font-medium">{registrationIntent.city}, {registrationIntent.state}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Applied:</span>
                                    <span className="font-medium">
                                        {formatDistanceToNow(new Date(registrationIntent.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>

                            {registrationIntent.adminNotes && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Admin Note:</strong> {registrationIntent.adminNotes}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Plan */}
                    <Card className="relative overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${registrationIntent.type === 'institute'
                                ? 'from-orange-500 to-orange-600'
                                : 'from-purple-500 to-purple-600'
                            }`} />

                        {savings > 0 && (
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-green-500 text-white">
                                    Save ₹{savings}
                                </Badge>
                            </div>
                        )}

                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${registrationIntent.type === 'institute' ? 'bg-orange-100' : 'bg-purple-100'
                                    }`}>
                                    <IconComponent className={`h-5 w-5 ${registrationIntent.type === 'institute' ? 'text-orange-600' : 'text-purple-600'
                                        }`} />
                                </div>
                                {selectedPlan.name}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Pricing */}
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    {selectedPlan.originalPrice && (
                                        <span className="text-2xl text-gray-400 line-through">
                                            ₹{selectedPlan.originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                    <span className="text-4xl font-bold">
                                        ₹{selectedPlan.price.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-1">{selectedPlan.duration}</p>
                                {savings > 0 && (
                                    <p className="text-green-600 font-medium mt-2">
                                        You save ₹{savings.toLocaleString()}!
                                    </p>
                                )}
                            </div>

                            <Separator />

                            {/* Features */}
                            <div>
                                <h4 className="font-semibold mb-3">What's Included:</h4>
                                <div className="space-y-2">
                                    {selectedPlan.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Payment Methods */}
                            <div>
                                <h4 className="font-semibold mb-3">Payment Methods:</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <CreditCard className="h-4 w-4" />
                                        Cards
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Smartphone className="h-4 w-4" />
                                        UPI
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Globe className="h-4 w-4" />
                                        Net Banking
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Payment Button */}
                            <Button
                                onClick={handlePayment}
                                disabled={paymentLoading}
                                className={`w-full h-12 text-lg ${registrationIntent.type === 'institute'
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                                        : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                                    }`}
                            >
                                {paymentLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-5 w-5 mr-2" />
                                        Pay ₹{selectedPlan.price.toLocaleString()} Securely
                                    </>
                                )}
                            </Button>

                            {/* Security Notice */}
                            <div className="text-center text-xs text-gray-500">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Shield className="h-3 w-3" />
                                    Secured by Razorpay
                                </div>
                                Your payment information is encrypted and secure
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Trust Indicators */}
                <div className="mt-12 text-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                        <div className="flex flex-col items-center">
                            <Shield className="h-8 w-8 text-green-500 mb-2" />
                            <h3 className="font-semibold">Secure Payment</h3>
                            <p className="text-sm text-gray-600">Bank-level security</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <CheckCircle className="h-8 w-8 text-blue-500 mb-2" />
                            <h3 className="font-semibold">Instant Activation</h3>
                            <p className="text-sm text-gray-600">Immediate access</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <Clock className="h-8 w-8 text-purple-500 mb-2" />
                            <h3 className="font-semibold">24/7 Support</h3>
                            <p className="text-sm text-gray-600">Always here to help</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
