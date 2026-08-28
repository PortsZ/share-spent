import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { isClerkConfigured } from "../lib/env";
import { Receipt, Split, Wallet } from "lucide-react";

import { buttonVariants } from "../components/ui/button-variants";

const features = [
  {
    icon: Receipt,
    title: "Capture receipts",
    body: "Log a receipt once and keep every line item attached to it.",
  },
  {
    icon: Split,
    title: "Split by line item",
    body: "Assign each item to the people who actually shared it.",
  },
  {
    icon: Wallet,
    title: "Reconcile payments",
    body: "Record who paid whom and confirm settlements as they land.",
  },
];

export default async function Home() {
  if (isClerkConfigured) {
    const { userId } = await auth();

    if (userId) {
      redirect("/groups");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-10 px-5 py-14">
      <div className="space-y-4">
        <p className="text-sm font-semibold text-primary">ShareSpent</p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Share expenses with roommates and friends.
        </h1>
        <p className="text-base text-muted-foreground">
          Split receipts line by line, settle up without the spreadsheet, and keep
          an audit trail everyone can trust.
        </p>
      </div>

      <ul className="space-y-3">
        {features.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="flex gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/sign-up" className={buttonVariants({ size: "block" })}>
          Create an account
        </Link>
        <Link
          href="/sign-in"
          className={buttonVariants({ variant: "secondary", size: "block" })}
        >
          Sign in
        </Link>
      </div>

      <div className="space-y-2">
        <Link
          href="/demo"
          className={buttonVariants({ variant: "ghost", size: "block" })}
        >
          Browse the demo — no account needed
        </Link>
        <Link
          href="/calculator"
          className={buttonVariants({ variant: "ghost", size: "block" })}
        >
          EV vs petrol cost calculator
        </Link>
      </div>
    </main>
  );
}
