export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export type TierLimits = {
  maxClients: number | null; // null = unlimited
  maxInvoicesPerMonth: number | null; // null = unlimited
};

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxClients: 3,
    maxInvoicesPerMonth: 5,
  },
  pro: {
    maxClients: 10,
    maxInvoicesPerMonth: 30,
  },
  enterprise: {
    maxClients: null,
    maxInvoicesPerMonth: null,
  },
};

// Map Stripe price IDs to subscription tiers
// Update these with your actual Stripe price IDs
export const PRICE_ID_TO_TIER: Record<string, SubscriptionTier> = {
  // Free tier price IDs (if you have a $0 price, otherwise free is default for no subscription)
  'price_1SvAk6EMn0GAl3txfP0xBzTl': 'free',
  // 'price_free_yearly': 'free',

  // Pro tier price IDs
  'price_1SvAkwEMn0GAl3tx66ZKYLnM': 'pro',
  // 'price_pro_yearly': 'pro',

  // Enterprise tier price IDs
  'price_1SwqX0EMn0GAl3tx4WhwJuqi': 'enterprise',
  // 'price_enterprise_yearly': 'enterprise',
};

export function getTierFromPriceId(priceId: string | null): SubscriptionTier {
  if (!priceId) {
    return 'free';
  }
  return PRICE_ID_TO_TIER[priceId] || 'free';
}

export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

export function getTierDisplayName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };
  return names[tier];
}
