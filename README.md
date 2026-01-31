# Saket Bookshelf - Ledger & Dashboard

A professional, production-ready full-stack web application designed for **Saket Pustak Kendra** to manage customer ledgers, bill history, and payment tracking. Built with modern technologies, including React, Express, and Supabase.

## 🚀 Key Features

*   **Secure Authentication**: Mobile-based login with hashed PIN protection.
*   **Customer Dashboard**: Real-time overview of purchases, payments, and current balance.
*   **Interactive Analytics**: Visual charts showing monthly trends for better financial insights.
*   **Admin Tally Import**: Robust XML and Excel parser with duplicate detection and validation.
*   **Production-Grade Security**: Row Level Security (RLS) and hardened session management.
*   **Mobile-First Design**: Fully responsive UI tailored for both desktop and handheld devices.

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), TailwindCSS, TanStack Query, Framer Motion, Recharts.
*   **Backend**: Node.js (Express), Zod (Validation), Express-Session.
*   **Database**: Supabase (PostgreSQL) with RLS.
*   **Deployment**: Vercel/Heroku/Self-hosted ready.

## ⚙️ Environment Variables

Create a root `.env` file with the following:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key

# Session Security
SESSION_SECRET=a_long_random_string_for_signing_sessions

# Admin Settings
ADMIN_UPLOAD_MAX_MB=10

# Database URL (for session store)
DATABASE_URL=postgres://...
```

## 📦 Local Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/khaqanahmed2-afk/saket-bookshelf.git
    cd saket-bookshelf
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Database**:
    Apply the SQL scripts located in the `migrations/` folder to your Supabase project using the SQL Editor.

4.  **Run in development**:
    ```bash
    npm run dev
    ```

## 🚀 Deployment Guide

### Prerequisites
- A Supabase project.
- A Vercel account (recommended).

### Steps
1.  **Supabase**:
    - Run the SQL in `migrations/01_enable_rls.sql` to secure your tables.
    - Run `migrations/02_optimize_indexes.sql` for performance.
2.  **Vercel**:
    - Connect your GitHub repo.
    - Add all variables from the "Environment Variables" section.
    - Set the build command to `npm run build` and output directory to `dist/public`.

## 📜 Project Structure

*   `client/src/services/api.ts`: Centralized API communication layer.
*   `server/controllers/`: Modular request/response handlers.
*   `server/services/`: Business logic (Auth, Tally parsing).
*   `migrations/`: SQL database schemas and policies.
*   `shared/`: Shared Zod schemas and API types.

## 🤝 Support
For support, contact the system administrator or the development team.

