import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import {
  getSubscriptionByUserId,
  createSubscription,
} from '@/lib/db/queries/subscriptions';
import { getProfile } from '@/lib/db/queries/profiles';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if customer already exists
    const existingSubscription = await getSubscriptionByUserId(user.id);
    if (existingSubscription) {
      return NextResponse.json({
        customerId: existingSubscription.stripeCustomerId,
      });
    }

    // Get user profile for customer metadata
    const profile = await getProfile(user.id);

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: profile?.fullName || undefined,
      metadata: {
        userId: user.id,
      },
    });

    // Save to database
    await createSubscription({
      userId: user.id,
      stripeCustomerId: customer.id,
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
