import {
  users,
  customers,
  products,
  components,
  orders,
  orderStatusHistory,
  orderComponents,
  notifications,
  type User,
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type Product,
  type InsertProduct,
  type Component,
  type InsertComponent,
  type Order,
  type InsertOrder,
  type OrderStatusHistory,
  type InsertOrderStatusHistory,
  type OrderComponent,
  type InsertOrderComponent,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;

  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getAllCustomers(): Promise<Customer[]>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Component operations
  getComponent(id: number): Promise<Component | undefined>;
  getAllComponents(): Promise<Component[]>;
  getComponentsByType(type: string): Promise<Component[]>;
  createComponent(component: InsertComponent): Promise<Component>;
  updateComponentStock(id: number, quantity: number): Promise<Component>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string, userId: number, notes?: string): Promise<Order>;
  updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order>;

  // Order components operations
  getOrderComponents(orderId: number): Promise<OrderComponent[]>;
  addOrderComponent(orderComponent: InsertOrderComponent): Promise<OrderComponent>;
  removeOrderComponent(orderId: number, componentId: number): Promise<void>;

  // Order status history operations
  getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]>;
  addOrderStatusHistory(statusHistory: InsertOrderStatusHistory): Promise<OrderStatusHistory>;

  // Notification operations
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;

  // Statistics
  getOrderStats(): Promise<{
    total: number;
    inProduction: number;
    shippedToday: number;
    revenue: number;
  }>;
  getUserStats(): Promise<Record<string, number>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Customer operations
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  // Component operations
  async getComponent(id: number): Promise<Component | undefined> {
    const [component] = await db.select().from(components).where(eq(components.id, id));
    return component || undefined;
  }

  async getAllComponents(): Promise<Component[]> {
    return await db.select().from(components).where(eq(components.isActive, true));
  }

  async getComponentsByType(type: string): Promise<Component[]> {
    return await db.select().from(components)
      .where(and(eq(components.type, type), eq(components.isActive, true)));
  }

  async createComponent(insertComponent: InsertComponent): Promise<Component> {
    const [component] = await db
      .insert(components)
      .values(insertComponent)
      .returning();
    return component;
  }

  async updateComponentStock(id: number, quantity: number): Promise<Component> {
    const [component] = await db
      .update(components)
      .set({ stockQuantity: quantity })
      .where(eq(components.id, id))
      .returning();
    return component;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order || undefined;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.status, status))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.customerId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string, userId: number, notes?: string): Promise<Order> {
    const order = await this.getOrder(id);
    if (!order) {
      throw new Error("Order not found");
    }

    // Update order status
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    // Add status history entry
    await this.addOrderStatusHistory({
      orderId: id,
      status,
      previousStatus: order.status,
      changedBy: userId,
      notes,
    });

    return updatedOrder;
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Order components operations
  async getOrderComponents(orderId: number): Promise<OrderComponent[]> {
    return await db.select().from(orderComponents)
      .where(eq(orderComponents.orderId, orderId));
  }

  async addOrderComponent(insertOrderComponent: InsertOrderComponent): Promise<OrderComponent> {
    const [orderComponent] = await db
      .insert(orderComponents)
      .values(insertOrderComponent)
      .returning();
    return orderComponent;
  }

  async removeOrderComponent(orderId: number, componentId: number): Promise<void> {
    await db.delete(orderComponents)
      .where(and(
        eq(orderComponents.orderId, orderId),
        eq(orderComponents.componentId, componentId)
      ));
  }

  // Order status history operations
  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    return await db.select().from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(desc(orderStatusHistory.timestamp));
  }

  async addOrderStatusHistory(insertStatusHistory: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    const [statusHistory] = await db
      .insert(orderStatusHistory)
      .values(insertStatusHistory)
      .returning();
    return statusHistory;
  }

  // Notification operations
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Statistics
  async getOrderStats(): Promise<{
    total: number;
    inProduction: number;
    shippedToday: number;
    revenue: number;
  }> {
    const [totalResult] = await db.select({ count: count() }).from(orders);
    const [inProductionResult] = await db.select({ count: count() }).from(orders)
      .where(or(
        eq(orders.status, "assembly_started"),
        eq(orders.status, "assembly_completed"),
        eq(orders.status, "packaged")
      ));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [shippedTodayResult] = await db.select({ count: count() }).from(orders)
      .where(and(
        eq(orders.status, "shipped"),
        eq(orders.updatedAt, today)
      ));

    // Calculate revenue for this month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const revenueOrders = await db.select().from(orders)
      .where(and(
        or(eq(orders.status, "shipped"), eq(orders.status, "delivered")),
        eq(orders.createdAt, firstDayOfMonth)
      ));

    const revenue = revenueOrders.reduce((sum, order) => 
      sum + parseFloat(order.totalAmount), 0);

    return {
      total: totalResult.count,
      inProduction: inProductionResult.count,
      shippedToday: shippedTodayResult.count,
      revenue,
    };
  }

  async getUserStats(): Promise<Record<string, number>> {
    const allUsers = await this.getAllUsers();
    const stats: Record<string, number> = {};
    
    for (const role of ["admin", "receptionist", "components", "assembly", "packaging", "shipping"]) {
      stats[role] = allUsers.filter(user => user.role === role).length;
    }
    
    return stats;
  }
}

export const storage = new DatabaseStorage();
