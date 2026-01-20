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
        <p className="text-sm font-medium text-neutral-600">{title}</p>
        <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
      </div>
      {icon && (
        <div className="rounded-lg bg-primary-50 p-3 text-primary-600">
          {icon}
        </div>
      )}
    </Card>
  );
}
