"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  className?: string;
}

export default function Breadcrumb({ className }: BreadcrumbProps) {
  const pathname = usePathname();

  // Don't show breadcrumb on home page, recommendation-collections main page, auth pages, or dashboard
  if (!pathname || pathname === '/' || pathname === '/recommendation-collections' || pathname.startsWith('/auth/') || pathname.startsWith('/dashboard/')) {
    return null;
  }

  // Parse pathname into segments
  const segments = pathname.split('/').filter(Boolean);

  // Create breadcrumb items
  const breadcrumbItems: Array<{
    name: string;
    href: string;
    icon?: React.ComponentType<any>;
  }> = [
      { name: 'Home', href: '/recommendation-collections', icon: Home }
    ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Skip "recommendation-collections" from breadcrumbs
    if (segment === 'recommendation-collections') {
      return;
    }

    // Format segment name (replace hyphens with spaces and capitalize)
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbItems.push({
      name,
      href: currentPath
    });
  });

  return (
    <nav className={cn("fixed top-[104px] lg:top-[100px] left-0 right-0 bg-white border-b border-gray-200 z-[1000]", className)} aria-label="Breadcrumb">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 py-2 text-sm">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const IconComponent = item.icon;

            return (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                )}
                {isLast ? (
                  <span className="flex items-center gap-1 text-gray-900 font-medium">
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
