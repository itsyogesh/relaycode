import { NavBar } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

interface StudioLayoutProps {
  children: React.ReactNode;
}

export default function StudioLayout({ children }: StudioLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
