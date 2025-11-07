import {
  Building2,
  BookOpen,
  Coffee,
  Home,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Wifi,
  Bus,
  Theater,
  Music,
  Palette,
  Snowflake,
  Store,
  FlaskConical,
  Trophy,
  type LucideIcon,
} from 'lucide-react'

export const FACILITY_ICONS: Record<string, LucideIcon> = {
  'Moot Court (Law)': GraduationCap,
  'Design Studio': Palette,
  Library: BookOpen,
  Cafeteria: Coffee,
  Hostel: Home,
  'Sports Complex': Trophy,
  Gym: Dumbbell,
  'Hospital / Medical Facilities': HeartPulse,
  'Wi-Fi Campus': Wifi,
  'Shuttle Service': Bus,
  Auditorium: Theater,
  'Music Room': Music,
  'Dance Room': Music,
  'A/C Classrooms': Snowflake,
  'Convenience Store': Store,
  Labs: FlaskConical,
  Others: Building2,
}

export function getFacilityIcon(facilityName: string): LucideIcon {
  return FACILITY_ICONS[facilityName] || Building2
}
