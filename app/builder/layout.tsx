import { NavBar } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

interface BuilderLayoutProps {
  children: React.ReactNode;
}

export default function BuilderLayout({ children }: BuilderLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
