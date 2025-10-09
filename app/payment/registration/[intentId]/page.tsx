'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Building, CreditCard, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatDistanceToNow } from 'date-fns'

interface RegistrationIntent {
  id: string
  type: 'institute' | 'business'
  organizationName: string
  contactName: string
  email: string
  status: string
  subscriptionPlan?: string
  adminNotes?: string
  createdAt: string
  reviewedAt?: string
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  features: string[]
  duration: string
  popular?: boolean
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 999,
    currency: 'INR',
    duration: '1 year',
    features: [
      'Up to 100 students/employees',
      'Basic course management',
      'Email support',
      'Standard analytics'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 2999,
    currency: 'INR',
    duration: '1 year',
    popular: true,
    features: [
      'Up to 500 students/employees',
      'Advanced course management',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 9999,
    currency: 'INR',
    duration: '1 year',
    features: [
      'Unlimited students/employees',
      'Full feature access',
      '24/7 dedicated support',
      'Custom integrations',
      'White-label solution',
      'Advanced security'
    ]
  }
]

export default function RegistrationPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const intentId = params.intentId as string

  const [registrationIntent, setRegistrationIntent] = useState<RegistrationIntent | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRegistrationIntent()
  }, [intentId])

  const fetchRegistrationIntent = async () => {
    try {
      const response = await fetch(`/api/registration-intents/${intentId}`)
      if (response.ok) {
        const data = await response.json()
        setRegistrationIntent(data.registrationIntent)
        
        // Pre-select the plan if specified by admin
        if (data.registrationIntent.subscriptionPlan) {
          setSelectedPlan(data.registrationIntent.subscriptionPlan)
        }
      } else {
        setError('Registration intent not found or you do not have access to it.')
      }
    } catch (error) {
      console.error('Error fetching registration intent:', error)
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
      const plan = subscriptionPlans.find(p => p.id === selectedPlan)
      if (!plan) {
        setError('Invalid subscription plan selected.')
        return
      }

      // Create payment order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.price,
          currency: plan.currency,
          registrationIntentId: intentId,
          subscriptionPlan: selectedPlan,
          organizationName: registrationIntent.organizationName,
          organizationType: registrationIntent.type
        })
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || 'Failed to create payment order')
      }

      const orderData = await orderResponse.json()

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'CareerBox',
          description: `${plan.name} - ${registrationIntent.organizationName}`,
          order_id: orderData.id,
          handler: async (response: any) => {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  registrationIntentId: intentId,
                  subscriptionPlan: selectedPlan
                })
              })

              if (verifyResponse.ok) {
                const verifyData = await verifyResponse.json()
                
                // Redirect to success page or dashboard
                router.push(`/payment/success?type=${registrationIntent.type}&organization=${encodeURIComponent(registrationIntent.organizationName)}`)
              } else {
                const errorData = await verifyResponse.json()
                setError(errorData.error || 'Payment verification failed')
              }
            } catch (error) {
              console.error('Payment verification error:', error)
              setError('Payment verification failed. Please contact support.')
            }
          },
          prefill: {
            name: registrationIntent.contactName,
            email: registrationIntent.email
          },
          theme: {
            color: '#f97316' // Orange theme
          },
          modal: {
            ondismiss: () => {
              setPaymentLoading(false)
            }
          }
        }

        const razorpay = new (window as any).Razorpay(options)
        razorpay.open()
      }

      script.onerror = () => {
        setError('Failed to load payment gateway. Please try again.')
        setPaymentLoading(false)
      }

      document.body.appendChild(script)

    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Payment failed. Please try again.')
    } finally {
      setPaymentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  if (error && !registrationIntent) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          onClick={() => router.push('/dashboard')} 
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    )
  }

  if (!registrationIntent) {
    return null
  }

  const canProceedWithPayment = registrationIntent.status === 'require_payment'

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button 
          onClick={() => router.push('/dashboard/notifications')} 
          variant="ghost" 
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notifications
        </Button>
      </div>

      <div className="flex items-center space-x-3">
        <CreditCard className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold">Complete Your Registration</h1>
      </div>

      {/* Registration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Registration Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Organization Name</label>
              <p className="text-lg font-semibold">{registrationIntent.organizationName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Type</label>
              <Badge variant="outline" className="ml-2">
                {registrationIntent.type.charAt(0).toUpperCase() + registrationIntent.type.slice(1)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Contact Person</label>
              <p>{registrationIntent.contactName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={registrationIntent.status === 'require_payment' ? 'default' : 'secondary'}
                  className="flex items-center space-x-1"
                >
                  <Clock className="h-3 w-3" />
                  <span>{registrationIntent.status.replace('_', ' ').toUpperCase()}</span>
                </Badge>
              </div>
            </div>
          </div>

          {registrationIntent.adminNotes && (
            <div>
              <label className="text-sm font-medium text-gray-600">Admin Notes</label>
              <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">{registrationIntent.adminNotes}</p>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500">
            Submitted {formatDistanceToNow(new Date(registrationIntent.createdAt), { addSuffix: true })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Section */}
      {canProceedWithPayment ? (
        <>
          {/* Subscription Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Subscription Plan</CardTitle>
              <p className="text-gray-600">
                Select a subscription plan to complete your registration and activate your account.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border rounded-lg p-6 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plan.popular ? 'ring-2 ring-orange-200' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500">
                        Most Popular
                      </Badge>
                    )}
                    
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">₹{plan.price}</span>
                        <span className="text-gray-600">/{plan.duration}</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {selectedPlan === plan.id && (
                      <div className="absolute inset-0 border-2 border-orange-500 rounded-lg pointer-events-none">
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-5 w-5 text-orange-500 bg-white rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Button */}
          {selectedPlan && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Complete Payment</h3>
                    <p className="text-gray-600">
                      Pay ₹{subscriptionPlans.find(p => p.id === selectedPlan)?.price} to activate your {registrationIntent.type} account
                    </p>
                  </div>
                  <Button 
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This registration is not ready for payment. Current status: {registrationIntent.status}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
