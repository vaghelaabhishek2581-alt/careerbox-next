"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import SidebarManager from "@/components/user/SidebarManager"
import { usePathname } from "next/navigation"

interface UserLayoutProps {
    children: React.ReactNode
}

export default function UserLayout({ children }: UserLayoutProps) {
    const { data: session, status } = useSession()
    const pathname = usePathname()
    const showSidebar = !["/user", "/user/create-page", "/user/register-institute", "/user/register-business"].includes(pathname)

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
        <div className="flex min-h-screen flex-col">
            <Header />
            <div className="pt-20 pb-24">
                <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-6 lg:gap-8 pt-6">
                        {showSidebar && (
                            <aside className="hidden lg:block w-[300px] shrink-0">
                                <div className="sticky top-24">
                                    <SidebarManager />
                                </div>
                            </aside>
                        )}
                        <main className="flex-1 min-w-0">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    )
}
