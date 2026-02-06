import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold font-heading tracking-tight">
        {title}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        {description || "This page is coming soon. Stay tuned for updates."}
      </p>
      <Link href="/builder" className="mt-8">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Builder
        </Button>
      </Link>
    </div>
  );
}
