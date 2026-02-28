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
  lineItems: text("line_items").notNull(), // JSON: [{vaccine, qty, unitPrice, gstPct}]
  convenienceFee: real("convenience_fee").notNull().default(0),
  subtotal: real("subtotal").notNull(),
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
