# Orivya Eco - Luxury Cosmetics Ecommerce

A full-stack luxury ecommerce platform built with React, Express, PostgreSQL, and Drizzle ORM.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Shadcn UI
- **Backend**: Express.js, Passport.js (Auth), Drizzle ORM
- **Database**: PostgreSQL
- **State Management**: React Query, Zustand

## Features
- **Luxury UI**: Glassmorphism, premium typography, smooth animations.
- **Authentication**: Role-based access control (Super Admin, Customers, Staff).
- **Ecommerce**: Products, Categories, Combos, Cart, Checkout (Mock Payments).
- **Admin Panel**: Dashboard, Product Management, Orders, Customers.
- **Warehousing**: Multi-warehouse inventory structure.

## Setup Instructions

### 1. Replit (Recommended)
This project is optimized for Replit.
1. Fork the Repl.
2. The database is automatically provisioned.
3. Secrets are managed via the Replit Secrets tool.
4. Run `npm run dev` to start.

### 2. Local Development
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up a PostgreSQL database.
4. Create a `.env` file based on `.env.example`.
5. Push schema: `npm run db:push`.
6. Start the app: `npm run dev`.

### 3. Vercel Deployment
*Note: This is a full-stack app with a custom Express backend. Vercel is best for serverless/Next.js. For this stack, Replit Deploy or a VPS (Railway/Render) is recommended.*
If using Vercel, you would need to adapt the backend to Serverless Functions.

## Scripts
- `npm run dev`: Start development server.
- `npm run build`: Build frontend.
- `npm run start`: Start production server.
- `npm run db:push`: Push database schema changes.

## Default Credentials
**Super Admin**:
- Email: `admin@orivyaeco.com`
- Password: `Orivya@123`
