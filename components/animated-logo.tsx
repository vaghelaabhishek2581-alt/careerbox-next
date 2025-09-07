'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function AnimatedLogo() {
  const logoRef = useRef<SVGSVGElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!logoRef.current) return;

    const tl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 3 });
    
    // Initial state
    gsap.set(logoRef.current.querySelector('.logo-main'), { 
      scale: 0.9, 
      rotation: -5 
    });
    gsap.set(logoRef.current.querySelector('.logo-text-career'), { 
      opacity: 0, 
      x: -20 
    });
    gsap.set(logoRef.current.querySelector('.logo-text-box'), { 
      opacity: 0, 
      x: 20 
    });

    // Main logo animation sequence
    tl.to(logoRef.current.querySelector('.logo-main'), {
      scale: 1,
      rotation: 0,
      duration: 1.2,
      ease: 'elastic.out(1, 0.3)',
    })
    .to(logoRef.current.querySelector('.logo-text-career'), {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.6')
    .to(logoRef.current.querySelector('.logo-text-box'), {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.4')
    .to(logoRef.current.querySelector('.pulse-ring'), {
      scale: 1.2,
      opacity: 0.3,
      duration: 2,
      ease: 'sine.inOut',
    }, '-=0.8');

    // Hover effect
    const handleMouseEnter = () => {
      setIsHovered(true);
      gsap.to(logoRef.current, {
        scale: 1.08,
        duration: 0.3,
        ease: 'back.out(1.2)',
      });
      gsap.to(logoRef.current.querySelector('.logo-glow'), {
        opacity: 1,
        scale: 1.1,
        duration: 0.3,
      });
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      gsap.to(logoRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.inOut',
      });
      gsap.to(logoRef.current.querySelector('.logo-glow'), {
        opacity: 0.2,
        scale: 1,
        duration: 0.3,
      });
    };

    const logoElement = logoRef.current;
    logoElement.addEventListener('mouseenter', handleMouseEnter);
    logoElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      logoElement.removeEventListener('mouseenter', handleMouseEnter);
      logoElement.removeEventListener('mouseleave', handleMouseLeave);
      tl.kill();
    };
  }, []);

  return (
    <svg
      ref={logoRef}
      width="240"
      height="80"
      viewBox="0 0 240 80"
      className="cursor-pointer"
    >
      {/* Enhanced Gradients and Effects */}
      <defs>
        <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1F2937" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
        
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.1"/>
        </filter>
        
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <radialGradient id="pulseGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
          <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Pulse ring */}
      <circle
        className="pulse-ring"
        cx="30"
        cy="40"
        r="25"
        fill="url(#pulseGradient)"
        opacity="0.2"
      />
      
      {/* Background glow */}
      <circle
        className="logo-glow"
        cx="30"
        cy="40"
        r="22"
        fill="url(#primaryGradient)"
        opacity="0.2"
        filter="url(#glow)"
      />
      
      {/* Main logo container */}
      <circle
        className="logo-main"
        cx="30"
        cy="40"
        r="20"
        fill="url(#primaryGradient)"
        stroke="white"
        strokeWidth="2"
        filter="url(#dropShadow)"
      />
      
      {/* Career symbol - stylized 'C' */}
      <path
        className="logo-main"
        d="M20 35 Q20 30 25 30 Q30 30 30 35"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      
      {/* Box symbol - geometric pattern */}
      <rect
        className="logo-main"
        x="25"
        y="20"
        width="10"
        height="8"
        rx="1"
        fill="white"
        opacity="0.8"
      />
      <rect
        className="logo-main"
        x="22"
        y="32"
        width="16"
        height="2"
        rx="1"
        fill="white"
        opacity="0.7"
      />
      <rect
        className="logo-main"
        x="24"
        y="38"
        width="12"
        height="2"
        rx="1"
        fill="white"
        opacity="0.7"
      />
      <rect
        className="logo-main"
        x="26"
        y="44"
        width="8"
        height="2"
        rx="1"
        fill="white"
        opacity="0.7"
      />
      
      {/* Progress indicator */}
      <circle
        className="logo-main"
        cx="42"
        cy="28"
        r="3"
        fill="white"
        opacity="0.8"
      />
      <circle
        className="logo-main"
        cx="42"
        cy="40"
        r="2"
        fill="white"
        stroke="white"
        strokeWidth="1"
        opacity="0.6"
      />
      
      {/* CareerBox Text */}
      <text
        className="logo-text-career"
        x="70"
        y="38"
        fontFamily="Inter, sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="url(#textGradient)"
        filter="url(#dropShadow)"
      >
        Career
      </text>
      <text
        className="logo-text-box"
        x="70"
        y="54"
        fontFamily="Inter, sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="url(#primaryGradient)"
        filter="url(#dropShadow)"
      >
        Box
      </text>
      
      {/* Subtle tagline */}
      <text
        className="logo-text-career"
        x="70"
        y="68"
        fontFamily="Inter, sans-serif"
        fontSize="8"
        fontWeight="400"
        fill="#6B7280"
        opacity="0.8"
      >
        Professional Excellence
      </text>
    </svg>
  );
}