import { Suspense } from "react";
import { NavBar } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <NavBar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
