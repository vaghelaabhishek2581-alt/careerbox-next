import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import AdminDashboard from './admin/AdminDashboard'
import BusinessDashboard from './business/BusinessDashboard'
import InstituteDashboard from './institute/InstituteDashboard'
import PublicDashboard from './user/PublicDashboard'

export default function RoleDashboard() {
  const { user, subscription } = useSelector((state: RootState) => ({
    user: state.auth.user,
    subscription: state.subscription.currentSubscription
  }))

  // Role-based dashboard rendering
  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  if (user?.role === 'business' && subscription?.status === 'active') {
    return <BusinessDashboard />
  }

  if (user?.role === 'institute' && subscription?.status === 'active') {
    return <InstituteDashboard />
  }

  // Default to public dashboard
  return <PublicDashboard />
}
