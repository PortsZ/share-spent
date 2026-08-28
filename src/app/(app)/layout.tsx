import { UserButton } from "@clerk/nextjs";

import { AppShell } from "../../components/app-shell";
import { GroupSwitcher } from "../../components/group-switcher";
import { isClerkConfigured } from "../../lib/env";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      headerSlot={
        <>
          <GroupSwitcher />
          {isClerkConfigured ? (
            <UserButton
              appearance={{ elements: { avatarBox: "size-8" } }}
              afterSignOutUrl="/"
            />
          ) : null}
        </>
      }
    >
      {children}
    </AppShell>
  );
}
