# Saket Pustak Kendra

## Overview

A modern, premium business website for a stationery and books store based in Rudauli, Ayodhya. The application features a public marketing website with a soft, playful Kidsa-inspired design theme, customer authentication via mobile PIN, a customer dashboard for viewing ledger/bills/payments, and an admin panel for importing Tally accounting data.

The project follows a full-stack TypeScript architecture with React frontend, Express backend, PostgreSQL database via Drizzle ORM, and Supabase for authentication and real-time data access with Row Level Security.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom Kidsa-inspired theme (peach, soft orange, sky blue, cream palette - no green)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod validation
- **File Processing**: Multer for handling Tally XML/Excel uploads, xlsx library for parsing

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: shared/schema.ts (shared between frontend and backend)
- **Tables**: customers, ledger, bills, payments
- **Migrations**: drizzle-kit with migrations output to ./migrations

### Authentication Flow
- Mobile number-based authentication with 4-digit PIN
- Backend validates credentials against customers table using bcryptjs
- Session stored in localStorage on frontend
- Supabase client used for RLS-protected data queries from frontend

### Key Design Patterns
- Shared schema and route definitions between client/server
- API routes use Zod schemas for input validation and response types
- Custom hooks for authentication (use-auth), dashboard data (use-dashboard), and admin operations (use-admin)
- Component-based UI with reusable stat cards, wave separators, and layout wrapper

## External Dependencies

### Database
- **PostgreSQL**: Primary database (requires DATABASE_URL environment variable)
- **Drizzle ORM**: Database queries and schema management

### Supabase Integration
- **Authentication**: Mobile/PIN-based customer auth
- **Client SDK**: @supabase/supabase-js for frontend data fetching
- **Environment Variables**: 
  - VITE_SUPABASE_URL (frontend)
  - VITE_SUPABASE_ANON_KEY (frontend)
  - SUPABASE_URL (backend)
  - SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY (backend)

### PDF Generation
- **jsPDF**: Client-side PDF generation for bills
- **jspdf-autotable**: Table formatting in PDFs

### Data Processing
- **xlsx**: Parsing Tally export files (XML/Excel) on the backend

### UI Framework Dependencies
- Full shadcn/ui component set with Radix UI primitives
- Framer Motion for animations
- Lucide React for icons
- date-fns for date formatting