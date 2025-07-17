import { pgTable, serial, text, timestamp, boolean, integer, decimal, jsonb } from 'drizzle-orm/pg-core';
import { z } from "zod";

// Customers table
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull().unique(),
  password: text('password').notNull(), // ✅ Added password field
  address: text('address').notNull().default(''),
  plan: text('plan').notNull().default('free'), // free, basic, premium, ultimate
  status: text('status').notNull().default('active'),
  role: text('role').notNull().default('customer'), // customer, admin
  joinDate: timestamp('join_date').notNull().defaultNow(),
  nextServiceDate: timestamp('next_service_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Admin users table (if you need separate admin accounts)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // This should be hashed
  role: text("role").notNull().default("admin"),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Appointments table
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  type: text('type').notNull(), // 'bin-cleaning', 'bin-valet'
  date: timestamp('date').notNull(),
  timeSlot: text('time_slot').notNull(),
  status: text('status').notNull().default('scheduled'), // scheduled, completed, cancelled
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Tasks table for daily routes
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  type: text('type').notNull(), // 'pickup', 'return'
  scheduledDate: timestamp('scheduled_date').notNull(),
  status: text('status').notNull().default('pending'), // pending, in-progress, completed
  completedAt: timestamp('completed_at'),
  assignedTo: text('assigned_to'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  direction: text('direction').notNull(), // 'inbound', 'outbound'
  content: text('content').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: text('type').notNull(), // 'monthly', 'yearly'
  status: text('status').notNull().default('pending'), // pending, completed, failed
  stripePaymentId: text('stripe_payment_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// ✅ Updated Zod validation schemas
export const insertCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().default(''),
  plan: z.enum(['free', 'basic', 'premium', 'ultimate']).default('free'),
  role: z.enum(['customer', 'admin']).default('customer'),
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(1, "Password is required"),
}).refine((data) => data.email || data.phone, {
  message: "Either email or phone is required",
});

export const insertRouteSchema = z.object({
  driverId: z.string(),
  routeDate: z.string(),
});

export const insertMessageSchema = z.object({
  customerId: z.number(),
  content: z.string(),
  direction: z.enum(['inbound', 'outbound']).default('inbound'),
});

export const insertBinCleaningAppointmentSchema = z.object({
  customerId: z.number(),
  appointmentDate: z.string().datetime(),
  notes: z.string().optional(),
});

// Type exports
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;