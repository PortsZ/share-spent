"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Receipt, Wallet } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { cn } from "../lib/utils";
import { GroupSwitcher } from "./group-switcher";

const tabs = [
  { href: "/groups", label: "Groups", icon: Home },
  { href: "/receipts", label: "Receipts", icon: Receipt },
  { href: "/payments", label: "Payments", icon: Wallet },
  { href: "/notifications", label: "Alerts", icon: Bell },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      <header className="pt-safe sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/groups"
            className="inline-flex min-h-11 items-center text-base font-semibold tracking-tight"
          >
            ShareSpent
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <GroupSwitcher />
            <UserButton
              appearance={{ elements: { avatarBox: "size-8" } }}
              afterSignOutUrl="/"
            />
          </div>
        </div>
      </header>

      {/* pb-28 clears the fixed bottom nav so the last card is never trapped under it. */}
      <main className="flex-1 px-4 pt-4 pb-28">{children}</main>

      <nav
        aria-label="Primary"
        className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur"
      >
        <ul className="mx-auto flex w-full max-w-2xl">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
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
