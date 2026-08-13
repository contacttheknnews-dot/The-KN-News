// Shared shell for legal / informational pages.
export default function StaticPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-site py-8 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-extrabold border-b-2 border-kn-red pb-3">
        {title}
      </h1>
      {subtitle && <p className="mt-3 text-kn-muted">{subtitle}</p>}
      <div className="article-body mt-6">{children}</div>
    </div>
  );
}
