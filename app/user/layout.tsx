"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Header from "@/components/header"

interface UserLayoutProps {
    children: React.ReactNode
}

export default function UserLayout({ children }: UserLayoutProps) {
    const { data: session, status } = useSession()

    // Check authentication
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!session) {
        redirect("/auth/login")
    }

    return (
        <div className="min-h-screen">
            <Header />
            {/* Add top padding to account for fixed header */}
            <div className="pt-16">
                <div className="max-w-7xl mx-auto py-12">
                    {children}
                </div>
            </div>
        </div>
    )
}
