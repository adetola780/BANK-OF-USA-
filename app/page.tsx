import DashboardClient from "./DashboardClient";
<<<<<<< HEAD
import { SignInButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

=======
import { auth, signIn } from "@/auth";

export const dynamic = "force-dynamic";

async function signInWithGoogle() {
  "use server";
  await signIn("google", { redirectTo: "/" });
}

>>>>>>> 7cf868ea9fa66e786b2b39814e2a3fe2a7401656
function LoginScreen() {
  return (
    <main className="login-page">
      <header className="login-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"><span>LL</span></div>
          <div className="brand-copy">
            <strong>Liberty Legacy Bank</strong>
            <span>Fictional interface prototype</span>
          </div>
        </div>
        <span className="prototype-chip">🇺🇸 Non-operational prototype</span>
      </header>

      <section className="login-shell">
        <div className="login-story">
          <p className="eyebrow light">Synthetic financial interface</p>
          <h1>A legacy deserves a thoughtful home.</h1>
          <p className="login-lede">
            Explore a fictional account-management interface using synthetic information.
            No real accounts, funds, transfers, or banking services are provided.
          </p>

          <div className="preview-balance" aria-label="Synthetic account preview">
            <div><span>Synthetic inheritance account</span><strong>$845,387.00</strong></div>
            <span className="preview-status">Sample only</span>
          </div>

          <div className="login-points">
            <span><b>01</b> Synthetic account reporting</span>
            <span><b>02</b> Session-only support chat</span>
            <span><b>03</b> Sample estate documents</span>
          </div>
        </div>

        <div className="login-panel-wrap">
          <div className="login-card">
            <div className="login-card-heading">
              <span className="mini-mark" aria-hidden="true">L</span>
              <div><p className="eyebrow">Prototype access</p><h2>Continue securely</h2></div>
            </div>

            <p className="login-note">
<<<<<<< HEAD
              Clerk securely emails you a one-time sign-in code. This prototype never receives or stores a password.
            </p>

            <SignInButton mode="modal" forceRedirectUrl="/">
              <button className="primary-button login-button" type="submit">
                <span className="google-login-mark" aria-hidden="true">@</span>
                Continue with email
                <span aria-hidden="true">→</span>
              </button>
            </SignInButton>

            <div className="auth-provider-note">
              <span className="google-mark" aria-hidden="true">i</span>
              <span><b>Email verification only</b><small>Signing in does not create a bank account or connect financial data.</small></span>
=======
              Google handles authentication. This prototype never receives or stores your Google password.
            </p>

            <form action={signInWithGoogle}>
              <button className="primary-button login-button" type="submit">
                <span className="google-login-mark" aria-hidden="true">G</span>
                Continue with Google
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <div className="auth-provider-note">
              <span className="google-mark" aria-hidden="true">i</span>
              <span><b>Identity only</b><small>Signing in does not create a bank account or connect financial data.</small></span>
>>>>>>> 7cf868ea9fa66e786b2b39814e2a3fe2a7401656
            </div>
          </div>
          <p className="legal-note">Fictional, non-operational prototype. Use no real financial information.</p>
        </div>
      </section>
    </main>
  );
}

export default async function Home() {
<<<<<<< HEAD
  const { userId } = await auth();

  if (!userId) return <LoginScreen />;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || "verified-viewer@example.invalid";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;
  const displayName = fullName || email;

  return (
    <DashboardClient
      viewer={{ displayName, email, fullName }}
=======
  const session = await auth();
  const email = session?.user?.email;

  if (!email) return <LoginScreen />;

  const displayName = session.user?.name || email;

  return (
    <DashboardClient
      viewer={{ displayName, email, fullName: session.user?.name || null }}
      signInPath="/api/auth/signin"
      signOutPath="/api/auth/signout"
>>>>>>> 7cf868ea9fa66e786b2b39814e2a3fe2a7401656
    />
  );
}
