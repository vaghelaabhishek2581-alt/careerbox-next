"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "light" | "dark";
}

export default function Logo({ className, showText = true, variant = "light" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src={variant === "dark" ? "/cboxLogo.png" : "/Logo.svg"}
        alt="CareerBox Logo"
        width={32}
        height={32}
        className="object-contain"
      />
      {showText && (
        <span className={cn(
          "font-semibold text-xl",
          variant === "light" 
            ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            : "text-white"
        )}>
          CareerBox
        </span>
      )}
    </div>
  );
}
