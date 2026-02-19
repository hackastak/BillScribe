import { hasAccessToTier, getTierDisplayName, type SubscriptionTier } from './tiers';
import type { InvoiceTemplate } from '@/lib/db/schema/profiles';

// Template tier requirements - must match the minTier values in pdf.ts
// Duplicated here to avoid circular dependencies and keep this file client-safe
const TEMPLATE_TIERS: Record<InvoiceTemplate, SubscriptionTier> = {
  default: 'free',
  classic: 'free',
  simple: 'pro',
  modern: 'enterprise',
  professional: 'enterprise',
  creative: 'enterprise',
};

/**
 * Check if a template is available for a given tier (synchronous, client-safe)
 */
export function isTemplateAvailable(
  userTier: SubscriptionTier,
  templateId: InvoiceTemplate
): boolean {
  const requiredTier = TEMPLATE_TIERS[templateId];
  if (!requiredTier) return false;
  return hasAccessToTier(userTier, requiredTier);
}

/**
 * Get the required tier for a template
 */
export function getTemplateTier(templateId: InvoiceTemplate): SubscriptionTier {
  return TEMPLATE_TIERS[templateId] || 'free';
}
