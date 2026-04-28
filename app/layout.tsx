import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Astellic | Research. Advisory. Implementation.",
    template: "%s | Astellic",
  },
  description:
    "Astellic is a research, advisory, and implementation firm working at the intersection of evidence, policy, and delivery across Africa.",
  metadataBase: new URL("https://astellic.com"),
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
      </body>
    </html>
  );
}
