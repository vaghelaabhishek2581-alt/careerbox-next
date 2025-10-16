'use client'

import React from 'react';
import { X } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Lightbox({ isOpen, onClose, children }: LightboxProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" 
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-full p-4 bg-white rounded-lg shadow-lg" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute -top-4 -right-4 z-10 p-2 bg-white rounded-full shadow-lg"
        >
          <X className="h-6 w-6 text-gray-700" />
        </button>
        {children}
      </div>
    </div>
  );
}
