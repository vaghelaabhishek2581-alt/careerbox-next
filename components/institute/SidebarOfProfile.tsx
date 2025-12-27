"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  const menuItems = [
    { label: "Institute Profile", icon: Building2, href: "/institute/profile" },
    { label: "Highlights", icon: Sparkles, href: "/institute/profile/highlights" },
    { label: "Registration Details", icon: FileText, href: "/institute/profile/registration" },
    { label: "Documents", icon: FileCheck, href: "/institute/profile/documents" },
    { label: "Locations", icon: MapPin, href: "/institute/profile/locations" },
    { label: "Facilities", icon: Wifi, href: "/institute/profile/facilities" },
    { label: "Rankings", icon: Trophy, href: "/institute/profile/rankings" },
    { label: "Awards", icon: Award, href: "/institute/profile/awards" },
    { label: "Memberships", icon: Users, href: "/institute/profile/memberships" },
    { label: "Scholarships", icon: GraduationCap, href: "/institute/profile/scholarships" },
    { label: "Placements", icon: Briefcase, href: "/institute/profile/placements" },
    { label: "Alumni Students", icon: UserCheck, href: "/institute/profile/alumni" },
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
            const isActive = pathname === item.href;
            return (
              <Link key={index} href={item.href}>
                <div className={`flex items-center px-6 py-3.5 text-sm font-medium transition-colors ${
                  isActive 
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
