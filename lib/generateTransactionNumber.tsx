export function generateTransactionNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  return `TRX-${date}-${random}`;
}
