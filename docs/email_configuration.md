# Supabase Email Configuration (Zoho Mail)

This guide details how to configure Zoho Mail as the custom SMTP provider for Supabase to send Magic Links and other transactional emails.

## 1. Zoho Mail SMTP Settings

Go to your **[Supabase Dashboard](https://supabase.com/dashboard/project/_/auth/smtp)** > **Settings** > **Authentication** > **SMTP Settings**.

Enable **Custom SMTP** and use the following settings:

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Sender Email** | `your-email@yourdomain.com` | Must match your Zoho login email. |
| **Sender Name** | `CloudBaud` | The name users will see in their inbox. |
| **Host** | `smtppro.zoho.com` | Use this for **paid/domain-based** accounts. |
| **Host (Alternative)**| `smtp.zoho.com` | Use this **ONLY** for free personal accounts (@zoho.com). |
| **Port** | `465` | Recommended for SSL. |
| **Minimum TLS Version** | `default` | Leave as default. |
| **Username** | `your-email@yourdomain.com` | Your full email address. |
| **Password** | `YOUR_APP_PASSWORD` | **Do not use your login password** (see below). |

## 2. Generating an App Password (Required)

If you have Two-Factor Authentication (2FA) enabled on Zoho (which is highly recommended), your regular login password **will not work**. You must generate an Application-Specific Password.

1. Log in to your [Zoho Accounts](https://accounts.zoho.com/) panel.
2. Navigate to **Security** in the sidebar.
3. Click on **App Passwords**.
4. Click **Generate New Password**.
5. Enter an app name (e.g., "Supabase" or "CloudBaud").
6. Copy the generated password (without spaces) and paste it into the **Password** field in Supabase.

## 3. Configuring Redirect URLs

To ensure Magic Links work correctly in both development and production, you must whitelist your Redirect URLs.

Go to **Authentication** > **URL Configuration** > **Redirect URLs** in Supabase.

Add the following (ensure they match your usage exactly):

* **Development**:
  * `http://localhost:17117/*` (Note: Zoho/Supabase might require HTTPS, see troubleshooting below)
  * `https://localhost:17117/*` (If using SSL via local proxy)
* **Production**:
  * `https://your-production-domain.com/*`

## 4. Customizing the Email Template

To brand your emails:

1. Go to **Authentication** > **Email Templates**.
2. Select **Magic Link**.
3. You can use standard HTML/CSS.
4. **Crucial Variable**: You **MUST** include `{{ .ConfirmationURL }}` or `{{ .Token }}` in the body so users can log in.

### Example Template Snippet

```html
<h2>Login to CloudBaud</h2>
<p>Click the button below to sign in:</p>
<a href="{{ .ConfirmationURL }}" style="padding: 10px 20px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 5px;">
  Sign In
</a>
```

## Troubleshooting

* **"Redirect URL not allowed"**: Ensure the URL in your browser (`http` vs `https`) exactly matches one of the entries in your "Redirect URLs" list.
* **Emails going to Spam**: Ensure your domain has proper **DKIM** and **SPF** records set up in your DNS settings (managed in Zoho Mail Control Panel).
