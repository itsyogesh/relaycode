import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter } from "lucide-react";

const footerLinks = {
  build: [
    { name: "Extrinsic Builder", href: "/builder" },
    { name: "UI Components", href: "/components" },
    { name: "Substrate Tools", href: "/tools" },
    { name: "Form Templates", href: "/templates" },
  ],
  learn: [
    { name: "Documentation", href: "/docs" },
    { name: "Video Tutorials", href: "/tutorials" },
    { name: "API Reference", href: "/api-docs" },
    { name: "Security Audit", href: "/security" },
  ],
  community: [
    { name: "GitHub", href: "https://github.com/relaycode", icon: Github },
    { name: "Twitter", href: "https://twitter.com/relaycode", icon: Twitter },
    { name: "Blog", href: "/blog" },
    { name: "Discord", href: "/discord" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-16 sm:py-20 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold leading-6 text-foreground">
              Build
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              {footerLinks.build.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm leading-6 text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-6 text-foreground">
              Learn
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              {footerLinks.learn.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm leading-6 text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-6 text-foreground">
              Community
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              {footerLinks.community.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm leading-6 text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold leading-6 text-foreground">
              Subscribe to our newsletter
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Get the latest updates on new features and releases.
            </p>
            <form className="mt-6 sm:flex sm:max-w-md">
              <Input
                type="email"
                name="email"
                id="email-footer"
                placeholder="Enter your email"
                className="w-full min-w-0"
              />
              <Button
                type="submit"
                className="mt-4 sm:mt-0 sm:ml-4 sm:flex-shrink-0"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-16 flex items-center justify-between border-t border-muted pt-8">
          <p className="text-xs leading-5 text-muted-foreground">
            &copy; {new Date().getFullYear()} Relaycode. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/privacy"
              className="text-xs leading-5 text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs leading-5 text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
