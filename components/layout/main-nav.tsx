"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import * as React from "react";
import { Menu } from "lucide-react";

import { MainNavItem } from "@/types";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { RelaycodeIcon } from "@/components/icons/relaycode-logo";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

interface MainNavProps {
  items?: MainNavItem[];
  children?: React.ReactNode;
}

export function MainNav({ items, children }: MainNavProps) {
  const segment = useSelectedLayoutSegment();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="hidden items-center space-x-2 md:flex">
        <RelaycodeIcon className="h-8 w-8" />
        <span className="tracking-sm hidden font-heading text-xl font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      {items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {items?.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "mt-1.5 flex items-center font-heading text-xl font-semibold transition-colors hover:text-foreground/80 sm:text-sm",
                item.href.startsWith(`/${segment}`)
                  ? "text-foreground"
                  : "text-foreground/60",
                item.disabled && "cursor-not-allowed opacity-80"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      ) : null}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="flex items-center space-x-2 md:hidden">
            <RelaycodeIcon className="h-6 w-6" />
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex flex-col gap-6 p-6 pt-12">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center space-x-2"
            >
              <RelaycodeIcon className="h-8 w-8" />
              <span className="font-heading text-xl font-bold">
                {siteConfig.name}
              </span>
            </Link>
            <nav className="grid gap-1">
              <Link
                href="/builder"
                onClick={() => setOpen(false)}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Builder
              </Link>
              {(items ?? []).map((item, index) => (
                <Link
                  key={index}
                  href={item.disabled ? "#" : item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
                    item.disabled && "cursor-not-allowed opacity-60"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
