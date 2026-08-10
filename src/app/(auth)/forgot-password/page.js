"use client";
import Link from "next/link";

export default function ForgotPassword() {
  return (
    <main className="auth">
      <section className="auth-card">
        <div className="auth-brand">⌘ TaskMatrix</div>
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h1>Reset your password.</h1>
        <p className="auth-copy">Enter your email and we’ll send a reset link.</p>
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            Email address
            <input type="email" placeholder="Email address" required />
          </label>
          <button className="primary wide">Send reset link</button>
        </form>
        <p className="auth-footer"><Link href="/login">← Back to sign in</Link></p>
      </section>
    </main>
  );
}
