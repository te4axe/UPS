import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  decimal,
  jsonb,
  varchar,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with role-based access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(), // admin, receptionist, components, assembly, packaging, shipping, customer
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table for order management
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

// PC Configurations/Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // gaming, office, workstation
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Components inventory
export const components = pgTable("components", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // processor, graphics, memory, storage, motherboard, psu
  brand: text("brand"),
  model: text("model"),
  specifications: jsonb("specifications"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").default(0),
  minStockLevel: integer("min_stock_level").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders table with status tracking
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  productId: integer("product_id").references(() => products.id),
  status: text("status").notNull().default("created"), // created, confirmed, components_selected, assembly_started, assembly_completed, packaged, shipped, delivered
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  specifications: jsonb("specifications"), // Custom PC specs
  notes: text("notes"),
  shippingAddress: text("shipping_address"),
  trackingNumber: text("tracking_number"),
  estimatedDelivery: timestamp("estimated_delivery"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order status history for tracking
export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  status: text("status").notNull(),
  previousStatus: text("previous_status"),
  changedBy: integer("changed_by").references(() => users.id),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Order components (which components are selected for each order)
export const orderComponents = pgTable("order_components", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  componentId: integer("component_id").references(() => components.id),
  quantity: integer("quantity").default(1),
  priceAtTime: decimal("price_at_time", { precision: 10, scale: 2 }).notNull(),
  selectedBy: integer("selected_by").references(() => users.id),
  selectedAt: timestamp("selected_at").defaultNow(),
});

// Notifications for real-time updates
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, success, warning, error
  isRead: boolean("is_read").default(false),
  relatedOrderId: integer("related_order_id").references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  statusChanges: many(orderStatusHistory),
  componentSelections: many(orderComponents),
  notifications: many(notifications),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orders: many(orders),
}));

export const componentsRelations = relations(components, ({ many }) => ({
  orderComponents: many(orderComponents),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  statusHistory: many(orderStatusHistory),
  components: many(orderComponents),
  notifications: many(notifications),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
  changedBy: one(users, {
    fields: [orderStatusHistory.changedBy],
    references: [users.id],
  }),
}));

export const orderComponentsRelations = relations(orderComponents, ({ one }) => ({
  order: one(orders, {
    fields: [orderComponents.orderId],
    references: [orders.id],
  }),
  component: one(components, {
    fields: [orderComponents.componentId],
    references: [components.id],
  }),
  selectedBy: one(users, {
    fields: [orderComponents.selectedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  relatedOrder: one(orders, {
    fields: [notifications.relatedOrderId],
    references: [orders.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertComponentSchema = createInsertSchema(components).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderStatusHistorySchema = createInsertSchema(orderStatusHistory).omit({
  id: true,
  timestamp: true,
});

export const insertOrderComponentSchema = createInsertSchema(orderComponents).omit({
  id: true,
  selectedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Component = typeof components.$inferSelect;
export type InsertComponent = z.infer<typeof insertComponentSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type InsertOrderStatusHistory = z.infer<typeof insertOrderStatusHistorySchema>;
export type OrderComponent = typeof orderComponents.$inferSelect;
export type InsertOrderComponent = z.infer<typeof insertOrderComponentSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Auth schema for login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Order status enum
export const ORDER_STATUSES = [
  "created",
  "confirmed", 
  "components_selected",
  "assembly_started",
  "assembly_completed",
  "packaged",
  "shipped",
  "delivered"
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

// User roles enum
export const USER_ROLES = [
  "admin",
  "receptionist",
  "components", 
  "assembly",
  "packaging",
  "shipping",
  "customer"
] as const;

export type UserRole = typeof USER_ROLES[number];
