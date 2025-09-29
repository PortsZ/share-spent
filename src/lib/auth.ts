import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { UnauthorizedError } from "./errors";

export type AuthContext = {
  userId: string;
  orgId: string | null;
};

export const getAuthContext = (): AuthContext | null => {
  const session = auth();

  if (!session.userId) {
    return null;
  }

  return {
    userId: session.userId,
    orgId: session.orgId ?? null,
  } satisfies AuthContext;
};

export const requireAuthContext = (): AuthContext => {
  const context = getAuthContext();

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
