import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
