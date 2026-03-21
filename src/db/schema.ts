import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ── Customer OTP ───────────────────────────────────────────────────────────────
export const customerOtps = sqliteTable("customer_otps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").notNull(),
  otp: text("otp").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Customers ──────────────────────────────────────────────────────────────
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  password: text("password"), // For customer login
  address: text("address"),
  city: text("city").notNull().default("Delhi"),
  pinCode: text("pin_code"), // PIN/ZIP code
  landmark: text("landmark"), // Nearby landmark for easier navigation
  notes: text("notes"),
  pictureData: text("picture_data"), // Base64 encoded image (JPEG/PNG) for profile picture
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
  assignedNurse: text("assigned_nurse"), // Staff member assigned to this booking
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
  lineItems: text("line_items").notNull(), // JSON: [{vaccine, brand, patient, qty, unitPrice, gstPct, batch, expiry}]
  convenienceFee: real("convenience_fee").notNull().default(0),
  discountType: text("discount_type"), // percentage | flat | null
  discountValue: real("discount_value").notNull().default(0),
  subtotal: real("subtotal").notNull(),
  discountAmount: real("discount_amount").notNull().default(0),
  freeConsultations: integer("free_consultations").notNull().default(0), // Number of free consultations included
  freeConsultationsValue: real("free_consultations_value").notNull().default(0), // Total value (consultations × 500)
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
  // Inventory fields
  mrp: real("mrp"), // Maximum Retail Price in ₹
  stockQuantity: integer("stock_quantity").notNull().default(0), // Current stock
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5), // Alert when below this
  gstRate: real("gst_rate").notNull().default(18), // GST percentage
  isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true), // Manual availability toggle
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// ── Family Members ──────────────────────────────────────────────────────────
export const familyMembers = sqliteTable("family_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  registrationNumber: text("registration_number"), // Family member registration number (e.g., Aadhaar, PAN, etc.)
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth"), // ISO date string
  gender: text("gender"), // male | female | other
  vaccineCardData: text("vaccine_card_data"), // Base64 encoded vaccine card image (JPEG/PNG)
  pictureData: text("picture_data"), // Base64 encoded image (JPEG/PNG) for family member picture
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

// ── Consultation Vouchers ──────────────────────────────────────────────────────
export const consultationVouchers = sqliteTable("consultation_vouchers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  voucherCode: text("voucher_code").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  patientName: text("patient_name").notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  quoteId: integer("quote_id").references(() => quotes.id),
  issueDate: integer("issue_date", { mode: "timestamp" }).notNull(),
  expiryDate: integer("expiry_date", { mode: "timestamp" }).notNull(),
  voucherValue: real("voucher_value").notNull().default(500), // Value of the voucher in ₹
  status: text("status").notNull().default("active"), // active | redeemed | expired | converted
  redeemedDate: integer("redeemed_date", { mode: "timestamp" }),
  redeemedBy: text("redeemed_by"), // Staff who processed redemption
  conversionType: text("conversion_type"), // consultation | vaccine_discount
  discountAmountApplied: real("discount_amount_applied"),
  convertedToBookingId: integer("converted_to_booking_id").references(() => bookings.id),
  convertedBy: text("converted_by"), // Staff who processed conversion
  convertedAt: integer("converted_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Free Consultation Bookings ──────────────────────────────────────────────────
// Patients book free consultation slots using their vouchers
// Working hours: Weekdays 11 AM - 2 PM, 7 PM - 9 PM
// Max 6 bookings per 1-hour slot
export const consultationBookings = sqliteTable("consultation_bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  voucherId: integer("voucher_id").notNull().references(() => consultationVouchers.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  patientName: text("patient_name").notNull(),
  consultationDate: text("consultation_date").notNull(), // ISO date string (YYYY-MM-DD)
  consultationTime: text("consultation_time").notNull(), // Time slot (e.g., "11:00", "14:00")
  status: text("status").notNull().default("booked"), // booked | completed | cancelled | no_show
  notes: text("notes"),
  doctorName: text("doctor_name"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Scheduled Reports ───────────────────────────────────────────────────────────
export const scheduledReports = sqliteTable("scheduled_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // e.g., "Weekly Sales Report"
  reportType: text("report_type").notNull(), // bookings | revenue | pipeline | operations | support | customer | vaccine
  schedule: text("schedule").notNull(), // daily | weekly | monthly
  recipientEmails: text("recipient_emails").notNull(), // JSON array of email addresses
  filters: text("filters"), // JSON object with default filters for this report
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastSentAt: integer("last_sent_at", { mode: "timestamp" }),
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

// ── Staff / Admin Users ────────────────────────────────────────────────────────
export const staff = sqliteTable("staff", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed bcrypt
  name: text("name").notNull(),
  role: text("role").notNull().default("sales"), // admin | manager | sales | operations | support
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Staff Audit Log ────────────────────────────────────────────────────────────
export const staffAuditLog = sqliteTable("staff_audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  staffId: integer("staff_id").notNull().references(() => staff.id),
  staffName: text("staff_name"),
  action: text("action").notNull(), // login | logout | create | update | delete | view
  module: text("module"), // bookings | customers | quotes | pipelines | settings | etc.
  recordId: integer("record_id"), // ID of affected record
  oldValue: text("old_value"), // JSON
  newValue: text("new_value"), // JSON
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Customer Communications ─────────────────────────────────────────────────────
export const customerCommunications = sqliteTable("customer_communications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  staffId: integer("staff_id").references(() => staff.id),
  type: text("type").notNull(), // WhatsApp | Call | Email | In-Person
  direction: text("direction").notNull(), // Inbound | Outbound
  content: text("content").notNull(), // Notes on what was discussed
  metadata: text("metadata"), // JSON for additional data like message ID, call duration
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Invoices ──────────────────────────────────────────────────────────────────
export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceNumber: text("invoice_number").notNull().unique(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  // Invoice details
  subtotal: real("subtotal").notNull(),
  discountType: text("discount_type"), // percentage | flat
  discountValue: real("discount_value"),
  discountAmount: real("discount_amount"),
  cgstRate: real("cgst_rate"),
  cgstAmount: real("cgst_amount"),
  sgstRate: real("sgst_rate"),
  sgstAmount: real("sgst_amount"),
  igstRate: real("igst_rate"),
  igstAmount: real("igst_amount"),
  totalTax: real("total_tax").notNull(),
  total: real("total").notNull(),
  // Line items with HSN
  lineItems: text("line_items").notNull(), // JSON: [{vaccine, hsnCode, qty, unitPrice, taxableAmount, cgst, sgst, igst, total}]
  // Status
  status: text("status").notNull().default("draft"), // draft | generated | cancelled
  paidAt: integer("paid_at", { mode: "timestamp" }),
  generatedAt: integer("generated_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Document Storage ─────────────────────────────────────────────────────────
export const documentStorage = sqliteTable("document_storage", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  documentType: text("document_type").notNull(), // vaccination_certificate | invoice | prescription | id_proof
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  metadata: text("metadata"), // JSON for additional data
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ── Payment Transactions ──────────────────────────────────────────────────
export const paymentTransactions = sqliteTable("payment_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookingId: integer("booking_id").references(() => bookings.id),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  provider: text("provider").notNull(), // phonepe | razorpay | cash | upi
  providerTransactionId: text("provider_transaction_id"),
  ourTransactionId: text("our_transaction_id"),
  status: text("status").notNull(), // pending | initiated | captured | failed | cancelled | refunded
  paymentLink: text("payment_link"),
  paymentLinkId: text("payment_link_id"),
  callbackData: text("callback_data"), // JSON from provider webhook
  failureReason: text("failure_reason"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
