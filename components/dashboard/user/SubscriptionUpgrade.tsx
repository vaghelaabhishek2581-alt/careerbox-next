import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import { fetchAvailablePlans, createSubscription } from '@/lib/redux/slices/subscriptionSlice'
import { SubscriptionPlan } from '@/lib/types/subscription.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Crown, Zap, Star, Building2, GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SubscriptionUpgrade() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { availablePlans, loading } = useSelector((state: RootState) => state.subscription)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | ''>('')
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchAvailablePlans())
  }, [dispatch])

  const handleUpgrade = async () => {
    if (!selectedPlan) return

    setIsSubmitting(true)
    try {
      await dispatch(createSubscription({
        plan: selectedPlan as SubscriptionPlan,
        interval: selectedInterval,
        paymentMethodId: 'mock_payment_method' // In real implementation, this would come from payment form
      })).unwrap()
      
      setUpgradeDialogOpen(false)
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to upgrade subscription:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPlanIcon = (planId: string) => {
    if (planId.includes('pro')) return <Crown className="h-5 w-5" />
    if (planId.includes('basic')) return <Zap className="h-5 w-5" />
    return <Star className="h-5 w-5" />
  }

  const getPlanColor = (planId: string) => {
    if (planId.includes('pro')) return 'text-purple-600'
    if (planId.includes('basic')) return 'text-blue-600'
    return 'text-gray-600'
  }

  const getPlanCategory = (planId: string) => {
    if (planId.includes('business')) return 'business'
    if (planId.includes('institute')) return 'institute'
    return 'general'
  }

  const businessPlans = availablePlans.filter(plan => plan.id.includes('business'))
  const institutePlans = availablePlans.filter(plan => plan.id.includes('institute'))

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading subscription plans...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Upgrade Your Account</h1>
        <p className="text-muted-foreground">
          Choose a subscription plan to unlock powerful features for your business or institute
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Business Plans */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold">Business Plans</h2>
          </div>
          <div className="space-y-4">
            {businessPlans.map((plan) => (
              <Card key={plan.id} className={plan.popular ? 'ring-2 ring-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(plan.id)}
                      <CardTitle className={getPlanColor(plan.id)}>{plan.name}</CardTitle>
                    </div>
                    {plan.popular && (
                      <Badge variant="default">Popular</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    ${selectedInterval === 'monthly' ? plan.price.monthly : plan.price.yearly}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{selectedInterval === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Dialog open={upgradeDialogOpen && selectedPlan === plan.id} onOpenChange={setUpgradeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        Choose {plan.name}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upgrade to {plan.name}</DialogTitle>
                        <DialogDescription>
                          Complete your subscription upgrade to start using business features.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Billing Interval</label>
                          <Select value={selectedInterval} onValueChange={(value: 'monthly' | 'yearly') => setSelectedInterval(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">
                                Monthly - ${plan.price.monthly}/month
                              </SelectItem>
                              <SelectItem value="yearly">
                                Yearly - ${plan.price.yearly}/year (Save ${(plan.price.monthly * 12) - plan.price.yearly})
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total</span>
                            <span className="text-lg font-bold">
                              ${selectedInterval === 'monthly' ? plan.price.monthly : plan.price.yearly}
                              /{selectedInterval === 'monthly' ? 'month' : 'year'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpgrade} disabled={isSubmitting}>
                          {isSubmitting ? 'Processing...' : 'Upgrade Now'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Institute Plans */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-semibold">Institute Plans</h2>
          </div>
          <div className="space-y-4">
            {institutePlans.map((plan) => (
              <Card key={plan.id} className={plan.popular ? 'ring-2 ring-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(plan.id)}
                      <CardTitle className={getPlanColor(plan.id)}>{plan.name}</CardTitle>
                    </div>
                    {plan.popular && (
                      <Badge variant="default">Popular</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    ${selectedInterval === 'monthly' ? plan.price.monthly : plan.price.yearly}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{selectedInterval === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Dialog open={upgradeDialogOpen && selectedPlan === plan.id} onOpenChange={setUpgradeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        Choose {plan.name}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upgrade to {plan.name}</DialogTitle>
                        <DialogDescription>
                          Complete your subscription upgrade to start using institute features.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Billing Interval</label>
                          <Select value={selectedInterval} onValueChange={(value: 'monthly' | 'yearly') => setSelectedInterval(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">
                                Monthly - ${plan.price.monthly}/month
                              </SelectItem>
                              <SelectItem value="yearly">
                                Yearly - ${plan.price.yearly}/year (Save ${(plan.price.monthly * 12) - plan.price.yearly})
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total</span>
                            <span className="text-lg font-bold">
                              ${selectedInterval === 'monthly' ? plan.price.monthly : plan.price.yearly}
                              /{selectedInterval === 'monthly' ? 'month' : 'year'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpgrade} disabled={isSubmitting}>
                          {isSubmitting ? 'Processing...' : 'Upgrade Now'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Comparison */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-center mb-8">Feature Comparison</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Free Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Browse jobs and courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Apply to opportunities</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Basic profile management</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Business/Institute Basic</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">All Free features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Create job postings/courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Basic analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Email support</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Business/Institute Pro</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">All Basic features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Unlimited postings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">API access</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
