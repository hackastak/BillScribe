'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

// Pricing configuration
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: 'price_1SxTCcCiSKC4abbve0VnoHZe',
    description: 'For individuals just getting started',
    features: [
      'Up to 3 clients',
      '5 invoices per month',
      'Basic invoice template',
      'Email support',
    ],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    priceId: 'price_1SxTLHCiSKC4abbv49m4xnYi',
    description: 'For growing businesses',
    features: [
      'Up to 10 clients',
      '30 invoices per month',
      'Custom invoice branding',
      'Priority email support',
      ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 20,
    priceId: 'price_1SxTNjCiSKC4abbvwPRD6qw5',
    description: 'For established businesses',
    features: [
      'Unlimited clients',
      'Unlimited invoices',
      'Custom invoice branding',
      'Priority support',
    ],
    highlighted: false,
  },
] as const;

interface PricingCardsProps {
  currentPriceId?: string | null;
}

export function PricingCards({ currentPriceId }: PricingCardsProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async (priceId: string, planId: string) => {
    if (planId === 'free' || priceId === currentPriceId) return;

    setLoadingPlan(planId);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
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
      console.error('Error creating checkout session:', err);
      setError('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const getCurrentPlanId = () => {
    if (!currentPriceId) return 'free';
    const plan = PLANS.find((p) => p.priceId === currentPriceId);
    return plan?.id || 'free';
  };

  const currentPlanId = getCurrentPlanId();

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id;
          const isLoading = loadingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-2xl',
                'bg-[var(--color-bg-surface)]',
                'shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]',
                'dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_-1px_rgba(0,0,0,0.3)]',
                plan.highlighted && 'ring-2 ring-[var(--color-brand-primary)]'
              )}
            >
              <div className="flex flex-1 flex-col p-4 sm:p-6 md:p-8">
                {/* Plan name */}
                <div className="mb-6 flex items-center gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">
                    {plan.name}
                  </h3>
                  {plan.highlighted && (
                    <span className="rounded-full bg-[var(--color-brand-primary)] px-2.5 py-0.5 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold tracking-tight text-[var(--color-fg-default)]">
                      ${plan.price}
                    </span>
                    <span className="ml-2 text-base font-medium text-[var(--color-fg-muted)]">
                      /month
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="mb-8 text-sm text-[var(--color-fg-muted)]">
                  {plan.description}
                </p>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.priceId, plan.id)}
                  disabled={isCurrentPlan || plan.id === 'free' || isLoading}
                  className={cn(
                    'mb-8 w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                    'disabled:pointer-events-none disabled:opacity-50'
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Processing...
                    </span>
                  ) : isCurrentPlan ? (
                    'Current plan'
                  ) : plan.id === 'free' ? (
                    'Current plan'
                  ) : (
                    'Subscribe'
                  )}
                </button>

                {/* Features */}
                <div className="flex-1">
                  <p className="mb-4 text-sm font-semibold text-[var(--color-fg-default)]">
                    What&apos;s included:
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10">
                          <CheckIcon className="h-3 w-3 text-[var(--color-brand-primary)]" />
                        </span>
                        <span className="text-sm text-[var(--color-fg-default)]">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
