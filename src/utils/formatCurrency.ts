export function formatCurrency(
  amount: number | string | { toNumber: () => number },
  currency = "EUR"
): string {
  let num: number;
  if (typeof amount === "number") {
    num = amount;
  } else if (typeof amount === "string") {
    num = parseFloat(amount);
  } else {
    num = amount.toNumber();
  }
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}
