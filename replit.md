# Commercial Real Estate Loan Platform

## Overview

A commercial real estate loan application platform that enables users to apply for various types of commercial property loans (permanent acquisition/refinance, bridge acquisition/refinance, and construction loans). The system guides users through a multi-step application process, auto-calculates key financial metrics (LTV, DSCR, monthly interest), and manages document uploads. Users can save progress, view application status, and track their submissions through a dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Wouter for client-side routing with three main routes:
- `/` - Home/landing page
- `/apply` - Multi-step loan application form
- `/dashboard` - User's application management interface

**UI Component Library**: Shadcn UI (Radix UI primitives) with Tailwind CSS
- Custom design system based on "new-york" style variant
- Extensive use of Radix UI components for accessibility
- Tailwind configuration with custom color system using HSL color space
- Typography: Inter font family (Google Fonts)
- Design philosophy inspired by Stripe's financial clarity and Linear's modern forms

**State Management**:
- React Query (@tanstack/react-query) for server state management
- Local component state using React hooks
- Auto-save functionality with visual save indicators
- Form data persisted to backend as users progress through steps

**Form Flow**: Multi-step wizard architecture with 7 steps:
1. Quick Start (loan type selection, basic info)
2. Property Basics (property details, borrower info)
3. Loan Specifics (type-dependent fields)
4. Financial Snapshot (borrower financial capacity)
5. Property Performance (for income-producing properties)
6. Document Upload (smart document collection)
7. Review & Submit (summary and submission)

**Key Features**:
- Progressive disclosure - forms reveal conditional fields based on loan type
- Auto-calculation of financial metrics (LTV, DSCR, monthly payments)
- Drag-and-drop document upload with file preview
- Real-time form validation using React Hook Form with Zod schemas
- Responsive design with mobile/tablet adaptations

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Structure**: RESTful API design
- `/api/auth/*` - Authentication endpoints (Replit Auth integration)
- `/api/applications` - CRUD operations for loan applications
- `/api/applications/:id/documents` - Document management for applications

**Database ORM**: Drizzle ORM
- Type-safe database queries
- Schema-first approach with migrations support
- Uses `@neondatabase/serverless` driver for PostgreSQL connection
- WebSocket support for Neon serverless database

**Session Management**:
- Express-session with PostgreSQL session store (connect-pg-simple)
- 7-day session TTL
- HTTP-only, secure cookies

**File Upload Strategy**: 
- Multer for handling multipart/form-data
- In-memory storage (memoryStorage) before upload to object storage
- Replit Object Storage for persistent file storage
- Files stored with application-specific organization

**Business Logic**:
- Automatic calculation of loan metrics (LTV, DSCR, monthly interest payments)
- Standard loan amortization formula: `M = P * [r(1 + r)^n] / [(1 + r)^n - 1]`
- Data validation using Zod schemas shared between client and server

### Authentication & Authorization

**Authentication Provider**: Replit Auth (OpenID Connect)
- OAuth 2.0 / OIDC integration
- Passport.js strategy for Express integration
- Auto-discovery of OIDC configuration
- Token refresh mechanism with memoized config (1-hour cache)

**User Flow**:
- Unauthenticated users redirected to `/api/auth/login`
- Post-login redirects preserve intended destination
- Session-based authentication with user claims stored in session
- User profile data synced from OIDC provider (email, name, profile image)

**Protected Routes**: Client-side route guards check authentication status before rendering application/dashboard pages

### Data Models

**Core Entities**:

1. **Users** - Replit Auth user profiles
   - Stores: id, email, firstName, lastName, profileImageUrl
   - Auto-created/updated via OIDC claims

2. **Loan Applications** - Central application data
   - Status tracking: draft, submitted, term-sheet, underwriting, closing
   - Loan type variations with conditional fields
   - Financial data: amounts, rates, terms, property values
   - Property details: address, type, square footage, units, occupancy
   - Borrower information: entity name, contact details, experience
   - Auto-calculated metrics: LTV, DSCR, monthly interest

3. **Documents** - File attachments linked to applications
   - Document type categorization
   - File metadata: name, size, MIME type, storage path
   - Upload status tracking

4. **Sessions** - PostgreSQL session storage (required for Replit Auth)

**Database Relationships**:
- Users → LoanApplications (one-to-many)
- LoanApplications → Documents (one-to-many)
- Cascade deletes ensure data integrity

## External Dependencies

### Third-Party Services

**Replit Infrastructure**:
- Replit Auth (OpenID Connect provider for authentication)
- Replit Object Storage (document/file storage with bucket-based organization)
- Replit development tools (vite plugins for dev banner, cartographer, runtime error overlay)

**Database**: 
- PostgreSQL (via Neon serverless)
- Connection via DATABASE_URL environment variable
- WebSocket support for real-time capabilities

**Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

### Key NPM Dependencies

**Frontend**:
- React 18+ with TypeScript
- Vite (build tool and dev server)
- Wouter (lightweight routing)
- TanStack Query v5 (server state management)
- React Hook Form with Zod resolvers (form validation)
- Radix UI component primitives (30+ components)
- Tailwind CSS with class-variance-authority
- date-fns (date formatting)

**Backend**:
- Express.js with TypeScript
- Drizzle ORM with drizzle-kit
- Passport.js with openid-client strategy
- Multer (file upload handling)
- Express-session with connect-pg-simple
- Memoizee (function result caching)

**Development**:
- tsx (TypeScript execution)
- esbuild (production bundling)
- TypeScript 5+ with strict mode

### Email Notifications

**Email Provider**: SendGrid
- Sends formatted HTML email notifications when applications are submitted
- Recipient: liamnguyen.mail@gmail.com
- Email includes complete application summary: loan details, property info, borrower data, and financial metrics
- Non-blocking: email failures don't prevent application submission

### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `SESSION_SECRET` - Session encryption key
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID` - Replit Object Storage bucket
- `ISSUER_URL` - OIDC issuer (defaults to Replit)
- `REPL_ID` - Replit environment identifier
- `SENDGRID_API_KEY` - SendGrid API key for email notifications

### Asset Management

Static assets stored in `/attached_assets` directory with alias resolution via Vite config. Includes generated images for loan type icons and UI elements.