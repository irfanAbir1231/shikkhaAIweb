"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type ProgressRingProps = {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** gradient stops use brand by default */
  className?: string;
  trackClassName?: string;
  showValue?: boolean;
  /** content rendered in the center; overrides showValue */
  children?: React.ReactNode;
  label?: string;
};

/** Animated circular progress with brand gradient stroke. */
export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  className,
  trackClassName,
  showValue = true,
  children,
  label,
}: ProgressRingProps) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  const gradId = React.useId();

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-from)" />
            <stop offset="50%" stopColor="var(--brand-via)" />
            <stop offset="100%" stopColor="var(--brand-to)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn("stroke-muted", trackClassName)}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: circumference - dash }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        {children ??
          (showValue && (
            <span className="font-heading text-2xl font-semibold tabular-nums">
              {Math.round(clamped)}
              <span className="text-sm text-muted-foreground">%</span>
            </span>
          ))}
      </div>
    </div>
  );
}
