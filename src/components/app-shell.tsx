"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Car, Home, Receipt, Wallet } from "lucide-react";

import { cn } from "../lib/utils";

const tabs = [
  { href: "/groups", label: "Groups", icon: Home },
  { href: "/receipts", label: "Receipts", icon: Receipt },
  { href: "/payments", label: "Payments", icon: Wallet },
  { href: "/notifications", label: "Alerts", icon: Bell },
  // Public and outside the group scope, so it is never basePath-prefixed.
  { href: "/calculator", label: "Calc", icon: Car, absolute: true },
];

export type AppShellProps = {
  children: ReactNode;
  /** Prefix for every tab link, so /demo can reuse the shell. */
  basePath?: string;
  /** Rendered at the right of the header (group switcher, account button…). */
  headerSlot?: ReactNode;
  /** Shown under the header, e.g. to mark the demo as sample data. */
  banner?: ReactNode;
};

export const AppShell = ({
  children,
  basePath = "",
  headerSlot,
  banner,
}: AppShellProps) => {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      <header className="pt-safe sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link
            href={`${basePath}/groups`}
            className="inline-flex min-h-11 items-center text-base font-semibold tracking-tight"
          >
            ShareSpent
          </Link>
          {headerSlot ? (
            <div className="flex min-w-0 items-center gap-2">{headerSlot}</div>
          ) : null}
        </div>
        {banner}
      </header>

      {/* pb-28 clears the fixed bottom nav so the last card is never trapped under it. */}
      <main className="flex-1 px-4 pt-4 pb-28">{children}</main>

      <nav
        aria-label="Primary"
        className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur"
      >
        <ul className="mx-auto flex w-full max-w-2xl">
          {tabs.map(({ href, label, icon: Icon, absolute }) => {
            const target = absolute ? href : `${basePath}${href}`;
            const active = pathname === target || pathname.startsWith(`${target}/`);

            return (
              <li key={href} className="flex-1">
                <Link
                  href={target}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
