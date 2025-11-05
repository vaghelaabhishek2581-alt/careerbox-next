import {
  Library,
  Wifi,
  Home,
  Utensils,
  Dumbbell,
  Bus,
  Heart,
  Building2,
  GraduationCap,
  FlaskConical,
  Users,
  Trophy,
  Microscope,
  BookOpen,
  Laptop,
  Coffee,
  ShieldCheck,
  Camera,
  Music,
  Briefcase,
  MapPin,
  Activity,
  Bed,
  Cpu,
  type LucideIcon
} from 'lucide-react'

const facilityIconMap: Record<string, LucideIcon> = {
  // Academic
  'library': Library,
  'libraries': Library,
  'central library': Library,
  'digital library': Library,
  'computer lab': Laptop,
  'computer labs': Laptop,
  'laboratory': FlaskConical,
  'laboratories': FlaskConical,
  'lab': FlaskConical,
  'labs': FlaskConical,
  'research center': Microscope,
  'research centres': Microscope,
  'seminar hall': Users,
  'seminar halls': Users,
  'auditorium': Users,
  'classroom': BookOpen,
  'classrooms': BookOpen,
  'smart classroom': Laptop,
  'conference room': Users,
  'moot court': Briefcase,
  'workshop': Building2,
  
  // Sports & Recreation
  'gym': Dumbbell,
  'gymnasium': Dumbbell,
  'fitness center': Dumbbell,
  'sports': Trophy,
  'sports complex': Trophy,
  'playground': Trophy,
  'swimming pool': Activity,
  'indoor games': Trophy,
  'outdoor games': Trophy,
  'stadium': Trophy,
  'cricket ground': Trophy,
  'football ground': Trophy,
  'basketball court': Trophy,
  'tennis court': Trophy,
  'badminton court': Trophy,
  'yoga center': Activity,
  
  // Accommodation
  'hostel': Home,
  'hostels': Home,
  'boys hostel': Home,
  'girls hostel': Home,
  'accommodation': Bed,
  'guest house': Home,
  
  // Food & Dining
  'cafeteria': Utensils,
  'canteen': Utensils,
  'mess': Utensils,
  'food court': Utensils,
  'dining hall': Utensils,
  'restaurant': Utensils,
  'coffee shop': Coffee,
  
  // Medical
  'hospital': Heart,
  'medical center': Heart,
  'health center': Heart,
  'infirmary': Heart,
  'dispensary': Heart,
  'clinic': Heart,
  'ambulance': Heart,
  
  // Transport
  'transport': Bus,
  'bus': Bus,
  'bus facility': Bus,
  'parking': MapPin,
  'vehicle parking': MapPin,
  
  // Technology
  'wifi': Wifi,
  'internet': Wifi,
  'wi-fi': Wifi,
  'computer center': Cpu,
  'it infrastructure': Cpu,
  'audio visual': Camera,
  'multimedia': Camera,
  
  // Security
  'security': ShieldCheck,
  'cctv': Camera,
  'surveillance': Camera,
  '24x7 security': ShieldCheck,
  
  // Entertainment
  'music room': Music,
  'amphitheatre': Users,
  'recreation room': Trophy,
  
  // Default
  'default': Building2
}

export function getFacilityIcon(facilityName: string): LucideIcon {
  if (!facilityName) return Building2
  
  const normalizedName = facilityName.toLowerCase().trim()
  
  // Try exact match first
  if (facilityIconMap[normalizedName]) {
    return facilityIconMap[normalizedName]
  }
  
  // Try partial match
  for (const [key, icon] of Object.entries(facilityIconMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return icon
    }
  }
  
  // Return default
  return Building2
}
