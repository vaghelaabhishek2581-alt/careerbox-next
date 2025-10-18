'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Footer from './footer';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  showFooter?: boolean;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function PageLayout({ 
  children, 
  className = '', 
  showFooter = true 
}: PageLayoutProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}
    >
      {/* Add top padding to account for fixed header */}
        {children}
      {showFooter && <Footer />}
    </motion.div>
  );
}