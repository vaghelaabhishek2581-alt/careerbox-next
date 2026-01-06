"use client";

import { InstituteProfileCard } from './InstituteProfileCard';
import { InstituteMenu } from './InstituteMenu';

export function Sidebar() {
  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <InstituteProfileCard />

      {/* Navigation Menu */}
      <InstituteMenu />
    </div>
  );
}
