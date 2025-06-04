import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertUserSchema, 
  insertOrderSchema, 
  insertCustomerSchema,
  insertComponentSchema,
  ORDER_STATUSES
} from "@shared/schema";

interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "ultra-pc-secret-key";

// Middleware for JWT authentication
function authenticateToken(req: AuthenticatedRequest, res: Express.Response, next: Express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Role-based authorization middleware
function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Express.Response, next: Express.NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // WebSocket setup for real-time notifications
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<number, WebSocket>();

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'auth' && data.userId) {
          clients.set(data.userId, ws);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Remove client from map
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          break;
        }
      }
    });
  });

  // Broadcast notification to specific user
  function broadcastToUser(userId: number, notification: any) {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  }

  // Broadcast to all users with specific roles
  function broadcastToRoles(roles: string[], notification: any) {
    for (const [userId, client] of clients.entries()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    }
  }

  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User management routes
  app.get('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })));
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/users/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // Order management routes
  app.get('/api/orders', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      let orders;
      
      if (req.user!.role === 'customer') {
        orders = await storage.getOrdersByUser(req.user!.id);
      } else {
        const { status } = req.query;
        if (status && typeof status === 'string') {
          orders = await storage.getOrdersByStatus(status);
        } else {
          orders = await storage.getAllOrders();
        }
      }

      res.json(orders);
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', authenticateToken, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Get order components and history
      const components = await storage.getOrderComponents(orderId);
      const history = await storage.getOrderStatusHistory(orderId);

      res.json({
        ...order,
        components,
        history,
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', authenticateToken, requireRole(['admin', 'receptionist']), async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Generate order number
      const orderNumber = `PC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      const order = await storage.createOrder({
        ...orderData,
        orderNumber,
        status: 'created',
      });

      // Create initial status history
      await storage.addOrderStatusHistory({
        orderId: order.id,
        status: 'created',
        changedBy: req.user!.id,
        notes: 'Order created',
      });

      // Notify relevant users
      const notification = {
        type: 'order_created',
        title: 'New Order Created',
        message: `Order ${orderNumber} has been created`,
        orderId: order.id,
      };
      broadcastToRoles(['admin', 'receptionist'], notification);

      res.status(201).json(order);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.patch('/api/orders/:id/status', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status, notes } = req.body;

      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Check role permissions for status changes
      const rolePermissions: Record<string, string[]> = {
        'receptionist': ['confirmed'],
        'components': ['components_selected'],
        'assembly': ['assembly_started', 'assembly_completed'],
        'packaging': ['packaged'],
        'shipping': ['shipped'],
        'admin': ORDER_STATUSES as any,
      };

      const allowedStatuses = rolePermissions[req.user!.role] || [];
      if (!allowedStatuses.includes(status)) {
        return res.status(403).json({ message: "Not authorized to set this status" });
      }

      const order = await storage.updateOrderStatus(orderId, status, req.user!.id, notes);

      // Create notification for status change
      const notification = {
        type: 'status_changed',
        title: 'Order Status Updated',
        message: `Order ${order.orderNumber} status changed to ${status}`,
        orderId: order.id,
      };

      // Notify customer and relevant staff
      if (order.customerId) {
        await storage.createNotification({
          userId: order.customerId,
          title: notification.title,
          message: notification.message,
          type: 'info',
          relatedOrderId: order.id,
        });
        broadcastToUser(order.customerId, notification);
      }

      broadcastToRoles(['admin'], notification);

      res.json(order);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Component management routes
  app.get('/api/components', authenticateToken, async (req, res) => {
    try {
      const { type } = req.query;
      let components;
      
      if (type && typeof type === 'string') {
        components = await storage.getComponentsByType(type);
      } else {
        components = await storage.getAllComponents();
      }

      res.json(components);
    } catch (error) {
      console.error('Get components error:', error);
      res.status(500).json({ message: "Failed to fetch components" });
    }
  });

  app.post('/api/components', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const componentData = insertComponentSchema.parse(req.body);
      const component = await storage.createComponent(componentData);
      res.status(201).json(component);
    } catch (error) {
      console.error('Create component error:', error);
      res.status(400).json({ message: "Failed to create component" });
    }
  });

  // Order components routes
  app.post('/api/orders/:id/components', authenticateToken, requireRole(['admin', 'components']), async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { componentId, quantity, priceAtTime } = req.body;

      const orderComponent = await storage.addOrderComponent({
        orderId,
        componentId,
        quantity,
        priceAtTime,
        selectedBy: req.user!.id,
      });

      res.status(201).json(orderComponent);
    } catch (error) {
      console.error('Add order component error:', error);
      res.status(400).json({ message: "Failed to add component to order" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch('/api/notifications/read-all', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Statistics routes
  app.get('/api/stats/orders', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error('Get order stats error:', error);
      res.status(500).json({ message: "Failed to fetch order statistics" });
    }
  });

  // Customer routes
  app.get('/api/customers', authenticateToken, requireRole(['admin', 'receptionist']), async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post('/api/customers', authenticateToken, requireRole(['admin', 'receptionist']), async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(400).json({ message: "Failed to create customer" });
    }
  });

  // Products routes
  app.get('/api/products', authenticateToken, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  return httpServer;
}
