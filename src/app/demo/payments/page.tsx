import { PaymentCard } from "../../../components/entities/payment-card";
import { demoPaymentHistory, demoPendingPayments } from "../../../lib/demo/data";

export default function DemoPaymentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Payments</h1>

      <h2 className="text-sm font-semibold text-muted-foreground">Pending</h2>
      <ul className="space-y-3">
        {demoPendingPayments.map((payment) => (
          <li key={payment.id}>
            <PaymentCard
              payerName={payment.payerName}
              payeeName={payment.payeeName}
              amount={payment.amount}
              currency={payment.currency}
              paymentDate={payment.paymentDate}
            />
          </li>
        ))}
      </ul>

      <h2 className="pt-2 text-sm font-semibold text-muted-foreground">History</h2>
      <ul className="space-y-2">
        {demoPaymentHistory.map((payment) => (
          <li key={payment.id}>
            <PaymentCard
              compact
              payerName={payment.payerName}
              payeeName={payment.payeeName}
              amount={payment.amount}
              currency={payment.currency}
              paymentDate={payment.paymentDate}
              status={payment.status}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
