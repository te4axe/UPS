# Ultra PC - Order Management System

## Overview

Ultra PC is a comprehensive order management system designed for computer hardware assembly and distribution. The application provides role-based workflows for managing the entire PC assembly lifecycle from order creation to delivery, with specialized interfaces for different employee roles including admin, reception, assembly, packaging, shipping, and inventory management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state
- **Build Tool**: Vite for fast development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for API and server-side rendering
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time**: WebSocket integration for live notifications
- **Authentication**: Session-based authentication with bcrypt password hashing

### Database Architecture
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM for type-safe database operations
- **Migration Strategy**: Schema-first approach with Drizzle Kit
- **Connection Pooling**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Authentication System
- Session-based authentication using express-session
- Role-based access control (RBAC) with 6 distinct roles:
  - Admin: Full system access
  - Receptionist: Order creation and customer management
  - Assembly: PC assembly workflow management
  - Packaging: Order packaging and preparation
  - Shipping: Shipment tracking and delivery
  - Inventory: Component stock management

### Order Management
- Complete order lifecycle tracking from creation to delivery
- Status progression: Created → Confirmed → Components Selected → Assembly Started → Assembly Completed → Packaged → Shipped → Delivered
- Real-time status updates via WebSocket notifications
- Component selection and inventory allocation

### Inventory Management
- Real-time component tracking with 60+ pre-configured components
- Stock level monitoring with low-stock alerts
- Component categorization (CPU, GPU, Memory, Storage, etc.)
- Location-based organization for warehouse management

### User Interface
- Responsive design with mobile-first approach
- Role-specific dashboards and navigation
- Real-time notifications system
- Progressive web app capabilities

## Data Flow

### Order Processing Flow
1. **Order Creation**: Receptionist creates order with customer details and specifications
2. **Component Selection**: Inventory manager allocates required components
3. **Assembly**: Technical staff manages PC assembly process
4. **Packaging**: Packaging team prepares order for shipment
5. **Shipping**: Shipping team handles delivery coordination
6. **Completion**: Order marked as delivered with tracking information

### Real-time Updates
- WebSocket connections for live notifications
- Automatic UI updates on order status changes
- Cross-role notifications for workflow coordination
- Session persistence across browser refreshes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **bcrypt**: Password hashing for user authentication
- **express-session**: Session management
- **ws**: WebSocket server implementation

### UI Dependencies
- **@radix-ui/***: Headless UI components for accessibility
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **recharts**: Data visualization components

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with tsx for TypeScript execution
- **Hot Reload**: Vite dev server with HMR
- **Database**: Shared Neon PostgreSQL instance for consistency
- **Port Configuration**: Port 5000 for development server

### Production Environment
- **Build Process**: Vite production build with TypeScript compilation
- **Static Assets**: Built to `dist/public` directory
- **Server**: Express serves both API and static files
- **Database**: Production Neon PostgreSQL with connection pooling
- **Deployment**: Replit autoscale deployment target

### Environment Configuration
- **Database URL**: Configurable via environment variables
- **Session Secret**: Secure session encryption key
- **Multi-environment**: Support for local, development, and production environments

## Changelog
- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.