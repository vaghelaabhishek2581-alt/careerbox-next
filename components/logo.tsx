"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/cboxLogo.png"
        alt="CareerBox Logo"
        width={32}
        height={32}
        className="object-contain"
      />
      {showText && (
        <span className="font-semibold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CareerBox
        </span>
      )}
    </div>
  );
}
