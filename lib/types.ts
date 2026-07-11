export type Theme = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
};

export type Affirmation = {
  id: string;
  theme_id: string;
  day_number: number;
  body: string;
  created_at: string;
};

export type SubscriptionStatus = "free" | "active" | "cancelled";

export type Subscription = {
  id: string;
  user_id: string | null;
  stripe_customer_id: string | null;
  stripe_session_id: string | null;
  status: SubscriptionStatus;
  started_at: string | null;
  created_at: string;
};

export type TouchpointEvent =
  | "page_view"
  | "affirmation_view"
  | "theme_select"
  | "lead_capture"
  | "checkout_start"
  | "checkout_complete";
