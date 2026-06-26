export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-canvas px-5 py-12">
      <div className="aurora-bg" />
      {children}
    </div>
  );
}
