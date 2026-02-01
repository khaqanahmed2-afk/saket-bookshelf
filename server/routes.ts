import type { Express } from "express";
import type { Server } from "http";
import multer from "multer";
import path from "path";
import { api } from "@shared/routes";
import { requireAuth, requireAdmin } from "./middleware/auth";
import * as authController from "./controllers/auth";
import * as dashboardController from "./controllers/dashboard";
import * as adminController from "./controllers/admin";
import { supabase } from "./services/supabase";

import fs from "fs";

// Create uploads directory if it doesn't exist
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer configuration for admin uploads (Disk Storage for production)
const MAX_UPLOAD_MB = Number(process.env.ADMIN_UPLOAD_MAX_MB || "2048");
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_UPLOAD_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [".xml", ".xls", ".xlsx"];
    if (!allowed.includes(ext)) {
      return cb(new Error("Only .xml, .xls, .xlsx files are allowed."));
    }
    cb(null, true);
  },
});


export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Public Health Check
  app.get("/health", async (_req, res) => {
    try {
      const { error } = await supabase.from("customers").select("id").limit(1);
      res.json({ status: "ok", supabase: { connected: !error } });
    } catch {
      res.status(500).json({ status: "error" });
    }
  });

  // Auth Routes
  app.post(api.auth.checkMobile.path, authController.checkMobile);
  app.post(api.auth.setupPin.path, authController.setupPin);
  app.post(api.auth.loginPin.path, authController.loginPin);
  app.post(api.auth.changePin.path, requireAuth, authController.changePin);
  app.get(api.auth.me.path, authController.me);
  app.post(api.auth.logout.path, authController.logout);

  // User Dashboard
  app.get("/api/dashboard", requireAuth, dashboardController.getDashboardData);

  // Admin Routes
  app.post(api.admin.uploadTally.path, requireAdmin, upload.single("file"), adminController.uploadTally);

  // Vyapar / Generic Import Routes
  // Note: Adjust multer config if needed, or reuse 'upload' middleware which allows xml, xls, xlsx
  const vyaparController = await import("./controllers/vyapar-import");

  app.post("/api/import/upload", requireAdmin, upload.single("file"), vyaparController.uploadVyapar);
  app.get("/api/import/status/:id", requireAdmin, vyaparController.getImportStatus);
  app.post("/api/import/sync/:id", requireAdmin, vyaparController.syncImport);
  app.get("/api/import/history", requireAdmin, vyaparController.getRecentImports);

  // XML Upload Routes (Strict Order: Customers → Bills → Payments)
  const xmlUploadRouter = await import("./routes/xml-upload");
  app.use("/api/admin/upload", xmlUploadRouter.default);

  // Temporary Schema Fix Endpoint (can be removed after running once)
  const schemaController = await import("./controllers/fix-schema");
  app.post("/api/admin/fix-products-schema", requireAdmin, schemaController.fixProductsSchema);

  // Product Management Routes
  const productsController = await import("./controllers/products");
  app.get("/api/products", productsController.getProducts); // Public - for shop page
  app.post("/api/products", requireAdmin, productsController.createProduct); // Admin only
  app.delete("/api/products/:id", requireAdmin, productsController.deleteProduct); // Admin only
  app.post("/api/products/upload-image", requireAdmin, productsController.upload.single("image"), productsController.uploadImage); // Admin only

  return httpServer;
}
