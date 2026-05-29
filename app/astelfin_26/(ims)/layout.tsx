import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InactivityGuard from "@/components/finance/InactivityGuard";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function ImsHomeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  return (
    <>
      <InactivityGuard />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 flex items-center justify-center p-8">
          {children}
        </main>
      </div>
    </>
  );
}
