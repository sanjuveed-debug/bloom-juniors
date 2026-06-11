-- Premium subscription support (Stripe)
-- Run in the Supabase SQL editor once.

ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS premium_status TEXT;
ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.guardian_profiles ADD COLUMN IF NOT EXISTS premium_since TIMESTAMPTZ;

-- Look up guardians quickly by Stripe customer when webhooks arrive
CREATE INDEX IF NOT EXISTS guardian_profiles_stripe_customer_idx
  ON public.guardian_profiles (stripe_customer_id);

-- premium_status values: 'active' | 'past_due' | 'canceled' | NULL (never subscribed)
