import { redirect } from "next/navigation";

// The old "Our Projects" pages are superseded by the Astellic in Action proof
// platform. Redirect so any inbound links land on the curated portfolio.
export default function Page() {
  redirect("/astellic-in-action");
}
