import * as React from "react";
import { cn } from "@/lib/utils";

type GradientTextProps<T extends React.ElementType> = {
  as?: T;
  animated?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/** Brand blue→purple→cyan gradient text. */
export function GradientText<T extends React.ElementType = "span">({
  as,
  animated = false,
  className,
  children,
  ...props
}: GradientTextProps<T>) {
  const Comp = (as ?? "span") as React.ElementType;
  return (
    <Comp
      className={cn(
        "text-gradient",
        animated && "bg-brand-gradient-animated bg-clip-text",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
