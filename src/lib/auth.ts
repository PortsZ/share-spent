import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { UnauthorizedError } from "./errors";

export type AuthContext = {
  userId: string;
  orgId: string | null;
};

export const getAuthContext = async (): Promise<AuthContext | null> => {
  const session = await auth();

  if (!session.userId) {
    return null;
  }

  return {
    userId: session.userId,
    orgId: session.orgId ?? null,
  } satisfies AuthContext;
};

export const requireAuthContext = async (): Promise<AuthContext> => {
  const context = await getAuthContext();

  if (!context) {
    throw new UnauthorizedError();
  }

  return context;
};

export const getCurrentUser = async () => {
  const user = await currentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
};
