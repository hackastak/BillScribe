'use client';

import { useState } from 'react';
import { SubscriptionBadge } from './subscription-badge';
import { PricingCards } from './pricing-cards';
import type { Subscription } from '@/lib/db/queries/subscriptions';

interface BillingSettingsProps {
  subscription: Subscription | null;
}

export function BillingSettings({ subscription }: BillingSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageBilling = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error opening billing portal:', err);
      setError('Failed to open billing portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isSubscribed =
    subscription?.status === 'active' || subscription?.status === 'trialing';

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)]">
        <div className="border-b border-[var(--color-border-default)] px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-fg-default)]">
              Subscription
            </h2>
            <SubscriptionBadge status={subscription?.status || null} />
          </div>
        </div>
        <div className="px-6 py-4">
          {isSubscribed ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-fg-muted)]">
                Your subscription renews on{' '}
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString(
                      undefined,
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )
                  : 'N/A'}
              </p>
              {subscription?.cancelAtPeriodEnd && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Your subscription will be canceled at the end of the billing
                  period.
                </p>
              )}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              <button
                onClick={handleManageBilling}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-md bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Loading...
                  </span>
                ) : (
                  'Manage Billing'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-fg-muted)]">
                You are currently on the free plan. Upgrade to unlock premium
                features.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)]">
        <div className="border-b border-[var(--color-border-default)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--color-fg-default)]">
            {isSubscribed ? 'Change Plan' : 'Choose a Plan'}
          </h2>
        </div>
        <div className="px-6 py-4">
          <PricingCards currentPriceId={subscription?.stripePriceId} />
        </div>
      </div>
    </div>
  );
}
