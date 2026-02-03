import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export async function getSubscriptionByUserId(
  userId: string
): Promise<Subscription | null> {
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return result[0] || null;
}

export async function getSubscriptionByStripeCustomerId(
  customerId: string
): Promise<Subscription | null> {
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, customerId))
    .limit(1);
  return result[0] || null;
}

export async function createSubscription(data: {
  userId: string;
  stripeCustomerId: string;
}): Promise<Subscription> {
  const results = await db.insert(subscriptions).values(data).returning();
  const result = results[0];
  if (!result) {
    throw new Error('Failed to create subscription');
  }
  return result;
}

export async function updateSubscription(
  stripeCustomerId: string,
  data: Partial<
    Omit<Subscription, 'id' | 'userId' | 'stripeCustomerId' | 'createdAt'>
  >
): Promise<Subscription | null> {
  const [result] = await db
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .returning();
  return result || null;
}

export async function updateSubscriptionBySubscriptionId(
  stripeSubscriptionId: string,
  data: Partial<
    Omit<Subscription, 'id' | 'userId' | 'stripeCustomerId' | 'createdAt'>
  >
): Promise<Subscription | null> {
  const [result] = await db
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .returning();
  return result || null;
}
