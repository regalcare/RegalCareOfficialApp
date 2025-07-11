import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  route: text("route").notNull(),
  status: text("status").notNull().default("active"), // active, suspended, cancelled
  plan: text("plan").default("basic"), // basic, premium, ultimate
  monthlyRate: decimal("monthly_rate", { precision: 10, scale: 2 }).default("59.99"), // in dollars
  createdAt: timestamp("created_at").defaultNow(),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  day: text("day").notNull(), // monday, tuesday, etc.
  startTime: text("start_time").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  totalCustomers: integer("total_customers").default(0),
  completedCustomers: integer("completed_customers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  isFromCustomer: boolean("is_from_customer").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const binCleaningAppointments = pgTable("bin_cleaning_appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  address: text("address").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  binCount: integer("bin_count").notNull(),
  price: integer("price").notNull(), // in cents
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertBinCleaningAppointmentSchema = createInsertSchema(binCleaningAppointments).omit({
  id: true,
  createdAt: true,
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type BinCleaningAppointment = typeof binCleaningAppointments.$inferSelect;
export type InsertBinCleaningAppointment = z.infer<typeof insertBinCleaningAppointmentSchema>;
