import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Loan applications table
export const loanApplications = pgTable("loan_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Quick Start fields
  loanType: varchar("loan_type").notNull(), // permanent-acquisition, permanent-refinance, bridge-acquisition, bridge-refinance, construction
  loanAmount: decimal("loan_amount", { precision: 15, scale: 2 }),
  propertyCity: varchar("property_city"),
  propertyState: varchar("property_state"),

  // Property Basics fields
  propertyName: text("property_name"),
  propertyAddress: text("property_address"),
  propertyType: varchar("property_type"), // multifamily, office, retail, industrial, mixed-use, self-storage, land
  squareFootage: varchar("square_footage"),
  units: varchar("units"),
  yearBuilt: varchar("year_built"),
  occupancy: decimal("occupancy", { precision: 5, scale: 2 }),

  // Borrower Information
  entityName: varchar("entity_name"),
  borrowerType: varchar("borrower_type"), // individual, llc, corporation, trust, foreign-national
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  yearsExperience: varchar("years_experience"),
  projectsCompleted: varchar("projects_completed"),

  // Loan Specifics (type-dependent fields stored as JSON)
  loanSpecifics: jsonb("loan_specifics"),

  // Financial Snapshot
  netWorth: decimal("net_worth", { precision: 15, scale: 2 }),
  liquidAssets: decimal("liquid_assets", { precision: 15, scale: 2 }),
  downPaymentSource: varchar("down_payment_source"), // cash, securities, equity-partner, other
  creditScore: varchar("credit_score"),
  hasBankruptcy: boolean("has_bankruptcy").default(false),
  authorizeCreditPull: boolean("authorize_credit_pull").default(false),

  // Property Performance (for income-producing properties)
  annualNOI: decimal("annual_noi", { precision: 15, scale: 2 }),
  isIncomeProducing: boolean("is_income_producing").default(true),
  propertyManagement: varchar("property_management"), // self-managed, third-party

  // Calculated Metrics
  ltv: decimal("ltv", { precision: 5, scale: 2 }), // Loan-to-Value
  dscr: decimal("dscr", { precision: 5, scale: 2 }), // Debt Service Coverage Ratio
  monthlyInterest: decimal("monthly_interest", { precision: 12, scale: 2 }),

  // Application Status
  status: varchar("status").notNull().default("draft"), // draft, submitted, term-sheet, underwriting, closing, closed
  currentStep: varchar("current_step").default("quick-start"), // which wizard step they're on

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type LoanApplication = typeof loanApplications.$inferSelect;

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id")
    .notNull()
    .references(() => loanApplications.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Document metadata
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // purchase-contract, bank-statements, tax-returns, etc.
  fileType: varchar("file_type"), // pdf, doc, xls, jpg, etc.
  fileSize: varchar("file_size"),
  status: varchar("status").notNull().default("pending"), // uploaded, pending, required

  // Object storage reference
  storagePath: varchar("storage_path"), // path in object storage
  storageUrl: varchar("storage_url"), // public URL if applicable

  uploadedAt: timestamp("uploaded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
