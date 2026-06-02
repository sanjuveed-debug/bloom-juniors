# Supabase + Vercel Free Setup

This app can stay on Vercel Free for frontend hosting while Supabase Free handles authentication and cloud data.

## 1. Create Supabase Project

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.

The schema enables Row Level Security so each authenticated parent can only read and write their own guardian record, child profiles, and progress.

## 2. Authentication Settings

Use Supabase Auth with email and password.

Recommended MVP setting:

- Disable email confirmation while testing with invited families.
- Enable email confirmation before wider public launch.

The app uses:

- account password for secure Supabase login
- 4-digit parent PIN only as a Parent Zone / child-safety lock

Do not treat the 4-digit PIN as the cloud account password.

## 3. Environment Variables

Add these locally and in Vercel Project Settings:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The anon key is safe to expose in a browser app when Row Level Security is enabled correctly. Never add the Supabase service role key to this frontend.

## 4. Vercel Free Plan

No paid Vercel features are required for this integration. The React/Vite app talks directly to Supabase from the browser using Supabase Auth and RLS-protected tables.

## 5. Data Stored

Supabase stores:

- parent/guardian profile
- child profiles
- per-child progress JSON

Existing localStorage data is still used as a fallback when Supabase env vars are missing, and local profiles/progress are uploaded when a cloud session becomes available.
