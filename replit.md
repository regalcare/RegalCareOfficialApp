# TrashPro - Waste Management System

## Overview

TrashPro is a comprehensive waste management system designed for businesses that handle regular waste collection and bin cleaning services. The application provides a web-based interface for managing customers, weekly routes, messaging, and bin cleaning appointments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and build processes

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL store

### Data Storage
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Location**: Shared between client and server (`/shared/schema.ts`)
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Database Schema
The application manages four main entities:
1. **Customers** - Client information with contact details and route assignments
2. **Routes** - Weekly collection routes with scheduling and progress tracking
3. **Messages** - Communication system between customers and the business
4. **Bin Cleaning Appointments** - Scheduled cleaning services with pricing and status

### API Endpoints
- **Customer Management**: Full CRUD operations for customer records
- **Route Management**: Route creation, assignment, and progress tracking
- **Message System**: Message creation, status updates, and conversation management
- **Bin Cleaning**: Appointment scheduling and status management

### User Interface
- **Dashboard**: Overview of daily operations and key metrics
- **Customer Management**: List, create, edit, and delete customer records
- **Route Planning**: Weekly calendar view with route assignments
- **Messaging**: Real-time message interface with read/unread status
- **Bin Cleaning**: Calendar-based appointment scheduling system

## Data Flow

1. **Client Requests**: React components use TanStack Query to fetch data
2. **API Layer**: Express routes handle HTTP requests and validation
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Response Handling**: JSON responses with proper error handling
5. **State Updates**: TanStack Query manages cache invalidation and updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connection for Neon PostgreSQL
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling with validation
- **zod**: Schema validation for forms and API endpoints
- **date-fns**: Date manipulation and formatting

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Utility for component variants

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite development server with HMR
- **Database**: Neon PostgreSQL with connection pooling

### Production Build
- **Client**: Vite builds static assets to `/dist/public`
- **Server**: esbuild bundles server code to `/dist/index.js`
- **Database**: Drizzle migrations ensure schema consistency

### Environment Configuration
- **DATABASE_URL**: Required environment variable for PostgreSQL connection
- **NODE_ENV**: Environment detection for development/production behavior
- **REPL_ID**: Replit-specific configuration for development tools

### Key Features
- **Session Management**: PostgreSQL-backed sessions for user state
- **Real-time Updates**: TanStack Query provides optimistic updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Type Safety**: End-to-end TypeScript for reliability

The application follows a monorepo structure with shared types and schemas, enabling full-stack type safety and efficient development workflows.