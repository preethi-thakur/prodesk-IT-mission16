"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  return (
    <main className="auth">
      <section className="auth-card">
        <div className="auth-brand">⌘ TaskMatrix</div>
        <p className="eyebrow">GET STARTED</p>
        <h1>Build momentum.</h1>
        <p className="auth-copy">Create a workspace for your team in minutes.</p>
        <form onSubmit={(event) => { event.preventDefault(); router.push("/"); }}>
          <label>
            Your name
            <input placeholder="Your name" required />
          </label>
          <label>
            Work email
            <input type="email" placeholder="Email address" required />
          </label>
          <label>
            Workspace name
            <input placeholder="Workspace name" required />
          </label>
          <label>
            Password
            <input type="password" placeholder="Password" required />
          </label>
          <button className="primary wide">Create workspace</button>
        </form>
        <p className="auth-footer">Already have an account? <Link href="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
