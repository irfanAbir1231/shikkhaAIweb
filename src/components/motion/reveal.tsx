"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

type Direction = "up" | "down" | "left" | "right" | "none";

const offset: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
  none: {},
};

type RevealProps = HTMLMotionProps<"div"> & {
  direction?: Direction;
  delay?: number;
  duration?: number;
  /** animate once on scroll into view (default) vs every time */
  once?: boolean;
  amount?: number;
};

/** Fade + slide in when scrolled into view. Respects reduced-motion. */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.2,
  ...props
}: RevealProps) {
  const reduce = useReducedMotion();
  const from = reduce ? {} : offset[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: reduce ? 0 : duration, delay, ease: EASE }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers its <StaggerItem> children into view. */
export function Stagger({
  children,
  delay = 0,
  gap = 0.08,
  once = true,
  amount = 0.15,
  ...props
}: HTMLMotionProps<"div"> & {
  delay?: number;
  gap?: number;
  once?: boolean;
  amount?: number;
}) {
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: delay } },
  };
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  direction = "up",
  duration = 0.55,
  ...props
}: HTMLMotionProps<"div"> & { direction?: Direction; duration?: number }) {
  const reduce = useReducedMotion();
  const from = reduce ? {} : offset[direction];
  const variants: Variants = {
    hidden: { opacity: 0, ...from },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: reduce ? 0 : duration, ease: EASE },
    },
  };
  return (
    <motion.div variants={variants} {...props}>
      {children}
    </motion.div>
  );
}
