export const metadata = {
  robots: { index: false, follow: false },
};

export default function PublicFinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex items-center justify-center">
      {children}
    </div>
  );
}
