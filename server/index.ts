// 🔥 MUST be first – before anything else (restarted)
import "dotenv/config";
// Global override for self-signed certificates in managed Postgres
if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL?.includes("localhost")) {
  process.env.PGSSLMODE = "no-verify";
}

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

// CORS configuration - supports local + production via environment variable
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://saket-pustak-kendra-database.web.app",
        "https://saket-pustak-kendra-database.firebaseapp.com",
        "https://saketpustakkendra.in",
        "https://www.saketpustakkendra.in",
      ],
    credentials: true,
  })
);


// Essential for production behind proxies (like Vercel, Heroku, or Nginx)
app.set("trust proxy", 1);

// -------------------- SESSION SETUP --------------------

import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const PgSessionStore = connectPgSimple(session);

const store = new PgSessionStore({
  pool: pool,
  tableName: "session",
  createTableIfMissing: true,
});

// Session secret validation
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error(
    "SESSION_SECRET environment variable is required and must be at least 32 characters long."
  );
}


// Session configuration with environment-aware cookie settings
const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store,
    name: "saket.sid",
    cookie: {
      secure: isProduction, // false for localhost (HTTP), true for production (HTTPS)
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: isProduction ? "none" : "lax", // "lax" for localhost, "none" for cross-domain
    },
  }),
);


// -------------------- TYPES --------------------

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    user?: {
      mobile: string;
      id: string;
      role?: string;
      mobileVerified?: boolean;
    };
  }
}

// -------------------- MIDDLEWARE --------------------

app.use(
  express.json({
    limit: "50mb",
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// -------------------- LOGGER --------------------

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      log(logLine);
    }
  });

  next();
});

// -------------------- START SERVER --------------------

(async () => {
  await registerRoutes(httpServer, app);

  // Error handler (DO NOT throw here)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    let status = err.status || err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle Multer file size error specifically
    if (err.code === "LIMIT_FILE_SIZE") {
      status = 413;
      message = "File too large. Please upload a file smaller than 2GB.";
    }

    log(`Error ${status}: ${message}`, "error");

    if (status === 500) {
      console.error(err);
    }

    res.status(status).json({ message });
  });

  // Frontend serving
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Serve uploaded product images
  const uploadsPath = path.join(process.cwd(), "server", "uploads");
  app.use("/uploads", express.static(uploadsPath));

  // Fallback for React Router (must be after API routes)

  // Start listening
  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      log(`Port ${port} is already in use. Please try a different port or stop the conflicting process.`, 'error');
      log(`You can change the port by setting the PORT environment variable.`, 'info');
      process.exit(1);
    } else {
      log(`Server error: ${err.message}`, 'error');
      console.error(err);
      process.exit(1);
    }
  });

  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    }
  );

  // Increase timeouts for large file imports (Tally XMLs)
  httpServer.timeout = 600000; // 10 minutes
  httpServer.keepAliveTimeout = 610000;
  httpServer.headersTimeout = 620000;
})();

