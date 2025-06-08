import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcrypt";
import session from "express-session";
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

// Étendre le type de session pour inclure les données utilisateur
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    user?: {
      id: number;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
    };
  }
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
}

// Middleware d'authentification basé sur les sessions
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Non connecté" });
  }
  
  req.user = req.session.user;
  next();
}

// Role-based authorization middleware
function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

// Helper functions for address parsing
function extractCityFromAddress(address: string): string | null {
  if (!address) return null;
  const parts = address.split(',');
  return parts.length >= 2 ? parts[parts.length - 2].trim() : null;
}

function extractStateFromAddress(address: string): string | null {
  if (!address) return null;
  const parts = address.split(',');
  return parts.length >= 1 ? parts[parts.length - 1].trim().split(' ')[0] : null;
}

function extractZipFromAddress(address: string): string | null {
  if (!address) return null;
  const zipMatch = address.match(/\b\d{5}\b/);
  return zipMatch ? zipMatch[0] : null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // WebSocket setup for real-time notifications
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<number, WebSocket>();

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'auth' && data.userId) {
          clients.set(data.userId, ws);
          console.log(`User ${data.userId} authenticated via WebSocket`);
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
          console.log(`User ${userId} disconnected from WebSocket`);
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

  // Routes d'authentification
  app.post('/api/auth/login', async (req, res) => {
    try {
      console.log('Tentative de connexion pour:', req.body.email);
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log('Utilisateur non trouvé:', email);
        return res.status(401).json({ message: "Identifiants invalides" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        console.log('Mot de passe invalide pour utilisateur:', email);
        return res.status(401).json({ message: "Identifiants invalides" });
      }

      if (!user.isActive) {
        console.log('Compte désactivé pour utilisateur:', email);
        return res.status(401).json({ message: "Compte désactivé" });
      }

      // Stocker les données utilisateur dans la session
      req.session.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };

      console.log('Connexion réussie pour:', email, 'Rôle:', user.role);

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      res.status(400).json({ message: "Demande invalide" });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      res.status(500).json({ message: "Erreur serveur interne" });
    }
  });

  // Change password route
  app.post('/api/auth/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Non connecté' });
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).send('Mot de passe actuel et nouveau mot de passe requis');
      }

      if (newPassword.length < 6) {
        return res.status(400).send('Le nouveau mot de passe doit contenir au moins 6 caractères');
      }

      // Get current user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).send('Utilisateur non trouvé');
      }

      // Verify current password
      const bcrypt = require('bcrypt');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).send('Mot de passe actuel incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await storage.updateUser(req.user.id, { password: hashedNewPassword });
      
      res.json({ message: 'Mot de passe modifié avec succès' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).send('Erreur lors du changement de mot de passe');
    }
  });

  app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Erreur déconnexion:', err);
          return res.status(500).json({ message: "Erreur de déconnexion" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Déconnexion réussie" });
      });
    } catch (error) {
      console.error('Erreur logout:', error);
      res.status(500).json({ message: "Erreur serveur" });
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
      console.log(`Fetching orders for user ${req.user!.id} with role ${req.user!.role}`);
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

      console.log(`Retrieved ${orders.length} orders`);
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

  // POST /api/orders - Create order with multiple components
  app.post('/api/orders', authenticateToken, requireRole(['admin', 'receptionist']), async (req: AuthenticatedRequest, res) => {
    try {
      console.log('📦 Creating new order with data:', req.body);
      
      const { 
        customerEmail, 
        customerFirstName, 
        customerLastName, 
        customerPhone,
        selectedComponents, // Array of components with quantities
        totalAmount, 
        notes, 
        shippingAddress 
      } = req.body;
      
      // ✅ FIXED: Better validation with clearer error messages
      if (!customerFirstName || !customerLastName || !customerEmail || !shippingAddress) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ 
          message: "Missing required fields: firstName, lastName, email, shippingAddress" 
        });
      }

      // ✅ FIXED: Require components for new orders
      if (!selectedComponents || !Array.isArray(selectedComponents) || selectedComponents.length === 0) {
        return res.status(400).json({ 
          message: "At least one component must be selected from inventory" 
        });
      }

      // ✅ FIXED: Better component validation
      for (const comp of selectedComponents) {
        if (!comp.id || !comp.quantity || comp.quantity <= 0 || !comp.price) {
          return res.status(400).json({ 
            message: "Invalid component data: each component must have id, quantity > 0, and price" 
          });
        }
      }

      // ✅ FIXED: Calculate total from components (more accurate)
      const calculatedTotal = selectedComponents.reduce((sum, comp) => 
        sum + (parseFloat(comp.price) * comp.quantity), 0);
      
      const orderTotalAmount = totalAmount ? parseFloat(totalAmount) : calculatedTotal;

      // ✅ FIXED: Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // ✅ FIXED: Validate amount
      if (isNaN(orderTotalAmount) || orderTotalAmount <= 0) {
        return res.status(400).json({ message: "Invalid total amount" });
      }

      // Check if customer exists, if not create new one
      let customer;
      try {
        customer = await storage.getCustomerByEmail(customerEmail.toLowerCase());
      } catch (error) {
        customer = null;
      }
      
      let customerId;
      
      if (customer) {
        customerId = customer.id;
        console.log('✅ Found existing customer:', customer.email);
        
        // Update customer info if provided
        await storage.updateCustomer(customer.id, {
          firstName: customerFirstName,
          lastName: customerLastName,
          phone: customerPhone,
          address: shippingAddress,
        });
        
      } else {
        console.log('🆕 Creating new customer:', customerEmail);
        
        // Create new customer
        const newCustomer = await storage.createCustomer({
          firstName: customerFirstName,
          lastName: customerLastName,
          email: customerEmail.toLowerCase(),
          phone: customerPhone || null,
          address: shippingAddress,
          city: extractCityFromAddress(shippingAddress),
          state: extractStateFromAddress(shippingAddress),
          zipCode: extractZipFromAddress(shippingAddress),
        });
        
        customerId = newCustomer.id;
      }
      
      // Generate unique order number
      const orderNumber = `UPC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      console.log('🏗️ Creating order:', orderNumber);
      
      // ✅ FIXED: Better specifications structure
      const componentsSpecs = selectedComponents.map(comp => ({
        id: comp.id,
        name: comp.name,
        quantity: comp.quantity,
        price: parseFloat(comp.price),
        type: comp.type,
        brand: comp.brand || null,
        model: comp.model || null,
        subtotal: parseFloat(comp.price) * comp.quantity
      }));
      
      const orderSpecs = {
        components: componentsSpecs,
        componentCount: selectedComponents.length,
        customBuild: true,
        totalCalculated: calculatedTotal
      };
      
      // Create the order
      const orderData = {
        orderNumber,
        customerId: customerId,
        productId: null, // Always null for component-based orders
        totalAmount: orderTotalAmount.toFixed(2),
        specifications: orderSpecs,
        notes: notes || null,
        shippingAddress: shippingAddress,
        status: 'created' as const,
      };
      
      const order = await storage.createOrder(orderData);

      // ✅ FIXED: Add each component to order_components table
      for (const comp of selectedComponents) {
        await storage.addOrderComponent({
          orderId: order.id,
          componentId: comp.id,
          quantity: comp.quantity,
          priceAtTime: parseFloat(comp.price),
          selectedBy: req.user!.id,
        });
      }

      // Create initial status history
      await storage.addOrderStatusHistory({
        orderId: order.id,
        status: 'created',
        changedBy: req.user!.id,
        notes: `Order created with ${selectedComponents.length} components by ${req.user!.firstName || req.user!.role}`,
      });

      console.log('✅ Order created successfully:', order.id);

      // Notify relevant users
      const notification = {
        type: 'order_created',
        title: 'New Custom Order Created',
        message: `Order ${orderNumber} has been created with ${selectedComponents.length} components by ${req.user!.firstName || req.user!.role}`,
        orderId: order.id,
      };
      broadcastToRoles(['admin', 'components'], notification);

      res.status(201).json({
        message: "Order created successfully",
        order: order,
        customerId: customerId,
        componentsCount: selectedComponents.length
      });
      
    } catch (error) {
      console.error('❌ Create order error:', error);
      res.status(500).json({ 
        message: "Failed to create order", 
        error: error.message 
      });
    }
  });

  app.patch('/api/orders/:id/status', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status, notes } = req.body;

      console.log(`🔄 Updating order ${orderId} status to ${status} by ${req.user!.role}`);

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

      console.log(`✅ Order ${orderId} status updated to ${status}`);

      // Create notification for status change
      const notification = {
        type: 'status_changed',
        title: 'Order Status Updated',
        message: `Order ${order.orderNumber} status changed to ${status.replace('_', ' ')}`,
        orderId: order.id,
      };

      // Notify customer and relevant staff
      if (order.customerId) {
        try {
          await storage.createNotification({
            userId: order.customerId,
            title: notification.title,
            message: notification.message,
            type: 'info',
            relatedOrderId: order.id,
          });
          broadcastToUser(order.customerId, notification);
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }
      }

      broadcastToRoles(['admin'], notification);

      res.json({
        message: "Order status updated successfully",
        order: order
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // ✅ ENHANCED: Component management routes with better error handling
  app.get('/api/components', authenticateToken, async (req, res) => {
    try {
      const { type, search } = req.query;
      console.log(`🔍 Components API called: type=${type}, search=${search}`);
      
      let components;
      
      if (search && typeof search === 'string' && search.trim()) {
        console.log(`🔍 Searching components with term: "${search}"`);
        components = await storage.searchComponents(search.trim());
      } else if (type && typeof type === 'string') {
        console.log(`🔍 Getting components by type: "${type}"`);
        components = await storage.getComponentsByType(type);
      } else {
        console.log('🔍 Getting all components');
        components = await storage.getAllComponents();
      }

      console.log(`📦 API returning ${components.length} components`);
      res.json(components);
      
    } catch (error) {
      console.error('❌ Get components error:', error);
      res.status(500).json({ 
        message: "Failed to fetch components",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

  app.post('/api/components', authenticateToken, requireRole(['admin', 'stock_manager']), async (req, res) => {
    try {
      console.log('Creating component with data:', req.body);
      
      // Validate required fields
      if (!req.body.name || !req.body.type) {
        return res.status(400).json({ 
          message: "Name and type are required fields" 
        });
      }
      
      const componentData = insertComponentSchema.parse(req.body);
      const component = await storage.createComponent(componentData);
      res.status(201).json(component);
    } catch (error) {
      console.error('Create component error:', error);
      if (error.name === 'ZodError') {
        const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        res.status(400).json({ message: `Validation error: ${issues}` });
      } else {
        res.status(500).json({ message: "Failed to create component" });
      }
    }
  });

  // Update component route
  app.patch('/api/components/:id', authenticateToken, requireRole(['admin', 'stock_manager']), async (req, res) => {
    try {
      const componentId = parseInt(req.params.id);
      const updates = req.body;
      
      // Get current component
      const currentComponent = await storage.getComponent(componentId);
      if (!currentComponent) {
        return res.status(404).json({ message: "Component not found" });
      }
      
      // Update the component
      const updatedComponent = await storage.updateComponent(componentId, updates);
      res.json(updatedComponent);
    } catch (error) {
      console.error('Update component error:', error);
      res.status(400).json({ message: "Failed to update component" });
    }
  });

  // Update component stock route
  app.patch('/api/components/:id/stock', authenticateToken, requireRole(['admin', 'stock_manager']), async (req, res) => {
    try {
      const componentId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ message: "Valid quantity required" });
      }
      
      const updatedComponent = await storage.updateComponentStock(componentId, quantity);
      res.json(updatedComponent);
    } catch (error) {
      console.error('Update component stock error:', error);
      res.status(400).json({ message: "Failed to update component stock" });
    }
  });

  // Order components routes
  app.post('/api/orders/:id/components', authenticateToken, requireRole(['admin', 'stock_manager']), async (req, res) => {
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

  // Get components for specific order
  app.get('/api/orders/:id/components', authenticateToken, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const components = await storage.getOrderComponents(orderId);
      res.json(components);
    } catch (error) {
      console.error('Get order components error:', error);
      res.status(500).json({ message: "Failed to fetch order components" });
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

  // ✅ FIXED: Products routes - Return empty array to force frontend to use components
  app.get('/api/products', authenticateToken, async (req, res) => {
    try {
      console.log('⚠️ Products API called - redirecting to components');
      // Return empty array to force frontend to use /api/components instead
      res.json([]);
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // User management routes
  app.get('/api/users', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/users/stats', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  app.post('/api/users', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userToCreate = {
        ...userData,
        password: hashedPassword,
      };
      
      const user = await storage.createUser(userToCreate);
      
      // Don't return password in response
      const { password, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error('Create user error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", details: error.errors });
      }
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.patch('/api/users/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      console.log('Updating user:', userId, 'with data:', updateData);
      
      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Don't return password in response
      const { password, ...userResponse } = updatedUser;
      
      console.log('User updated successfully:', userResponse);
      res.json(userResponse);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/users/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent admin from deleting themselves
      if (req.user!.id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.updateUser(userId, { isActive: false });
      res.json({ message: "User deactivated successfully" });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(400).json({ message: "Failed to delete user" });
    }
  });

  console.log('🚀 All routes registered successfully');
  return httpServer;
}