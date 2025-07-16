import { pgTable, serial, text, timestamp, boolean, integer, decimal, jsonb } from 'drizzle-orm/pg-core';
import { z } from "zod"; // ✅ only once

// Customers table
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull().unique(),
  address: text('address').notNull(),
  plan: text('plan').notNull().default('basic'), // basic, premium, ultimate
  status: text('status').notNull().default('active'),
  joinDate: timestamp('join_date').notNull().defaultNow(),
  nextServiceDate: timestamp('next_service_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Admin users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // This should be hashed
  role: text('role').notNull().default('admin'),
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

// ✅ Zod validation schemas
export const insertCustomerSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
});

export const insertRouteSchema = z.object({
  driverId: z.string(),
  routeDate: z.string(), // or z.date() if you're using Date objects
});

export const insertMessageSchema = z.object({
  customerId: z.string(),
  content: z.string(),
});

export const insertBinCleaningAppointmentSchema = z.object({
  customerId: z.string().uuid(),
  appointmentDate: z.string().datetime(),
  notes: z.string().optional(),
});
