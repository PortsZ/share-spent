import { NotFoundError } from "../errors";
import { prisma } from "../db";

export type UpsertUserProfileInput = {
  clerkId: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
};

export const upsertUserProfile = async ({
  clerkId,
  email,
  displayName,
  avatarUrl,
}: UpsertUserProfileInput) => {
  return prisma.userProfile.upsert({
    where: { clerkId },
    update: {
      email,
      displayName,
      avatarUrl: avatarUrl ?? null,
    },
    create: {
      clerkId,
      email,
      displayName,
      avatarUrl: avatarUrl ?? null,
    },
  });
};

export const getUserProfileByClerkId = async (clerkId: string) => {
  return prisma.userProfile.findUnique({
    where: { clerkId },
  });
};

export const requireUserProfile = async (clerkId: string) => {
  const profile = await getUserProfileByClerkId(clerkId);

  if (!profile) {
    throw new NotFoundError("User profile not found");
  }

  return profile;
};
