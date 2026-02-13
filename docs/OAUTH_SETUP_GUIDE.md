# OAuth Configuration Guide

You are encountering a `bad_oauth_state` error because your production environment's callback URLs are not fully configured in Supabase and LinkedIn.

Follow these steps EXACTLY to fix the issue.

## 1. Supabase Configuration (Critical)

1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project (`cloudbaud` / `mvyavzjzdinelcufpzek`).
3.  Go to **Authentication > URL Configuration**.
4.  **Site URL**: Set this to `https://cloudbaud.com`.
5.  **Redirect URLs**: You MUST add the following URLs to the allowlist. The error happens because `https://cloudbaud.com/portal` is likely missing.
    - `https://cloudbaud.com/portal`
    - `https://www.cloudbaud.com/portal`
    - `https://cloudbaud.netlify.app/portal`
    - `http://localhost:17117/portal`

## 2. LinkedIn Developer Portal

1.  Log in to the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps).
2.  Select your App.
3.  Go to the **Auth** tab.
4.  Under **Authorized redirect URLs for your app**, ensure you have this EXACT URL:
    - `https://mvyavzjzdinelcufpzek.supabase.co/auth/v1/callback`
    - _(Note: This is your unique Supabase callback URL. Do not use your own domain here.)_

## 3. Netlify / Environment

1.  Ensure your `.env.production` on Netlify has the correct `VITE_SUPABASE_URL` (we verified this earlier).
2.  **Important:** Always access your site via `https://` (Netlify enforces this, but avoid mixed content).

## 4. Verification

After updating these settings:

1.  Clear your browser cookies for `cloudbaud.com`.
2.  Try logging in again.
3.  If it fails, check the URL for `error_description`.
