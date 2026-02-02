/**
 * Webhook Routes
 * 
 * Handles incoming webhooks from Stripe, OAuth providers, and other services.
 */

import { Hono } from 'hono';
import { prisma } from '@eduforge/database';

export const webhookRoutes = new Hono();

// Stripe webhook secret (from environment)
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * POST /webhooks/stripe - Handle Stripe webhook events
 */
webhookRoutes.post('/stripe', async (c) => {
  const signature = c.req.header('stripe-signature');
  
  if (!signature) {
    return c.json({ error: 'Missing signature' }, 400);
  }

  // Get raw body for signature verification
  const rawBody = await c.req.text();

  // In production, verify the webhook signature using Stripe SDK:
  // const event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);

  // For now, parse the body directly
  let event: {
    type: string;
    data: {
      object: Record<string, unknown>;
    };
  };
  
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    return c.json({ error: 'Invalid payload' }, 400);
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as {
        customer_email?: string;
        subscription?: string;
        metadata?: {
          userId?: string;
          tier?: string;
        };
      };

      if (session.metadata?.userId && session.metadata?.tier) {
        await prisma.subscription.upsert({
          where: { userId: session.metadata.userId },
          update: {
            tier: session.metadata.tier as 'STUDENT_PRO' | 'FAMILY_PRO' | 'INSTITUTION',
            status: 'ACTIVE',
            stripeSubscriptionId: session.subscription as string,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          create: {
            userId: session.metadata.userId,
            tier: session.metadata.tier as 'STUDENT_PRO' | 'FAMILY_PRO' | 'INSTITUTION',
            status: 'ACTIVE',
            stripeSubscriptionId: session.subscription as string,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        console.log(`Subscription activated for user ${session.metadata.userId}`);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as {
        id: string;
        status: string;
        current_period_start: number;
        current_period_end: number;
        cancel_at_period_end: boolean;
      };

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: mapStripeStatus(subscription.status),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });

      console.log(`Subscription ${subscription.id} updated`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as {
        id: string;
      };

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: 'CANCELLED',
          tier: 'FREE',
        },
      });

      console.log(`Subscription ${subscription.id} cancelled`);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as {
        subscription: string;
        customer_email: string;
      };

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: invoice.subscription },
        data: { status: 'PAST_DUE' },
      });

      // In production, send email notification about payment failure
      console.log(`Payment failed for subscription ${invoice.subscription}`);
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as {
        subscription: string;
        amount_paid: number;
      };

      // Update subscription status back to active
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: invoice.subscription },
        data: { status: 'ACTIVE' },
      });

      console.log(`Invoice paid for subscription ${invoice.subscription}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return c.json({ received: true });
});

/**
 * POST /webhooks/oauth/google - Google OAuth callback
 */
webhookRoutes.post('/oauth/google', async (c) => {
  const body = await c.req.json();
  
  // This would be handled by the auth flow, but webhooks can receive
  // account updates, deauthorization notices, etc.
  
  if (body.type === 'account_deauthorized') {
    // Remove OAuth connection
    await prisma.oAuthAccount.deleteMany({
      where: {
        provider: 'google',
        providerAccountId: body.user_id,
      },
    });
  }

  return c.json({ received: true });
});

/**
 * POST /webhooks/clever - Clever SSO webhooks (for schools)
 */
webhookRoutes.post('/clever', async (c) => {
  const body = await c.req.json();
  
  // Clever sends webhooks for:
  // - Student roster updates
  // - Teacher changes
  // - School data sync

  switch (body.type) {
    case 'students.created':
    case 'students.updated': {
      // Sync student data from Clever
      const student = body.data;
      console.log(`Clever student sync: ${student.id}`);
      // In production, create/update student records
      break;
    }

    case 'teachers.created':
    case 'teachers.updated': {
      const teacher = body.data;
      console.log(`Clever teacher sync: ${teacher.id}`);
      break;
    }

    case 'sections.created':
    case 'sections.updated': {
      // Sections = classes in Clever
      const section = body.data;
      console.log(`Clever section sync: ${section.id}`);
      break;
    }

    case 'students.deleted':
    case 'teachers.deleted':
    case 'sections.deleted': {
      console.log(`Clever deletion: ${body.type}`);
      break;
    }
  }

  return c.json({ received: true });
});

/**
 * POST /webhooks/sendgrid - SendGrid email events
 */
webhookRoutes.post('/sendgrid', async (c) => {
  const events = await c.req.json();
  
  // SendGrid sends arrays of email events
  for (const event of events) {
    switch (event.event) {
      case 'delivered':
        console.log(`Email delivered: ${event.email}`);
        break;
      case 'bounce':
        console.log(`Email bounced: ${event.email}`);
        // Mark email as invalid
        await prisma.user.updateMany({
          where: { email: event.email },
          data: { emailVerified: false },
        });
        break;
      case 'spam':
        console.log(`Marked as spam: ${event.email}`);
        break;
      case 'unsubscribe':
        // Handle unsubscribe
        break;
    }
  }

  return c.json({ received: true });
});

/**
 * POST /webhooks/content-update - Internal webhook for content updates
 */
webhookRoutes.post('/content-update', async (c) => {
  // Triggered when curriculum content is updated
  // Used to invalidate caches, update search indexes, etc.
  
  const body = await c.req.json();
  
  if (body.type === 'curriculum_updated') {
    // Invalidate RAG cache for this curriculum
    console.log(`Curriculum updated: ${body.curriculumId}`);
    
    // In production:
    // - Clear Pinecone vectors for updated content
    // - Re-index changed documents
    // - Notify affected sessions
  }

  return c.json({ received: true });
});

// Helper function to map Stripe status to our status
function mapStripeStatus(stripeStatus: string): 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIAL' {
  switch (stripeStatus) {
    case 'active':
      return 'ACTIVE';
    case 'past_due':
      return 'PAST_DUE';
    case 'canceled':
    case 'unpaid':
      return 'CANCELLED';
    case 'trialing':
      return 'TRIAL';
    default:
      return 'ACTIVE';
  }
}
