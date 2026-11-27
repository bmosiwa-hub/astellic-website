"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const input =
  "w-full h-11 rounded border border-gray-300 px-3 text-[15px] text-brand-navy focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 outline-none";

function safeCallback(raw: string | null): string {
  // Only allow returning to HP-Hub admin pages (no open redirects).
  return raw && raw.startsWith("/hp-hub/admin") && !raw.startsWith("//") ? raw : "/hp-hub/admin";
}

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallback(params.get("callbackUrl"));
  const [error, setError] = useState(params.get("error") === "no_access" ? "This account doesn't have HP-Hub access." : "");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: String(form.get("email") ?? "").trim().toLowerCase(),
      password: String(form.get("password") ?? ""),
      portal: "hphub",
      ipAddress: "client",
      userAgent: navigator.userAgent,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      // Deliberately generic: doesn't reveal whether the account exists or which system it can use.
      setError("Sign-in failed. Check your email and password, and that your account has HP-Hub access. Accounts lock for 30 minutes after 5 failed attempts.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-lg p-8 space-y-5">
      <h1 className="text-xl font-bold text-brand-navy">Sign in</h1>
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2.5">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-brand-navy mb-1.5">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" className={input} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-brand-navy mb-1.5">
          Password
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={input} />
      </div>
      <button type="submit" disabled={loading} className="w-full h-11 rounded bg-brand-navy text-white font-semibold hover:bg-brand-navy/90 disabled:opacity-60">
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
