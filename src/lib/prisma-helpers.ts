import { Prisma } from "@prisma/client";

export const toDecimal = (value: string | number | Prisma.Decimal) =>
  value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);

export const sumDecimals = (values: Array<string | number | Prisma.Decimal>) =>
  values.reduce(
    (acc, value) => acc.plus(value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value)),
    new Prisma.Decimal(0),
  );
