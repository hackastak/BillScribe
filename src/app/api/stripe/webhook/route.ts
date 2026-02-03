import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import {
  updateSubscription,
  updateSubscriptionBySubscriptionId,
} from '@/lib/db/queries/subscriptions';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionItem = subscription.items.data[0];
        await updateSubscription(subscription.customer as string, {
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscriptionItem?.price.id || null,
          status: subscription.status as
            | 'trialing'
            | 'active'
            | 'canceled'
            | 'incomplete'
            | 'incomplete_expired'
            | 'past_due'
            | 'unpaid'
            | 'paused',
          currentPeriodStart: subscriptionItem
            ? new Date(subscriptionItem.current_period_start * 1000)
            : null,
          currentPeriodEnd: subscriptionItem
            ? new Date(subscriptionItem.current_period_end * 1000)
            : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionBySubscriptionId(subscription.id, {
          status: 'canceled',
          stripeSubscriptionId: null,
          stripePriceId: null,
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          invoice.parent?.subscription_details?.subscription;
        if (subscriptionId) {
          const subId =
            typeof subscriptionId === 'string'
              ? subscriptionId
              : subscriptionId.id;
          const subscription = await stripe.subscriptions.retrieve(subId);
          const subscriptionItem = subscription.items.data[0];
          await updateSubscription(invoice.customer as string, {
            status: subscription.status as
              | 'trialing'
              | 'active'
              | 'canceled'
              | 'incomplete'
              | 'incomplete_expired'
              | 'past_due'
              | 'unpaid'
              | 'paused',
            currentPeriodStart: subscriptionItem
              ? new Date(subscriptionItem.current_period_start * 1000)
              : null,
            currentPeriodEnd: subscriptionItem
              ? new Date(subscriptionItem.current_period_end * 1000)
              : null,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          invoice.parent?.subscription_details?.subscription;
        if (subscriptionId) {
          await updateSubscription(invoice.customer as string, {
            status: 'past_due',
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
