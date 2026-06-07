"use client";

import * as React from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  icon?: LucideIcon;
  /** signed percent change; positive = up (good) */
  trend?: number;
  hint?: string;
  className?: string;
  /** brand tint for the icon chip */
  tone?: "brand" | "success" | "warning" | "muted";
};

const toneMap = {
  brand: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  muted: "bg-muted text-muted-foreground",
} as const;

function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!inView || reduce) return;
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduce]);

  const shown = reduce ? value : inView ? display : 0;
  const isInt = Number.isInteger(value);
  return (
    <span ref={ref} className="tabular-nums">
      {isInt ? Math.round(shown) : shown.toFixed(1)}
    </span>
  );
}

/** Analytics stat card with count-up value, icon chip and trend pill. */
export function StatCard({
  label,
  value,
  suffix,
  prefix,
  icon: Icon,
  trend,
  hint,
  className,
  tone = "brand",
}: StatCardProps) {
  const reduce = useReducedMotion();
  const up = (trend ?? 0) >= 0;
  const isBrand = tone === "brand";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card
        variant="glass"
        interactive
        className={cn("gap-3 p-5", className)}
      >
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon && (
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl",
                isBrand ? toneMap.brand : toneMap[tone]
              )}
            >
              <Icon className="size-4" />
            </span>
          )}
        </div>
        <div className="flex items-end gap-2">
          <span className="font-heading text-3xl font-semibold leading-none">
            {prefix}
            {typeof value === "number" ? <CountUp value={value} /> : value}
            {suffix}
          </span>
          {typeof trend === "number" && (
            <span
              className={cn(
                "mb-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                up
                  ? "bg-success/15 text-success"
                  : "bg-destructive/15 text-destructive"
              )}
            >
              {up ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </Card>
    </motion.div>
  );
}
