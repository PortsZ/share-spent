/**
 * Sample data for the public /demo routes. These render the same components as
 * the real app, so the demo shows the actual interface without needing Clerk or
 * a database. Nothing here is written or read anywhere else.
 */

const daysAgo = (days: number) => {
  const date = new Date("2026-08-20T12:00:00Z");
  date.setUTCDate(date.getUTCDate() - days);
  return date;
};

export const demoGroups = [
  {
    id: "demo-group-1",
    name: "Apartment 4B",
    description: "Rent, groceries, and the shared streaming bill.",
    role: "OWNER" as const,
  },
  {
    id: "demo-group-2",
    name: "Lisbon trip",
    description: "Five days, four people, one very long receipt.",
    role: "MEMBER" as const,
  },
];

export const demoReceipts = [
  {
    id: "demo-receipt-1",
    merchantName: "Corner Grocery",
    receiptDate: daysAgo(1),
    payerName: "Joao",
    totalAmount: "84.20",
    currency: "EUR",
    status: "ACTIVE" as const,
  },
  {
    id: "demo-receipt-2",
    merchantName: "Pharmacy",
    receiptDate: daysAgo(3),
    payerName: "Marta",
    totalAmount: "23.90",
    currency: "EUR",
    status: "PENDING_REVIEW" as const,
  },
  {
    id: "demo-receipt-3",
    merchantName: "Hardware store",
    receiptDate: daysAgo(6),
    payerName: "Joao",
    totalAmount: "142.00",
    currency: "EUR",
    status: "DRAFT" as const,
  },
];

export const demoLineItems = [
  { id: "demo-item-1", description: "Oat milk ×2", quantity: "2", unitPrice: "2.49", subtotal: "4.98" },
  { id: "demo-item-2", description: "Coffee beans", quantity: "1", unitPrice: "12.90", subtotal: "12.90" },
  { id: "demo-item-3", description: "Dish soap", quantity: "1", unitPrice: "3.40", subtotal: "3.40" },
  { id: "demo-item-4", description: "Weekly vegetables", quantity: "1", unitPrice: "62.92", subtotal: "62.92" },
];

export const demoPendingPayments = [
  {
    id: "demo-payment-1",
    payerName: "Marta",
    payeeName: "Joao",
    amount: "42.10",
    currency: "EUR",
    paymentDate: daysAgo(0),
  },
  {
    id: "demo-payment-2",
    payerName: "Tomas",
    payeeName: "Joao",
    amount: "18.75",
    currency: "EUR",
    paymentDate: daysAgo(2),
  },
];

export const demoPaymentHistory = [
  {
    id: "demo-history-1",
    payerName: "Joao",
    payeeName: "Marta",
    amount: "31.00",
    currency: "EUR",
    paymentDate: daysAgo(8),
    status: "CONFIRMED" as const,
  },
  {
    id: "demo-history-2",
    payerName: "Tomas",
    payeeName: "Marta",
    amount: "12.40",
    currency: "EUR",
    paymentDate: daysAgo(12),
    status: "CONFIRMED" as const,
  },
  {
    id: "demo-history-3",
    payerName: "Marta",
    payeeName: "Tomas",
    amount: "9.99",
    currency: "EUR",
    paymentDate: daysAgo(19),
    status: "REJECTED" as const,
  },
];

export const demoNotifications = [
  {
    id: "demo-notification-1",
    type: "PAYMENT_PENDING",
    title: "Payment pending",
    message: "Marta recorded a €42.10 payment to you.",
    createdAt: daysAgo(0),
    unread: true,
  },
  {
    id: "demo-notification-2",
    type: "RECEIPT_READY_FOR_REVIEW",
    title: "Receipt ready for review",
    message: "Pharmacy receipt was parsed and needs your review.",
    createdAt: daysAgo(3),
    unread: true,
  },
  {
    id: "demo-notification-3",
    type: "PAYMENT_CONFIRMED",
    title: "Payment confirmed",
    message: "Marta confirmed your €31.00 payment.",
    createdAt: daysAgo(8),
    unread: false,
  },
];
