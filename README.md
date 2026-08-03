# Liberty Legacy Bank — Vercel prototype

This is a fictional, non-operational financial-interface prototype prepared for Vercel. All balances, transactions, documents, messages, names, and account details are synthetic. It does not provide banking services and must not be used to collect banking credentials or real financial information.

## What changed for Vercel

- Standard Next.js build and runtime
- Auth.js Google OAuth instead of OpenAI Sites authentication
- Verified Google email required before the synthetic dashboard appears
- JWT-backed session with no application database required
- Vercel framework configuration included

The application never sees or stores a Google password.

## Deploy from GitHub to Vercel

1. Extract the ZIP and push its contents to a new GitHub repository.
2. In Vercel, select **Add New → Project** and import that repository.
3. Keep the detected framework as **Next.js**.
4. Add these environment variables in the Vercel project settings:
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
5. Deploy the project.

Generate `AUTH_SECRET` with `npx auth secret`, or use another cryptographically secure random value. Never commit real secrets to GitHub.

## Configure Google OAuth

Create a Web application OAuth client in Google Cloud Console. Add the following authorized redirect URI, replacing the domain with your Vercel production domain:

```text
https://YOUR-PROJECT.vercel.app/api/auth/callback/google
```

For local development, also add:

```text
http://localhost:3000/api/auth/callback/google
```

Copy the Google client ID and secret into the corresponding Vercel environment variables, then redeploy. If you later attach a custom domain, add its callback URL to Google as well.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Replace the placeholder values in `.env.local` before testing Google sign-in.

## Important limitations

- Chat messages, profile edits, filters, and settings remain only in the current browser session.
- No database is connected.
- No real accounts, transfers, documents, or customer-service system exists.
- Google sign-in proves identity only; it does not grant financial rights or connect financial data.
- Add server-side authorization rules before using this pattern for any legitimate private application.
