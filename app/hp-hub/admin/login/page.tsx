import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in | HP-Hub Admin",
  robots: { index: false, follow: false },
};

export default function HpHubLoginPage() {
  return (
    <main className="min-h-screen bg-brand-light flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">Astellic</p>
          <p className="text-2xl font-bold text-brand-navy mt-1">HP-Hub Admin</p>
          <p className="text-sm text-brand-muted mt-1">Health Policy Intelligence Hub repository management</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-xs text-brand-muted mt-6 leading-relaxed">
          Access is granted by an HP-Hub Super Admin. An Astelfin account alone does not give access to HP-Hub.
        </p>
      </div>
    </main>
  );
}
