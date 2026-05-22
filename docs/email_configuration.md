# Supabase Email Configuration (Resend)

This guide describes how to use **Resend** as the custom SMTP provider for Supabase (magic links, confirmations, and other auth email). DNS and sending domain should be **verified in the Resend dashboard** before relying on production deliverability.

## 1. Resend SMTP settings (Supabase)

Go to **[Supabase Dashboard](https://supabase.com/dashboard/project/_/auth/smtp)** → **Project Settings** → **Authentication** → **SMTP Settings**.

Enable **Custom SMTP** and use:

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Sender email** | `noreply@yourdomain.com` (or your chosen address) | Must use a domain you added and verified in Resend. |
| **Sender name** | `CloudBaud` | Shown in the inbox. |
| **Host** | `smtp.resend.com` | Resend SMTP endpoint. |
| **Port** | `465` | SSL (recommended). Alternatively `587` with STARTTLS per Resend docs. |
| **Minimum TLS version** | default | Leave as default unless your org requires otherwise. |
| **Username** | `resend` | Literal string `resend` (Resend SMTP auth). |
| **Password** | Your **Resend API key** | Create under [Resend API Keys](https://resend.com/api-keys). Treat like a secret; rotate if exposed. |

Official reference: [Send emails using Supabase with SMTP](https://resend.com/docs/send-with-supabase-smtp).

## 2. API key and environments

- **Supabase SMTP “password”** is the Resend API key used only in the Supabase dashboard (not in the front-end bundle).
- For **Netlify** or other automation that calls Resend over HTTP, store the same key as a **server-side** env var (never `VITE_*`).

## 3. Configuring redirect URLs

Go to **Authentication** → **URL Configuration** in Supabase.

1. **Site URL**:
   * Set this to `http://localhost:17117`

2. **Redirect URLs**:
   * Add the following allowed patterns to match your local multi-SPA dev environment and production:
     * `http://localhost:17117/*` (Main Portal)
     * `http://localhost:17118/*` (Finance SPA)
     * `https://your-production-domain.com/*` (Production fallback)

## 4. Customizing the email template

1. **Authentication** → **Email Templates** → e.g. **Magic Link**.
2. Use HTML/CSS as needed.
3. Include **`{{ .ConfirmationURL }}`** or **`{{ .Token }}`** so sign-in links work.

### Example snippet

```html
<h2>Login to CloudBaud</h2>
<p>Click the button below to sign in:</p>
<a href="{{ .ConfirmationURL }}" style="padding: 10px 20px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 5px;">
  Sign In
</a>
```

## 5. Troubleshooting

* **“Redirect URL not allowed”**: The browser URL must exactly match an allowed redirect entry (`http` vs `https`, path, port).
* **Spam or bounces**: In Resend, confirm **domain** and **DNS** (SPF/DKIM) show verified; add any records Resend still asks for. Supabase “from” address must match that domain.
* **SMTP auth errors**: Username must be `resend`; password is the API key, not your Resend account password.

---

*Previously this project documented Zoho Mail for the same Supabase SMTP screen; that path is superseded once Resend is verified and configured as above.*
