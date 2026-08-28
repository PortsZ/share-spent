import { Prisma } from "@prisma/client";

export const toDecimal = (value: string | number | Prisma.Decimal) =>
  value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);

export const sumDecimals = (values: Array<string | number | Prisma.Decimal>) =>
  values.reduce<Prisma.Decimal>(
    (acc, value) => acc.plus(toDecimal(value)),
    new Prisma.Decimal(0),
  );
