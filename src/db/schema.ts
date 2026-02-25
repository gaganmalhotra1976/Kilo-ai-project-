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
