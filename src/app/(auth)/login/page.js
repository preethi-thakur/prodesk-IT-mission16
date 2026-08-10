"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CommandLineIcon } from "@heroicons/react/24/outline";

export default function Login() {
  const router = useRouter();

  return (
    <main className="auth">
      <section className="auth-card">
        <div className="auth-brand"><CommandLineIcon />TaskMatrix</div>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Work, clearly.</h1>
        <p className="auth-copy">Sign in to continue to your workspace.</p>
        <form onSubmit={(event) => { event.preventDefault(); router.push("/"); }}>
          <label>
            Email address
            <input type="email" placeholder="Email address" required />
          </label>
          <label>
            Password
            <input type="password" placeholder="Password" required />
          </label>
          <Link href="/forgot-password" className="forgot">Forgot password?</Link>
          <button className="primary wide">Sign in to TaskMatrix</button>
        </form>
        <div className="or"><span />or continue with<span /></div>
        <button className="sso">◉ Continue with Google</button>
        <p className="auth-footer">New to TaskMatrix? <Link href="/register">Create an account</Link></p>
      </section>
    </main>
  );
}
