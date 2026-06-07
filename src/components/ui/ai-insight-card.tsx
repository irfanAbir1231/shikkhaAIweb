"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type AIInsightCardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** show the animated "thinking" pulse on the icon */
  pulse?: boolean;
};

/**
 * AI insight widget — gradient hairline, glass body, sparkle badge.
 * Use for personalized recommendations / encouragement across pages.
 */
export function AIInsightCard({
  title = "AI Insight",
  children,
  className,
  pulse = true,
}: AIInsightCardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-md",
        className
      )}
    >
      {/* subtle corner accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="relative flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary",
            pulse && !reduce && "ring-2 ring-primary/20"
          )}
        >
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            {title}
          </p>
          <div className="text-sm leading-relaxed text-foreground/90">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
