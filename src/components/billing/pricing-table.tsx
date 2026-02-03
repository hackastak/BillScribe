'use client';

import { useEffect, useRef } from 'react';
import { useStripeContext } from '@/components/providers/stripe-provider';
import { STRIPE_CONFIG } from '@/lib/stripe/config';

export function PricingTable() {
  const { isReady } = useStripeContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isReady || !containerRef.current) return;
    if (!STRIPE_CONFIG.pricingTableId || !STRIPE_CONFIG.publishableKey) return;

    // Clear any existing content
    containerRef.current.innerHTML = '';

    // Create the stripe-pricing-table element
    const pricingTable = document.createElement('stripe-pricing-table');
    pricingTable.setAttribute('pricing-table-id', STRIPE_CONFIG.pricingTableId);
    pricingTable.setAttribute('publishable-key', STRIPE_CONFIG.publishableKey);
    containerRef.current.appendChild(pricingTable);
  }, [isReady]);

  if (!isReady) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border-default)] border-t-[var(--color-brand-primary)]" />
      </div>
    );
  }

  if (!STRIPE_CONFIG.pricingTableId || !STRIPE_CONFIG.publishableKey) {
    return (
      <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-muted)] p-6 text-center">
        <p className="text-sm text-[var(--color-fg-muted)]">
          Pricing table not configured. Please set up your Stripe Pricing Table
          in the Stripe Dashboard and add the NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID
          environment variable.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" />;
}
