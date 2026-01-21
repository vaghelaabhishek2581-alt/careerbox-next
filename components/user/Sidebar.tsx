"use client";

import { UserProfileCard } from "./UserProfileCard";
import { UserMenu } from "./UserMenu";

export function Sidebar() {
  return (
    <div className="space-y-6">
      <UserProfileCard />
      <UserMenu />
    </div>
  );
}

