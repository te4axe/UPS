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
import { eq, desc, and, or, like, count, ilike, gte, lte, sql } from "drizzle-orm";

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
  updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer>;
  getAllCustomers(): Promise<Customer[]>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Component operations
  getComponent(id: number): Promise<Component | undefined>;
  getAllComponents(): Promise<Component[]>;
  getComponentsByType(type: string): Promise<Component[]>;
  searchComponents(searchTerm: string): Promise<Component[]>;
  createComponent(component: InsertComponent): Promise<Component>;
  updateComponentStock(id: number, quantity: number): Promise<Component>;
  getLowStockComponents(): Promise<Component[]>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByCustomer(customerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string, userId: number, notes?: string): Promise<Order>;
  updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order>;

  // Order components operations
  getOrderComponents(orderId: number): Promise<OrderComponent[]>;
  addOrderComponent(orderComponent: InsertOrderComponent): Promise<OrderComponent>;
  removeOrderComponent(orderId: number, componentId: number): Promise<void>;
  updateOrderComponentQuantity(orderId: number, componentId: number, quantity: number): Promise<OrderComponent>;

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
  getComponentStats(): Promise<{
    total: number;
    lowStock: number;
    outOfStock: number;
  }>;
  getDashboardStats(): Promise<{
    orders: any;
    components: any;
    users: any;
    revenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values({
          ...insertUser,
          email: insertUser.email.toLowerCase(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    try {
      const [user] = await db
        .update(users)
        .set({ 
          ...updates, 
          updatedAt: new Date(),
          ...(updates.email && { email: updates.email.toLowerCase() })
        })
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users).orderBy(desc(users.createdAt));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      return await db.select().from(users)
        .where(and(eq(users.role, role), eq(users.isActive, true)))
        .orderBy(users.firstName, users.lastName);
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  // Customer operations
  async getCustomer(id: number): Promise<Customer | undefined> {
    try {
      const [customer] = await db.select().from(customers).where(eq(customers.id, id));
      return customer || undefined;
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    try {
      const [customer] = await db.select().from(customers).where(eq(customers.email, email.toLowerCase()));
      return customer || undefined;
    } catch (error) {
      console.error('Error getting customer by email:', error);
      throw error;
    }
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    try {
      const [customer] = await db
        .insert(customers)
        .values({
          ...insertCustomer,
          email: insertCustomer.email.toLowerCase(),
          createdAt: new Date()
        })
        .returning();
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer> {
    try {
      const [customer] = await db
        .update(customers)
        .set({
          ...updates,
          ...(updates.email && { email: updates.email.toLowerCase() })
        })
        .where(eq(customers.id, id))
        .returning();
      return customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async getAllCustomers(): Promise<Customer[]> {
    try {
      return await db.select().from(customers).orderBy(desc(customers.createdAt));
    } catch (error) {
      console.error('Error getting all customers:', error);
      throw error;
    }
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product || undefined;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      return await db.select().from(products)
        .where(eq(products.isActive, true))
        .orderBy(products.name);
    } catch (error) {
      console.error('Error getting all products:', error);
      throw error;
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    try {
      const [product] = await db
        .insert(products)
        .values({
          ...insertProduct,
          createdAt: new Date()
        })
        .returning();
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Component operations
  async getComponent(id: number): Promise<Component | undefined> {
    try {
      const [component] = await db.select().from(components).where(eq(components.id, id));
      return component || undefined;
    } catch (error) {
      console.error('Error getting component:', error);
      throw error;
    }
  }

  async getAllComponents(): Promise<Component[]> {
    try {
      return await db.select().from(components)
        .where(eq(components.isActive, true))
        .orderBy(components.type, components.name);
    } catch (error) {
      console.error('Error getting all components:', error);
      throw error;
    }
  }

  async getComponentsByType(type: string): Promise<Component[]> {
    try {
      return await db.select().from(components)
        .where(and(eq(components.type, type), eq(components.isActive, true)))
        .orderBy(components.name);
    } catch (error) {
      console.error('Error getting components by type:', error);
      throw error;
    }
  }

  // NEW: Search components by name, type, brand, or model
  async searchComponents(searchTerm: string): Promise<Component[]> {
    try {
      const search = `%${searchTerm.toLowerCase()}%`;
      
      return await db.select().from(components)
        .where(and(
          or(
            ilike(components.name, search),
            ilike(components.type, search),
            ilike(components.brand, search),
            ilike(components.model, search)
          ),
          eq(components.isActive, true)
        ))
        .orderBy(
          desc(components.stockQuantity), // Show in-stock items first
          components.name
        )
        .limit(50); // Limit results for performance
    } catch (error) {
      console.error('Error searching components:', error);
      throw error;
    }
  }

  async createComponent(insertComponent: InsertComponent): Promise<Component> {
    try {
      const [component] = await db
        .insert(components)
        .values({
          ...insertComponent,
          createdAt: new Date()
        })
        .returning();
      return component;
    } catch (error) {
      console.error('Error creating component:', error);
      throw error;
    }
  }

  async updateComponentStock(id: number, quantity: number): Promise<Component> {
    try {
      const [component] = await db
        .update(components)
        .set({ stockQuantity: quantity })
        .where(eq(components.id, id))
        .returning();
      return component;
    } catch (error) {
      console.error('Error updating component stock:', error);
      throw error;
    }
  }

  // NEW: Get components with low stock
  async getLowStockComponents(): Promise<Component[]> {
    try {
      return await db.select().from(components)
        .where(and(
          eq(components.isActive, true),
          sql`${components.stockQuantity} <= ${components.minStockLevel}`
        ))
        .orderBy(components.stockQuantity);
    } catch (error) {
      console.error('Error getting low stock components:', error);
      throw error;
    }
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      return order || undefined;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
      return order || undefined;
    } catch (error) {
      console.error('Error getting order by number:', error);
      throw error;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      return await db.select().from(orders).orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    try {
      return await db.select().from(orders)
        .where(eq(orders.status, status))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw error;
    }
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    try {
      return await db.select().from(orders)
        .where(eq(orders.customerId, userId))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error('Error getting orders by user:', error);
      throw error;
    }
  }

  // NEW: Get orders by customer ID
  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    try {
      return await db.select().from(orders)
        .where(eq(orders.customerId, customerId))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error('Error getting orders by customer:', error);
      throw error;
    }
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    try {
      const [order] = await db
        .insert(orders)
        .values({
          ...insertOrder,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string, userId: number, notes?: string): Promise<Order> {
    try {
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
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order> {
    try {
      const [order] = await db
        .update(orders)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(orders.id, id))
        .returning();
      return order;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Order components operations
  async getOrderComponents(orderId: number): Promise<OrderComponent[]> {
    try {
      return await db.select().from(orderComponents)
        .where(eq(orderComponents.orderId, orderId))
        .orderBy(orderComponents.selectedAt);
    } catch (error) {
      console.error('Error getting order components:', error);
      throw error;
    }
  }

  async addOrderComponent(insertOrderComponent: InsertOrderComponent): Promise<OrderComponent> {
    try {
      const [orderComponent] = await db
        .insert(orderComponents)
        .values({
          ...insertOrderComponent,
          selectedAt: new Date()
        })
        .returning();
      return orderComponent;
    } catch (error) {
      console.error('Error adding order component:', error);
      throw error;
    }
  }

  async removeOrderComponent(orderId: number, componentId: number): Promise<void> {
    try {
      await db.delete(orderComponents)
        .where(and(
          eq(orderComponents.orderId, orderId),
          eq(orderComponents.componentId, componentId)
        ));
    } catch (error) {
      console.error('Error removing order component:', error);
      throw error;
    }
  }

  // NEW: Update order component quantity
  async updateOrderComponentQuantity(orderId: number, componentId: number, quantity: number): Promise<OrderComponent> {
    try {
      const [orderComponent] = await db
        .update(orderComponents)
        .set({ quantity })
        .where(and(
          eq(orderComponents.orderId, orderId),
          eq(orderComponents.componentId, componentId)
        ))
        .returning();
      return orderComponent;
    } catch (error) {
      console.error('Error updating order component quantity:', error);
      throw error;
    }
  }

  // Order status history operations
  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    try {
      return await db.select().from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, orderId))
        .orderBy(desc(orderStatusHistory.timestamp));
    } catch (error) {
      console.error('Error getting order status history:', error);
      throw error;
    }
  }

  async addOrderStatusHistory(insertStatusHistory: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    try {
      const [statusHistory] = await db
        .insert(orderStatusHistory)
        .values({
          ...insertStatusHistory,
          timestamp: new Date()
        })
        .returning();
      return statusHistory;
    } catch (error) {
      console.error('Error adding order status history:', error);
      throw error;
    }
  }

  // Notification operations
  async getUserNotifications(userId: number): Promise<Notification[]> {
    try {
      return await db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(50); // Limit for performance
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    try {
      const [notification] = await db
        .insert(notifications)
        .values({
          ...insertNotification,
          createdAt: new Date()
        })
        .returning();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markNotificationAsRead(id: number): Promise<void> {
    try {
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    try {
      await db.update(notifications)
        .set({ isRead: true })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Statistics
  async getOrderStats(): Promise<{
    total: number;
    inProduction: number;
    shippedToday: number;
    revenue: number;
  }> {
    try {
      const [totalResult] = await db.select({ count: count() }).from(orders);
      
      const [inProductionResult] = await db.select({ count: count() }).from(orders)
        .where(or(
          eq(orders.status, "assembly_started"),
          eq(orders.status, "assembly_completed"),
          eq(orders.status, "packaged")
        ));

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const [shippedTodayResult] = await db.select({ count: count() }).from(orders)
        .where(and(
          eq(orders.status, "shipped"),
          gte(orders.updatedAt, startOfDay),
          lte(orders.updatedAt, endOfDay)
        ));

      // Calculate revenue for this month
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const revenueOrders = await db.select().from(orders)
        .where(and(
          or(eq(orders.status, "shipped"), eq(orders.status, "delivered")),
          gte(orders.createdAt, firstDayOfMonth)
        ));

      const revenue = revenueOrders.reduce((sum, order) => 
        sum + parseFloat(order.totalAmount), 0);

      return {
        total: totalResult.count,
        inProduction: inProductionResult.count,
        shippedToday: shippedTodayResult.count,
        revenue,
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw error;
    }
  }

  async getUserStats(): Promise<Record<string, number>> {
    try {
      const allUsers = await this.getAllUsers();
      const stats: Record<string, number> = {};
      
      for (const role of ["admin", "receptionist", "components", "assembly", "packaging", "shipping"]) {
        stats[role] = allUsers.filter(user => user.role === role && user.isActive).length;
      }
      
      stats.total = allUsers.filter(user => user.isActive).length;
      stats.inactive = allUsers.filter(user => !user.isActive).length;
      
      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // NEW: Component statistics
  async getComponentStats(): Promise<{
    total: number;
    lowStock: number;
    outOfStock: number;
  }> {
    try {
      const [totalResult] = await db.select({ count: count() }).from(components)
        .where(eq(components.isActive, true));
      
      const [outOfStockResult] = await db.select({ count: count() }).from(components)
        .where(and(
          eq(components.isActive, true),
          eq(components.stockQuantity, 0)
        ));
      
      const [lowStockResult] = await db.select({ count: count() }).from(components)
        .where(and(
          eq(components.isActive, true),
          sql`${components.stockQuantity} <= ${components.minStockLevel}`,
          sql`${components.stockQuantity} > 0`
        ));

      return {
        total: totalResult.count,
        lowStock: lowStockResult.count,
        outOfStock: outOfStockResult.count,
      };
    } catch (error) {
      console.error('Error getting component stats:', error);
      throw error;
    }
  }

  // NEW: Dashboard statistics combining all metrics
  async getDashboardStats(): Promise<{
    orders: any;
    components: any;
    users: any;
    revenue: number;
  }> {
    try {
      const [orderStats, componentStats, userStats] = await Promise.all([
        this.getOrderStats(),
        this.getComponentStats(),
        this.getUserStats()
      ]);

      return {
        orders: orderStats,
        components: componentStats,
        users: userStats,
        revenue: orderStats.revenue
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();