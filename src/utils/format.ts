export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatConfidence(value: number): { label: string; variant: "success" | "warning" | "error" } {
  if (value >= 0.8) return { label: "High Confidence", variant: "success" };
  if (value >= 0.5) return { label: "Medium Confidence", variant: "warning" };
  return { label: "Low Confidence", variant: "error" };
}

export function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function projectTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    deck: "Deck",
    remodel: "Remodel",
    cabinet: "Cabinetry",
    framing: "Framing",
    finish: "Finish",
    other: "Other",
  };
  return labels[type] ?? capitalizeFirst(type);
}

export function getLineItemDescription(item: {
  name?: string;
  description?: string;
}): string {
  return item.name ?? item.description ?? "Item";
}

export function getLineItemUnitCost(item: {
  unit_price?: number;
  unitPrice?: number;
  unit_cost?: number;
}): number {
  return item.unit_price ?? item.unitPrice ?? item.unit_cost ?? 0;
}

export function getLineItemTotal(item: {
  line_total?: number;
  lineTotal?: number;
  total?: number;
}): number {
  return item.line_total ?? item.lineTotal ?? item.total ?? 0;
}
