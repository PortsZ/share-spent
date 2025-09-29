import { prisma } from "../db";
import { NotFoundError } from "../errors";

export const getReceiptOrThrow = async (receiptId: string) => {
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: {
      lineItems: {
        include: { assignments: true },
      },
    },
  });

  if (!receipt) {
    throw new NotFoundError("Receipt not found");
  }

  return receipt;
};
