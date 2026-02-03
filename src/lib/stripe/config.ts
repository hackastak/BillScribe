const getAppUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

export const STRIPE_CONFIG = {
  pricingTableId: process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || '',
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',

  successUrl: `${getAppUrl()}/settings/billing?success=true`,
  cancelUrl: `${getAppUrl()}/settings/billing?canceled=true`,
  portalReturnUrl: `${getAppUrl()}/settings/billing`,
} as const;
