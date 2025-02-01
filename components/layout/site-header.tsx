"use client";

import { MainNavItem } from "@/types";

import { MainNav } from "@/components/layout/main-nav";
import { ModeToggle } from "@/components/layout/mode-toggle";
import useScroll from "@/hooks/use-scroll";

import { ConnectButton } from "@/components/shared/connect-button";

interface NavBarProps {
  items?: MainNavItem[];
  children?: React.ReactNode;
  rightElements?: React.ReactNode;
  scroll?: boolean;
}

export function NavBar({
  items,
  children,
  rightElements,
  scroll = false,
}: NavBarProps) {
  const scrolled = useScroll(50);
  return (
    <header
      className={`sticky top-0 z-40 flex w-full justify-center bg-background/60 backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-background/0") : "border-b"
      }`}
    >
      <div className="container flex h-16 items-center justify-between py-8">
        <MainNav items={items}>{children}</MainNav>

        <div className="flex items-center space-x-3">
          {rightElements}
          <ConnectButton />
          <div className="ml-8">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
