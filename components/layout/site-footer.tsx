import React from "react";
import Link from "next/link";
import { FiGithub, FiTwitter } from "react-icons/fi";
import { ModeToggle } from "./mode-toggle";

const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center py-8">
        <div className="mb-2 md:mb-0">
          <h2 className="text-xl font-bold font-mono">Relaycode</h2>
          <p className="mt-2">Simplifying Polkadot ecosystem interactions</p>
        </div>
        <div className="flex space-x-8">
          <p>&copy; 2024 Relaycode. All rights reserved.</p>
          <Link
            href="https://github.com/itsyogesh/relaycode"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            <FiGithub size={24} />
          </Link>
          <Link
            href="https://twitter.com/itsyogesh18"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            <FiTwitter size={24} />
          </Link>
          <ModeToggle />
        </div>
      </div>
    </footer>
  );
};

export { SiteFooter };
