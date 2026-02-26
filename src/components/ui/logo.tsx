"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 140, height = 32 }: LogoProps) {
  return (
    <div className={cn("relative", className)} style={{ width, height }}>
      {/* Light mode logo (for dark backgrounds) */}
      <Image
        src="/billscribe_darkBG.png"
        alt="BillScribe"
        width={width}
        height={height}
        className="hidden dark:block object-contain"
        priority
      />
      {/* Dark mode logo (for light backgrounds) */}
      <Image
        src="/billscribe_lightBG.png"
        alt="BillScribe"
        width={width}
        height={height}
        className="block dark:hidden object-contain"
        priority
      />
    </div>
  );
}
