# Liberty Legacy Bank — Vercel prototype

This is a fictional, non-operational financial-interface prototype prepared for Vercel. All balances, transactions, documents, messages, names, and account details are synthetic. It does not provide banking services and must not be used to collect banking credentials or real financial information.

## What changed for Vercel

- Standard Next.js build and runtime
<<<<<<< HEAD
- Clerk-managed email sign-in instead of Google OAuth
- One-time email verification codes; the application stores no passwords
- Clerk-managed sessions with no application database required
- Vercel framework configuration included

The application never sees or stores an email password.
=======
- Auth.js Google OAuth instead of OpenAI Sites authentication
- Verified Google email required before the synthetic dashboard appears
- JWT-backed session with no application database required
- Vercel framework configuration included

The application never sees or stores a Google password.
>>>>>>> 7cf868ea9fa66e786b2b39814e2a3fe2a7401656

## Deploy from GitHub to Vercel

1. Extract the ZIP and push its contents to a new GitHub repository.
2. In Vercel, select **Add New → Project** and import that repository.
3. Keep the detected framework as **Next.js**.
4. Add these environment variables in the Vercel project settings:
<<<<<<< HEAD
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
5. Deploy the project.

Copy both values from the Clerk Dashboard's **API Keys** page. Never commit real secrets to GitHub.

## Configure Clerk email codes

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com/).
2. Under **User & Authentication**, enable **Email address** and **Email verification code** for sign-up and sign-in.
3. Copy the publishable key and secret key from **API Keys** into Vercel.
4. Redeploy the Vercel project.

No Google Cloud project or OAuth callback is required.
=======
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
>>>>>>> 7cf868ea9fa66e786b2b39814e2a3fe2a7401656

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

<<<<<<< HEAD
Replace the placeholder values in `.env.local` before testing email sign-in.
=======
Replace the placeholder values in `.env.local` before testing Google sign-in.
>>>>>>> 7cf868ea9fa66e786b2b39814e2a3fe2a7401656

## Important limitations

- Chat messages, profile edits, filters, and settings remain only in the current browser session.
- No database is connected.
- No real accounts, transfers, documents, or customer-service system exists.
<<<<<<< HEAD
- Email verification proves control of an email address only; it does not grant financial rights or connect financial data.
=======
- Google sign-in proves identity only; it does not grant financial rights or connect financial data.
>>>>>>> 7cf868ea9fa66e786b2b39814e2a3fe2a7401656
- Add server-side authorization rules before using this pattern for any legitimate private application.
