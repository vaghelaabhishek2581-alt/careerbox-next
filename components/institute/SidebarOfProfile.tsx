"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import {
  Building2,
  Sparkles,
  FileText,
  FileCheck,
  MapPin,
  Wifi,
  Trophy,
  Award,
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProfileSidebar() {
  const pathname = usePathname();
  const searchParams: any = useSearchParams();
  const currentTab = searchParams.get('tab') || 'core';

  const menuItems = [
    { id: 'core', label: 'Core Details', icon: Building2 },
    { id: 'accreditation', label: 'Accreditation', icon: FileCheck },
    { id: 'location', label: 'Location & Contact', icon: MapPin },
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'campus', label: 'Campus Details', icon: Wifi },
    { id: 'academics', label: 'Academics', icon: GraduationCap },
    { id: 'faculty', label: 'Faculty & Student Data', icon: Users },
    { id: 'admissions', label: 'Admissions & Placements', icon: Briefcase },
    { id: 'rankings', label: 'Rankings', icon: Trophy },
    { id: 'research', label: 'Research & Alumni', icon: UserCheck },
    { id: 'awards', label: 'Awards & Media', icon: Award },
    { id: 'programmes', label: 'Programmes', icon: FileText },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Link href="/institute/dashboard">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="py-2">
          {menuItems.map((item, index) => {
            const isActive = currentTab === item.id && pathname === '/institute/profile';
            return (
              <Link key={index} href={`/institute/profile?tab=${item.id}`}>
                <div className={`flex items-center px-6 py-3.5 text-sm font-medium transition-colors ${isActive
                    ? "bg-blue-50 text-gray-900 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                  }`}>
                  <item.icon className={`h-5 w-5 mr-3 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
