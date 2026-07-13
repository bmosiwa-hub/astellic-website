import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Astelfin IMS",
  robots: { index: false, follow: false },
};

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;

  if (role === "STAFF" || role === "CONSULTANT") {
    redirect("/astelfin_26/my");
  }

  redirect("/astelfin_26/overview");
}
