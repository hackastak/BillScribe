import { getSubscriptionByUserId } from '@/lib/db/queries/subscriptions';
import { getActiveClientCount } from '@/lib/db/queries/clients';
import { getMonthlyInvoiceCount } from '@/lib/db/queries/invoices';
import {
  getTierFromPriceId,
  getTierLimits,
  getTierDisplayName,
  type SubscriptionTier,
  type TierLimits,
} from './tiers';

export type UsageStats = {
  tier: SubscriptionTier;
  tierDisplayName: string;
  limits: TierLimits;
  usage: {
    clients: number;
    invoicesThisMonth: number;
  };
  canCreateClient: boolean;
  canCreateInvoice: boolean;
};

export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const subscription = await getSubscriptionByUserId(userId);

  // If no subscription or not active, default to free
  if (!subscription) {
    return 'free';
  }

  // Only active or trialing subscriptions count
  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return 'free';
  }

  return getTierFromPriceId(subscription.stripePriceId);
}

export async function canCreateClient(
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const tier = await getUserTier(userId);
  const limits = getTierLimits(tier);

  // Unlimited clients
  if (limits.maxClients === null) {
    return { allowed: true };
  }

  const currentCount = await getActiveClientCount(userId);

  if (currentCount >= limits.maxClients) {
    const tierName = getTierDisplayName(tier);
    return {
      allowed: false,
      reason: `You've reached the maximum of ${limits.maxClients} clients on the ${tierName} plan. Upgrade to add more active clients.`,
    };
  }

  return { allowed: true };
}

export async function canCreateInvoice(
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const tier = await getUserTier(userId);
  const limits = getTierLimits(tier);

  // Unlimited invoices
  if (limits.maxInvoicesPerMonth === null) {
    return { allowed: true };
  }

  const currentCount = await getMonthlyInvoiceCount(userId);

  if (currentCount >= limits.maxInvoicesPerMonth) {
    const tierName = getTierDisplayName(tier);
    return {
      allowed: false,
      reason: `You've reached your monthly invoice limit (${currentCount}/${limits.maxInvoicesPerMonth}) on the ${tierName} plan. Upgrade for more invoices.`,
    };
  }

  return { allowed: true };
}

export async function getUsageStats(userId: string): Promise<UsageStats> {
  const tier = await getUserTier(userId);
  const limits = getTierLimits(tier);

  const [clientCount, invoiceCount] = await Promise.all([
    getActiveClientCount(userId),
    getMonthlyInvoiceCount(userId),
  ]);

  const canClient =
    limits.maxClients === null || clientCount < limits.maxClients;
  const canInvoice =
    limits.maxInvoicesPerMonth === null ||
    invoiceCount < limits.maxInvoicesPerMonth;

  return {
    tier,
    tierDisplayName: getTierDisplayName(tier),
    limits,
    usage: {
      clients: clientCount,
      invoicesThisMonth: invoiceCount,
    },
    canCreateClient: canClient,
    canCreateInvoice: canInvoice,
  };
}
