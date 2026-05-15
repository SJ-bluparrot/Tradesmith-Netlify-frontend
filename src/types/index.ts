// ─── Project ──────────────────────────────────────────────────────────────────

export type ProjectType =
  | "deck"
  | "remodel"
  | "cabinet"
  | "framing"
  | "finish"
  | "other";

export type ProjectStatus = "active" | "archived" | "completed";

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  clientName: string | null;
  address: string | null;
  type: ProjectType;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  type: ProjectType;
  clientName?: string;
  address?: string;
}

// ─── Estimate ─────────────────────────────────────────────────────────────────

export interface LineItem {
  sku?: string;
  name?: string;
  description?: string;
  quantity: number;
  unit: string;
  // FastAPI Pydantic (snake_case) — stored as-is in the DB
  unit_price?: number;
  line_total?: number;
  // Legacy / alternative camelCase variants
  unitPrice?: number;
  unit_cost?: number;
  lineTotal?: number;
  total?: number;
  category?: string;
  assumptions?: string;
  confidence?: number;
}

// Helpers to normalize line items from any source format
export function getLineItemTotal(item: LineItem): number {
  return item.line_total ?? item.lineTotal ?? item.total ?? 0;
}

export function getLineItemDescription(item: LineItem): string {
  return item.name ?? item.description ?? "Item";
}

export function getLineItemUnitCost(item: LineItem): number {
  return item.unit_price ?? item.unitPrice ?? item.unit_cost ?? 0;
}

export interface Estimate {
  id: string;
  projectId: string;
  tenantId: string;
  description: string;
  lineItems: LineItem[];
  totalCost: number;
  confidence: number;
  promptVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateEstimateInput {
  description: string;
  project_type?: ProjectType;
  trade?: string;
}

// ─── Document / Proposal ─────────────────────────────────────────────────────

export interface Document {
  id: string;
  projectId: string;
  tenantId: string;
  type: string;
  r2Key: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateProposalInput {
  timeline?: string;
  trade?: string;
}

export interface ProposalResult {
  url: string;
  filename: string;
  documentId: string;
}

// ─── Chat / Playground ───────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PlaygroundResponse {
  reply: string;
  metrics: {
    input_tokens?: number;
    output_tokens?: number;
    cost_usd?: number;
    latency_ms?: number;
  };
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
