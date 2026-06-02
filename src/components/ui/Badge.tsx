import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "default" | "accent" | "soft";
  className?: string;
}

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "border-border bg-bg text-muted",
  accent: "border-transparent bg-accent/10 text-accent",
  soft: "border-transparent bg-[#e3b04b]/15 text-[#9a6f17] dark:text-[#e3b04b]",
};

export function Badge({ children, tone = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
