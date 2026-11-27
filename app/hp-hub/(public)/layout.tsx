import type { Metadata } from "next";
import { HP_HUB_NAME } from "@/lib/hp-hub/constants";
import { hpHubIndexable } from "@/lib/hp-hub/visibility";

export function generateMetadata(): Metadata {
  return {
    title: {
      default: `${HP_HUB_NAME} (HP-Hub) | Astellic`,
      template: "%s | HP-Hub | Astellic",
    },
    description:
      "Discover health policies, strategies, guidelines, research and reports from Malawi and across Africa. A curated resource for researchers, policymakers, practitioners and development partners.",
    openGraph: { siteName: `${HP_HUB_NAME}, Astellic`, type: "website" },
    // Pre-launch: keep HP-Hub out of search engines (see hpHubIndexable).
    ...(hpHubIndexable() ? {} : { robots: { index: false, follow: false } }),
  };
}

export default function HpHubPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white">
      {children}
    </div>
  );
}
