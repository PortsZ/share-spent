import { ReceiptCard } from "../../../components/entities/receipt-card";
import { demoReceipts } from "../../../lib/demo/data";

export default function DemoReceiptsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Receipts</h1>

      <ul className="space-y-3">
        {demoReceipts.map((receipt) => (
          <li key={receipt.id}>
            <ReceiptCard
              merchantName={receipt.merchantName}
              receiptDate={receipt.receiptDate}
              payerName={receipt.payerName}
              totalAmount={receipt.totalAmount}
              currency={receipt.currency}
              status={receipt.status}
              href={`/demo/receipts/${receipt.id}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
