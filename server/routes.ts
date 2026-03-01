import type { Express } from "express";
import passport from "passport";
import { storage } from "./storage";

// -------------------------
// ROLE MIDDLEWARE
// -------------------------
function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const role = req.user?.role;
  if (role === "admin" || role === "super_admin" || role === "staff") {
    return next();
  }

  return res.status(403).json({ message: "Admin access required" });
}

// -------------------------
// ROUTES EXPORT (IMPORTANT)
// -------------------------
export async function registerRoutes(httpServer: Server,
  app: Express) {
  // =========================
  // AUTH
  // =========================
  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json(req.user);
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid email or password" });

      req.logIn(user, (err2: any) => {
        if (err2) return next(err2);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ ok: true });
    });
  });

  // =========================
  // PRODUCTS (PUBLIC)
  // =========================
  app.get("/api/products", async (req, res) => {
    const list = await storage.getProducts();
    res.json(list);
  });

  app.get("/api/products/:id", async (req, res) => {
    const id = Number(req.params.id);
    const product = await storage.getProduct(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // =========================
  // ORDERS (CUSTOMER)
  // =========================
  app.post("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Please login to checkout" });
      }

      const { paymentMethod, shippingAddress, items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart items required" });
      }

      if (!shippingAddress?.fullName || !shippingAddress?.phone) {
        return res.status(400).json({ message: "Shipping address required" });
      }

      const order = await storage.createOrder({
        userId: (req.user as any).id,
        paymentMethod: paymentMethod || "cod",
        shippingAddress,
        items,
      } as any);

      return res.status(201).json(order);
    } catch (err: any) {
      console.error("Create order error:", err);
      return res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/my", async (req, res) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const list = await storage.getOrders((req.user as any).id);
      return res.json(list);
    } catch (err) {
      console.error("My orders error:", err);
      return res.status(500).json({ message: "Failed to load orders" });
    }
  });

  // =========================
  // ADMIN ORDERS
  // =========================
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const list = await storage.getOrders();
      return res.json(list);
    } catch (err) {
      console.error("Admin orders error:", err);
      return res.status(500).json({ message: "Failed to load orders" });
    }
  });

  app.get("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);

      const detail = await storage.getOrderDetails(id);
      if (!detail) return res.status(404).json({ message: "Order not found" });

      return res.json(detail);
    } catch (err) {
      console.error("Admin order detail error:", err);
      return res.status(500).json({ message: "Failed to load order detail" });
    }
  });

  app.patch("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);

      const allowedStatus = [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
      ];

      const allowedPayments = ["pending", "paid", "failed", "refunded"];

      const { status, paymentStatus, trackingNumber } = req.body;

      const updates: any = {};

      if (status) {
        if (!allowedStatus.includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
        }
        updates.status = status;
      }

      if (paymentStatus) {
        if (!allowedPayments.includes(paymentStatus)) {
          return res.status(400).json({ message: "Invalid payment status" });
        }
        updates.paymentStatus = paymentStatus;
      }

      if (trackingNumber !== undefined) {
        updates.trackingNumber = trackingNumber;
      }

      const updated = await storage.updateOrder(id, updates);
      return res.json(updated);
    } catch (err) {
      console.error("Admin update order error:", err);
      return res.status(500).json({ message: "Failed to update order" });
    }
  });

  // =========================
  // HEALTH CHECK
  // =========================
  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });
}
