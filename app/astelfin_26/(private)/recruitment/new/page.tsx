import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PostingForm from "./PostingForm";

export const metadata = { title: "New Job Posting | Astelfin IMS", robots: { index: false, follow: false } };

export default async function NewPostingPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Job Posting</h1>
      <PostingForm />
    </div>
  );
}
