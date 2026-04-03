export type EngagementType = "01" | "02" | "03";
export type ClientStatus = "active" | "paused" | "complete" | "archived";
export type DocumentType =
  | "welcome"
  | "agreement"
  | "deliverable"
  | "invoice"
  | "resource"
  | "tax"
  | "other";
export type DocumentVisibility = "client" | "internal";
export type SenderRole = "admin" | "client";
export type EventStatus = "scheduled" | "completed" | "cancelled";
export type InvoiceStatus = "unpaid" | "paid" | "overdue";

export interface Client {
  id: string;
  clerk_user_id: string;
  name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  engagement_type: EngagementType | null;
  status: ClientStatus;
  pipeline_stage: string | null;
  notes: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  client_id: string;
  title: string;
  type: DocumentType | null;
  visibility: DocumentVisibility;
  storage_path: string | null;
  html_content: string | null;
  is_signed: boolean;
  signed_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  client_id: string;
  sender_role: SenderRole;
  sender_name: string;
  content: string;
  read_by_client: boolean;
  read_by_admin: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  client_id: string;
  title: string;
  scheduled_at: string | null;
  cal_event_uid: string | null;
  status: EventStatus;
  notes: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  amount_cents: number | null;
  status: InvoiceStatus;
  due_date: string | null;
  paid_at: string | null;
  description: string | null;
  created_at: string;
}

export const ENGAGEMENT_LABELS: Record<EngagementType, string> = {
  "01": "Strategy Sprint",
  "02": "Advisory Retainer",
  "03": "Full Partnership",
};

export const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Active",
  paused: "Paused",
  complete: "Complete",
  archived: "Archived",
};
