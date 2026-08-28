import Link from "next/link";

import { AppShell } from "../../components/app-shell";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      basePath="/demo"
      headerSlot={
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground"
        >
          Exit demo
        </Link>
      }
      banner={
        <p className="border-t border-border bg-warning-soft px-4 py-2 text-xs font-medium text-warning">
          Demo — sample data, nothing is saved.
        </p>
      }
    >
      {children}
    </AppShell>
  );
}
