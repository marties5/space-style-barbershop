// Transaction management utilities
export interface TransactionItem {
  id: number;
  type: "service" | "product";
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Transaction {
  id?: number;
  transactionNumber: string;
  customerId?: number;
  staffId: number;
  items: TransactionItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: "cash" | "card" | "digital";
  paymentStatus: "pending" | "completed" | "failed";
  notes?: string;
  transactionDate: Date;
}

export function generateTransactionNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `TXN${date}${time}${random}`;
}

export function calculateTransactionTotals(
  items: TransactionItem[],
  discountPercent = 0,
  taxPercent = 0
) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxPercent) / 100;
  const totalAmount = taxableAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
  };
}

export function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function formatTransactionNumber(number: string): string {
  return number.replace(/(.{3})(.{8})(.{6})(.{3})/, "$1-$2-$3-$4");
}
