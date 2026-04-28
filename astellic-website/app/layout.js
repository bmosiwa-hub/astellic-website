import "./globals.css";

export const metadata = {
  title: "Astellic | Research · Advisory · Implementation",
  description:
    "Astellic is a research, advisory, and implementation firm working at the intersection of evidence, policy, and delivery across Africa.",
  keywords: "research, advisory, implementation, Africa, health systems, governance, policy",
  openGraph: {
    title: "Astellic | Research · Advisory · Implementation",
    description:
      "Working at the intersection of evidence, policy and delivery. We partner with governments, donors, and institutions across Africa.",
    type: "website",
    url: "https://www.astellic.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
