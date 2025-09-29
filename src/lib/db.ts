import { PrismaClient } from "@prisma/client";
import { isDevelopment } from "./env";

const prismaClientSingleton = () =>
  new PrismaClient({
    log: isDevelopment ? ["query", "warn", "error"] : ["error"],
  });

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

declare global {
  // ♻️ keep single Prisma instance across hot reloads
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClientSingleton | undefined;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (isDevelopment) {
  globalThis.prismaGlobal = prisma;
}
