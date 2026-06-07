"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_MESSAGES = [
  "Analyzing your learning pattern…",
  "Mapping your knowledge graph…",
  "Personalizing your path…",
  "Generating insights…",
];

type AILoaderProps = {
  messages?: string[];
  className?: string;
  /** compact inline variant (no rotating copy) */
  compact?: boolean;
  label?: string;
};

/** Adaptive-learning themed loader — replaces plain spinners. */
export function AILoader({
  messages = DEFAULT_MESSAGES,
  className,
  compact = false,
  label,
}: AILoaderProps) {
  const reduce = useReducedMotion();
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    if (compact || reduce || messages.length <= 1) return;
    const id = setInterval(
      () => setI((p) => (p + 1) % messages.length),
      2200
    );
    return () => clearInterval(id);
  }, [compact, reduce, messages.length]);

  const Orb = (
    <span className="relative grid place-items-center">
      <motion.span
        aria-hidden
        className="absolute size-12 rounded-full bg-primary/20 blur-md"
        animate={reduce ? undefined : { scale: [1, 1.25, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="relative grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"
        animate={reduce ? undefined : { rotate: [0, 8, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Brain className="size-5" />
      </motion.span>
    </span>
  );

  if (compact) {
    return (
      <span
        className={cn("inline-flex items-center gap-2", className)}
        role="status"
        aria-label={label ?? "Loading"}
      >
        <span className="relative grid size-6 place-items-center rounded-lg bg-primary/10 text-primary">
          <Brain className="size-3.5" />
        </span>
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {Orb}
      <div className="h-5 overflow-hidden">
        <motion.p
          key={i}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="text-sm font-medium text-muted-foreground"
        >
          {label ?? messages[i]}
        </motion.p>
      </div>
      {/* thinking dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            className="size-1.5 rounded-full bg-primary"
            animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: d * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
