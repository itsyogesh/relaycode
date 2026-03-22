"use client";

import { usePathname } from "next/navigation";
import { MainNavItem } from "@/types";

import { MainNav } from "@/components/layout/main-nav";
import { ModeToggle } from "@/components/layout/mode-toggle";
import useScroll from "@/hooks/use-scroll";

import { ConnectButton } from "@/components/shared/connect-button";
import { ChainSelector } from "@/components/shared/chain-selector";

interface NavBarProps {
  items?: MainNavItem[];
  children?: React.ReactNode;
  rightElements?: React.ReactNode;
  scroll?: boolean;
  centerElement?: React.ReactNode;
}

export function NavBar({
  items,
  children,
  rightElements,
  scroll = false,
  centerElement,
}: NavBarProps) {
  const scrolled = useScroll(50);
  const pathname = usePathname();
  const isToolPage = pathname?.startsWith("/studio") || pathname?.startsWith("/builder");

  return (
    <header
      className={`sticky top-0 z-40 flex w-full justify-center bg-background/60 backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-background/0") : "border-b"
      }`}
    >
      <div
        className={`flex items-center justify-between w-full ${
          isToolPage ? "px-3 py-4" : "container py-4"
        }`}
      >
        <MainNav items={items}>{children}</MainNav>

        {/* Center element (e.g., active file name on Studio) */}
        {centerElement && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            {centerElement}
          </div>
        )}

        <div className="flex items-center space-x-2 sm:space-x-3">
          {rightElements}
          <ChainSelector />
          <ConnectButton />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
