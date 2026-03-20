import { NavBar } from "@/components/layout/site-header";

interface StudioLayoutProps {
  children: React.ReactNode;
}

export default function StudioLayout({ children }: StudioLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <NavBar />
      <main className="flex flex-col flex-1 min-h-0">{children}</main>
    </div>
  );
}
