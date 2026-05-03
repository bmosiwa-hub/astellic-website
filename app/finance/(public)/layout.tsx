export const metadata = {
  robots: { index: false, follow: false },
};

export default function PublicFinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}
