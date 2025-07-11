import { 
  customers, 
  routes, 
  messages, 
  binCleaningAppointments,
  type Customer, 
  type InsertCustomer,
  type Route,
  type InsertRoute,
  type Message,
  type InsertMessage,
  type BinCleaningAppointment,
  type InsertBinCleaningAppointment
} from "@shared/schema";

export interface IStorage {
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Route operations
  getRoutes(): Promise<Route[]>;
  getRoute(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined>;
  deleteRoute(id: number): Promise<boolean>;
  
  // Message operations
  getMessages(): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, message: Partial<InsertMessage>): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;
  
  // Bin cleaning operations
  getBinCleaningAppointments(): Promise<BinCleaningAppointment[]>;
  getBinCleaningAppointment(id: number): Promise<BinCleaningAppointment | undefined>;
  createBinCleaningAppointment(appointment: InsertBinCleaningAppointment): Promise<BinCleaningAppointment>;
  updateBinCleaningAppointment(id: number, appointment: Partial<InsertBinCleaningAppointment>): Promise<BinCleaningAppointment | undefined>;
  deleteBinCleaningAppointment(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private customers: Map<number, Customer>;
  private routes: Map<number, Route>;
  private messages: Map<number, Message>;
  private binCleaningAppointments: Map<number, BinCleaningAppointment>;
  private currentCustomerId: number;
  private currentRouteId: number;
  private currentMessageId: number;
  private currentBinCleaningId: number;

  constructor() {
    this.customers = new Map();
    this.routes = new Map();
    this.messages = new Map();
    this.binCleaningAppointments = new Map();
    this.currentCustomerId = 1;
    this.currentRouteId = 1;
    this.currentMessageId = 1;
    this.currentBinCleaningId = 1;
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).sort((a, b) => a.id - b.id);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, customerUpdate: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;

    const updatedCustomer = { ...customer, ...customerUpdate };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Route operations
  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values()).sort((a, b) => a.id - b.id);
  }

  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = this.currentRouteId++;
    const route: Route = {
      ...insertRoute,
      id,
      createdAt: new Date(),
    };
    this.routes.set(id, route);
    return route;
  }

  async updateRoute(id: number, routeUpdate: Partial<InsertRoute>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (!route) return undefined;

    const updatedRoute = { ...route, ...routeUpdate };
    this.routes.set(id, updatedRoute);
    return updatedRoute;
  }

  async deleteRoute(id: number): Promise<boolean> {
    return this.routes.delete(id);
  }

  // Message operations
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessage(id: number, messageUpdate: Partial<InsertMessage>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;

    const updatedMessage = { ...message, ...messageUpdate };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async deleteMessage(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }

  // Bin cleaning operations
  async getBinCleaningAppointments(): Promise<BinCleaningAppointment[]> {
    return Array.from(this.binCleaningAppointments.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async getBinCleaningAppointment(id: number): Promise<BinCleaningAppointment | undefined> {
    return this.binCleaningAppointments.get(id);
  }

  async createBinCleaningAppointment(insertAppointment: InsertBinCleaningAppointment): Promise<BinCleaningAppointment> {
    const id = this.currentBinCleaningId++;
    const appointment: BinCleaningAppointment = {
      ...insertAppointment,
      id,
      createdAt: new Date(),
    };
    this.binCleaningAppointments.set(id, appointment);
    return appointment;
  }

  async updateBinCleaningAppointment(id: number, appointmentUpdate: Partial<InsertBinCleaningAppointment>): Promise<BinCleaningAppointment | undefined> {
    const appointment = this.binCleaningAppointments.get(id);
    if (!appointment) return undefined;

    const updatedAppointment = { ...appointment, ...appointmentUpdate };
    this.binCleaningAppointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteBinCleaningAppointment(id: number): Promise<boolean> {
    return this.binCleaningAppointments.delete(id);
  }
}

export const storage = new MemStorage();
