'use client';

import Header from '@/components/header'
import React from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const WebLayout = ({children}: {children: React.ReactNode   }) => {
  const pathname = usePathname();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  
  // Check if breadcrumb will be shown (not on home, auth, or dashboard pages)
  const showsBreadcrumb = pathname && 
    pathname !== '/' && 
    pathname !== '/recommendation-collections' && 
    !pathname.startsWith('/auth/') && 
    !pathname.startsWith('/dashboard/') &&
    pathname.split('/').filter(Boolean).length > 1;

  return (
    <div>
      <Header />
      <div className={`${showsBreadcrumb ? 'pt-20 lg:pt-24' : 'pt-20'} ${isLoggedIn ? 'pb-20 lg:pb-0' : ''}`}>
      {children}
      </div>
    </div>
  )
}

export default WebLayout