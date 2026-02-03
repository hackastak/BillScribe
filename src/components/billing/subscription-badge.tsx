import { cn } from '@/lib/utils';

interface SubscriptionBadgeProps {
  status: string | null;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
  trialing: {
    label: 'Trial',
    className:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  past_due: {
    label: 'Past Due',
    className:
      'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  },
  canceled: {
    label: 'Canceled',
    className:
      'bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)] border-[var(--color-border-default)]',
  },
  incomplete: {
    label: 'Incomplete',
    className:
      'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  },
  incomplete_expired: {
    label: 'Expired',
    className:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
  unpaid: {
    label: 'Unpaid',
    className:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
  paused: {
    label: 'Paused',
    className:
      'bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)] border-[var(--color-border-default)]',
  },
};

export function SubscriptionBadge({ status, className }: SubscriptionBadgeProps) {
  const config = status ? statusConfig[status] : null;

  if (!config) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
          'bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)] border-[var(--color-border-default)]',
          className
        )}
      >
        Free
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
