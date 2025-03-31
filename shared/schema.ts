import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['donor', 'patient', 'admin']);

// Blood groups enum
export const bloodGroupEnum = pgEnum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

// Request status enum
export const requestStatusEnum = pgEnum('request_status', ['Pending', 'Approved', 'Denied']);

// Urgency level enum
export const urgencyLevelEnum = pgEnum('urgency_level', ['Normal', 'Urgent', 'Emergency']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  age: integer("age").notNull(),
  blood_group: bloodGroupEnum("blood_group").notNull(),
  role: userRoleEnum("role").notNull(),
  address: text("address"),
  phone: text("phone"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  wallet_address: text("wallet_address"),
});

// Blood inventory table
export const bloodInventory = pgTable("blood_inventory", {
  id: serial("id").primaryKey(),
  blood_group: bloodGroupEnum("blood_group").notNull(),
  units: integer("units").notNull(),
  expiry_date: timestamp("expiry_date").notNull(),
  hospital_id: integer("hospital_id").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Blood requests table
export const bloodRequests = pgTable("blood_requests", {
  id: serial("id").primaryKey(),
  patient_id: integer("patient_id").notNull(),
  patient_name: text("patient_name").notNull(),
  patient_age: integer("patient_age").notNull(),
  blood_group: bloodGroupEnum("blood_group").notNull(),
  units: integer("units").notNull(),
  hospital: text("hospital").notNull(),
  location: text("location").notNull(),
  required_date: timestamp("required_date").notNull(),
  urgency: urgencyLevelEnum("urgency").notNull(),
  reason: text("reason"),
  contact_number: text("contact_number").notNull(),
  status: requestStatusEnum("status").default("Pending").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Blood donations table
export const bloodDonations = pgTable("blood_donations", {
  id: serial("id").primaryKey(),
  donor_id: integer("donor_id").notNull(),
  blood_group: bloodGroupEnum("blood_group").notNull(),
  units: integer("units").notNull(),
  donation_date: timestamp("donation_date").defaultNow().notNull(),
  hospital_id: integer("hospital_id").notNull(),
  tx_hash: text("tx_hash"),
  verified: boolean("verified").default(false).notNull(),
});

// Hospitals/Blood banks table
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Eligibility quiz history
export const eligibilityHistory = pgTable("eligibility_history", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  eligible: boolean("eligible").notNull(),
  reason: text("reason"),
  check_date: timestamp("check_date").defaultNow().notNull(),
});

// Create insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  created_at: true, 
  wallet_address: true 
});

export const insertBloodInventorySchema = createInsertSchema(bloodInventory).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const insertBloodRequestSchema = createInsertSchema(bloodRequests).omit({ 
  id: true, 
  created_at: true, 
  updated_at: true, 
  status: true 
});

export const insertBloodDonationSchema = createInsertSchema(bloodDonations).omit({ 
  id: true, 
  tx_hash: true, 
  verified: true 
});

export const insertHospitalSchema = createInsertSchema(hospitals).omit({ 
  id: true, 
  created_at: true 
});

export const insertEligibilityHistorySchema = createInsertSchema(eligibilityHistory).omit({ 
  id: true, 
  check_date: true 
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BloodInventory = typeof bloodInventory.$inferSelect;
export type InsertBloodInventory = z.infer<typeof insertBloodInventorySchema>;

export type BloodRequest = typeof bloodRequests.$inferSelect;
export type InsertBloodRequest = z.infer<typeof insertBloodRequestSchema>;

export type BloodDonation = typeof bloodDonations.$inferSelect;
export type InsertBloodDonation = z.infer<typeof insertBloodDonationSchema>;

export type Hospital = typeof hospitals.$inferSelect;
export type InsertHospital = z.infer<typeof insertHospitalSchema>;

export type EligibilityHistory = typeof eligibilityHistory.$inferSelect;
export type InsertEligibilityHistory = z.infer<typeof insertEligibilityHistorySchema>;
