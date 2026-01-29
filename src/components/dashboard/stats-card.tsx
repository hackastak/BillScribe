import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
};

export function StatsCard({ title, value, icon, className }: StatsCardProps) {
  return (
    <Card className={cn("flex items-start justify-between", className)}>
      <div>
        <p className="text-sm font-medium text-[var(--color-fg-muted)]">
          {title}
        </p>
        <p className="mt-2 text-3xl font-bold text-[var(--color-fg-default)]">
          {value}
        </p>
      </div>
      {icon && (
        <div className="rounded-lg bg-[var(--color-status-info-bg)] p-3 text-[var(--color-status-info-fg)]">
          {icon}
        </div>
      )}
    </Card>
  );
}
