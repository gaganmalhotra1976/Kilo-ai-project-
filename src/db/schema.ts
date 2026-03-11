import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ── Customers ──────────────────────────────────────────────────────────────
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  password: text("password"), // For customer login
  address: text("address"),
  city: text("city").notNull().default("Delhi"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// ── Bookings ───────────────────────────────────────────────────────────────
// Status flow: pending → quoted → confirmed → completed | cancelled
export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id),
  // Denormalised snapshot so we don't lose data if customer is edited
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  address: text("address").notNull(),
  city: text("city").notNull().default("Delhi"),
  vaccinesRequested: text("vaccines_requested").notNull(), // JSON array of strings
  numberOfPeople: integer("number_of_people").notNull().default(1),
  bookingType: text("booking_type").notNull().default("individual"), // individual | family | corporate
  preferredDate: text("preferred_date"), // ISO date string
  preferredTime: text("preferred_time"),
  patientNames: text("patient_names"), // JSON array of patient names (self + selected family members)
  status: text("status").notNull().default("pending"), // pending | quoted | confirmed | completed | cancelled
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid | paid | partial
  adminNotes: text("admin_notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// ── Quotes ─────────────────────────────────────────────────────────────────
// Admin creates a quote for a booking; customer approves it
export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id),
  lineItems: text("line_items").notNull(), // JSON: [{vaccine, qty, unitPrice, gstPct, batch, expiry}]
  convenienceFee: real("convenience_fee").notNull().default(0),
  discountType: text("discount_type"), // percentage | flat | null
  discountValue: real("discount_value").notNull().default(0),
  subtotal: real("subtotal").notNull(),
  discountAmount: real("discount_amount").notNull().default(0),
  gstAmount: real("gst_amount").notNull(),
  total: real("total").notNull(),
  validUntil: text("valid_until"), // ISO date
  status: text("status").notNull().default("draft"), // draft | sent | approved | rejected | expired
  sentAt: integer("sent_at", { mode: "timestamp" }),
  approvedAt: integer("approved_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// ── Vaccines catalogue ─────────────────────────────────────────────────────
export const vaccines = sqliteTable("vaccines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  brand: text("brand"),
  category: text("category").notNull(), // e.g. "Travel", "Paediatric", "Adult", "Flu"
  description: text("description"),
  dosesRequired: integer("doses_required").notNull().default(1),
  intervalDays: integer("interval_days"), // days between doses
  ageGroup: text("age_group"), // e.g. "0-5 years", "Adults"
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// ── Family Members ──────────────────────────────────────────────────────────
export const familyMembers = sqliteTable("family_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth"), // ISO date string
  gender: text("gender"), // male | female | other
  vaccineCardUrl: text("vaccine_card_url"), // URL to uploaded vaccine card
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// ── Hero Banners ────────────────────────────────────────────────────────────
export const banners = sqliteTable("banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  headline: text("headline").notNull(),
  subtext: text("subtext"),
  imageUrl: text("image_url"),           // legacy / fallback URL
  desktopImageUrl: text("desktop_image_url"), // uploaded desktop image (≥768px)
  mobileImageUrl: text("mobile_image_url"),   // uploaded mobile image (<768px)
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// ── YouTube Videos ──────────────────────────────────────────────────────────
export const youtubeVideos = sqliteTable("youtube_videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  videoId: text("video_id").notNull(), // YouTube video ID (e.g. "dQw4w9WgXcQ")
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// ── Promo Popup ─────────────────────────────────────────────────────────────
export const promoPopup = sqliteTable("promo_popup", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content"), // Rich text / HTML
  imageUrl: text("image_url"),
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  expiresAt: text("expires_at"), // ISO date string
  showOnce: integer("show_once", { mode: "boolean" }).notNull().default(true), // once per session
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// ── Vaccine Categories ──────────────────────────────────────────────────────
export const vaccineCategories = sqliteTable("vaccine_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"), // emoji or icon name
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// ── Vaccine Category Items ──────────────────────────────────────────────────
export const vaccineCategoryItems = sqliteTable("vaccine_category_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => vaccineCategories.id),
  name: text("name").notNull(),
  description: text("description"),
  ageGroup: text("age_group"),
  dosesRequired: integer("doses_required").default(1),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// ── Blog Posts ──────────────────────────────────────────────────────────────
export const blogPosts = sqliteTable("blog_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"), // Short description for SEO meta description & cards
  content: text("content").notNull(), // HTML content
  coverImageUrl: text("cover_image_url"),
  metaTitle: text("meta_title"), // Override SEO title (defaults to title)
  metaDescription: text("meta_description"), // SEO meta description
  metaKeywords: text("meta_keywords"), // Comma-separated keywords
  author: text("author").notNull().default("The Vaccine Panda Team"),
  category: text("category"), // e.g. "Vaccines", "Child Health", "Travel"
  tags: text("tags"), // JSON array of tag strings
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// ── Pipelines ───────────────────────────────────────────────────────────────
export const pipelines = sqliteTable("pipelines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Pipeline Stages ─────────────────────────────────────────────────────────
export const pipelineStages = sqliteTable("pipeline_stages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pipelineId: integer("pipeline_id").notNull().references(() => pipelines.id),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6366f1"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Pipeline Cards ──────────────────────────────────────────────────────────
export const pipelineCards = sqliteTable("pipeline_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pipelineId: integer("pipeline_id").notNull().references(() => pipelines.id),
  stageId: integer("stage_id").notNull().references(() => pipelineStages.id),
  title: text("title").notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name"),
  assignedTo: text("assigned_to"),
  dueDate: text("due_date"),
  priority: text("priority").notNull().default("medium"),
  notes: text("notes"),
  attachments: text("attachments"),
  bookingId: integer("booking_id").references(() => bookings.id),
  quoteId: integer("quote_id").references(() => quotes.id),
  source: text("source"), // website | phone | whatsapp | referral | walkin
  amountReceived: real("amount_received"),
  paymentMethod: text("payment_method"), // Cash | UPI | Bank Transfer
  isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Pipeline Card Stage History ─────────────────────────────────────────────
export const pipelineCardHistory = sqliteTable("pipeline_card_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id").notNull().references(() => pipelineCards.id),
  fromStageId: integer("from_stage_id").references(() => pipelineStages.id),
  toStageId: integer("to_stage_id").notNull().references(() => pipelineStages.id),
  movedBy: text("moved_by"),
  movedAt: integer("moved_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  note: text("note"),
});

// ── Pipeline Custom Fields ──────────────────────────────────────────────────
export const pipelineCustomFields = sqliteTable("pipeline_custom_fields", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pipelineId: integer("pipeline_id").notNull().references(() => pipelines.id),
  name: text("name").notNull(),
  fieldType: text("field_type").notNull().default("text"),
  options: text("options"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Pipeline Card Custom Field Values ───────────────────────────────────────
export const pipelineCardFieldValues = sqliteTable("pipeline_card_field_values", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id").notNull().references(() => pipelineCards.id),
  fieldId: integer("field_id").notNull().references(() => pipelineCustomFields.id),
  value: text("value"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Settings ───────────────────────────────────────────────────────────────
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Webhook Logs ────────────────────────────────────────────────────────────
export const webhookLogs = sqliteTable("webhook_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  event: text("event").notNull(),
  payload: text("payload").notNull(),
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  success: integer("success", { mode: "boolean" }).notNull().default(false),
  errorMessage: text("error_message"),
  triggeredBy: text("triggered_by"),
  retryCount: integer("retry_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Support Tickets ──────────────────────────────────────────────────────────
export const supportTickets = sqliteTable("support_tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Payments ────────────────────────────────────────────────────────────────
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookingId: integer("booking_id").references(() => bookings.id),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  status: text("status").notNull().default("pending"),
  receivedAt: integer("received_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
