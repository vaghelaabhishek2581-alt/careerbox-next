"use client";

import { usePathname } from 'next/navigation';
import { ProfileSidebar } from './SidebarOfProfile';
import { Sidebar } from './sidebar';

export function SidebarManager() {
  const pathname = usePathname();

  // Check if we are in the profile section
  const isProfileSection = pathname?.startsWith('/institute/profile');

  if (isProfileSection) {
    return <ProfileSidebar />;
  }

  return <Sidebar />;
}
