"use client";

import { useSession } from "next-auth/react";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/90">
      {/* Header */}
      <Header />

      {/* Page Content */}
      <main className="p-4 md:p-6">
        <div className="max-w-8xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
