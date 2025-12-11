"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  Settings,
  BarChart3,
  MessageSquare,
  Calendar,
  GraduationCap,
  UserCog,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Dashboard',
      href: '/institute/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Leads',
      href: '/institute/leads',
      icon: Users,
    },
    {
      title: 'Profile',
      href: '/institute/profile',
      icon: UserCog,
    },
  ];

  return (
    <div className="h-full py-4">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  pathname === item.href && 'font-semibold'
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
