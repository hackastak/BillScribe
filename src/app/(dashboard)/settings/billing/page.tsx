import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSubscriptionByUserId } from '@/lib/db/queries/subscriptions';
import { BillingSettings } from '@/components/billing/billing-settings';
import { stripe } from '@/lib/stripe';
import { createSubscription } from '@/lib/db/queries/subscriptions';
import { getProfile } from '@/lib/db/queries/profiles';

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get or create subscription record (ensures Stripe customer exists)
  let subscription = await getSubscriptionByUserId(user.id);

  if (!subscription) {
    // Create Stripe customer on first visit to billing page
    const profile = await getProfile(user.id);
    const customer = await stripe.customers.create({
      email: user.email,
      name: profile?.fullName || undefined,
      metadata: {
        userId: user.id,
      },
    });

    subscription = await createSubscription({
      userId: user.id,
      stripeCustomerId: customer.id,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-fg-default)]">
          Billing
        </h1>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          Manage your subscription and billing information
        </p>
      </div>

      <BillingSettings subscription={subscription} />
    </div>
  );
}
