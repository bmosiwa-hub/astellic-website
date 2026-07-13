import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: {
    default: "Astellic | Research. Advisory. Implementation.",
    template: "%s | Astellic",
  },
  description:
    "Astellic is a research, advisory, and implementation firm working at the intersection of evidence, policy, and delivery across Africa.",
  metadataBase: new URL("https://astellic.com"),
  icons: {
    icon: [
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-48.png", sizes: "any" },
    ],
    apple: { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isFinance = pathname.startsWith("/astelfin_26");
  const isHerVoice = pathname.startsWith("/hervoice_26");
  const isStandalone = isFinance || isHerVoice;

  return (
    <html lang="en">
      <body className={isFinance ? "flex min-h-screen bg-gray-50" : isHerVoice ? "min-h-screen" : "flex flex-col min-h-screen"}>
        {!isStandalone && <Header />}
        {isStandalone ? children : <main className="flex-1">{children}</main>}
        {!isStandalone && <Footer />}
        {!isStandalone && <CookieBanner />}
      </body>
    </html>
  );
}
