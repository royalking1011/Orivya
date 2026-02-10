import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth } from "./auth";
import { z } from "zod";
import { products, categories, users } from "@shared/schema";
import { db } from "./db";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const { hashPassword } = setupAuth(app);

  // === AUTH ROUTES ===
  app.post(api.auth.login.path, (req, res, next) => {
    // passport.authenticate calls the strategy, and if successful,
    // logs the user in (establishing session).
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      
      const existing = await storage.getUserByUsername(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
        role: "customer" // Default role
      });

      req.login(user, (err) => {
        if (err) throw err;
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  // === PRODUCTS ROUTES ===
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts(req.query as any);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role === 'customer') {
       return res.status(403).json({ message: "Forbidden" });
    }
    const input = api.products.create.input.parse(req.body);
    const product = await storage.createProduct(input);
    res.status(201).json(product);
  });

  app.put(api.products.update.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role === 'customer') {
       return res.status(403).json({ message: "Forbidden" });
    }
    const input = api.products.update.input.parse(req.body);
    const product = await storage.updateProduct(Number(req.params.id), input);
    res.json(product);
  });

  app.delete(api.products.delete.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role === 'customer') {
       return res.status(403).json({ message: "Forbidden" });
    }
    await storage.deleteProduct(Number(req.params.id));
    res.sendStatus(204);
  });

  // === CATEGORIES ROUTES ===
  app.get(api.categories.list.path, async (req, res) => {
    const cats = await storage.getCategories();
    res.json(cats);
  });

  app.post(api.categories.create.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role === 'customer') {
       return res.status(403).json({ message: "Forbidden" });
    }
    const input = api.categories.create.input.parse(req.body);
    const cat = await storage.createCategory(input);
    res.status(201).json(cat);
  });

  // === ORDERS ROUTES ===
  app.post(api.orders.create.path, async (req, res) => {
    // Allow guests or auth users? Schema requires userId currently.
    // For now require auth or if guest, maybe we create temp user? 
    // Let's require auth for this iteration for simplicity, or make userId optional in schema.
    // Schema has userId references users.id. 
    // If guest, we'd need to change schema to nullable. Assuming auth for now or anonymous user.
    
    // We'll proceed with req.user.id if logged in, or fail if strictly required. 
    // For MVP, require login for checkout is easiest.
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Please login to checkout" });
    
    const input = api.orders.create.input.parse(req.body);
    const order = await storage.createOrder({ ...input, userId: (req.user as any).id });
    res.status(201).json(order);
  });

  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    // Admins see all, customers see theirs
    const orders = await storage.getOrders(user.role === 'customer' ? user.id : undefined);
    res.json(orders);
  });
  
  // === ANALYTICS ROUTES ===
  app.get(api.analytics.get.path, async (req, res) => {
     if (!req.isAuthenticated() || (req.user as any).role === 'customer') {
       return res.status(403).json({ message: "Forbidden" });
    }
    const stats = await storage.getAnalytics();
    res.json(stats);
  });

  // === SEED DATA ===
  await seedDatabase(hashPassword);

  return httpServer;
}

import passport from "passport";

async function seedDatabase(hashPassword: (pwd: string) => Promise<string>) {
  // Check if admin exists
  const admin = await storage.getUserByUsername("admin@orivyaeco.com");
  if (!admin) {
    const pwd = await hashPassword("Orivya@123");
    await storage.createUser({
      email: "admin@orivyaeco.com",
      password: pwd,
      name: "Super Admin",
      role: "super_admin",
      referralCode: "ADMIN123",
      walletBalance: "0"
    });
    console.log("Seeded Super Admin");
  }

  const cats = await storage.getCategories();
  if (cats.length === 0) {
    const categoriesList = [
      { name: "Skincare", slug: "skincare", description: "Luxury skincare for all skin types" },
      { name: "Makeup", slug: "makeup", description: "Premium cosmetics" },
      { name: "Haircare", slug: "haircare", description: "Professional hair treatments" },
      { name: "Bodycare", slug: "bodycare", description: "Indulgent body products" },
      { name: "Combos", slug: "combos", description: "Value bundles and sets" }
    ];
    
    const createdCats = [];
    for (const c of categoriesList) {
      createdCats.push(await storage.createCategory(c));
    }

    // Seed Products
    const dummyProducts = [
      { name: "Radiance Serum", price: "2999", description: "Glow enhancing serum with Vitamin C", category: "skincare" },
      { name: "Velvet Lipstick", price: "1499", description: "Long lasting matte finish", category: "makeup" },
      { name: "Silk Shampoo", price: "1299", description: "For smooth and silky hair", category: "haircare" },
      { name: "Luxury Body Butter", price: "1899", description: "Deep hydration", category: "bodycare" },
      { name: "Ultimate Glow Kit", price: "4999", description: "Complete set for radiant skin", category: "combos", isCombo: true, comboDiscount: "15" }
    ];

    for (const p of dummyProducts) {
      const cat = createdCats.find(c => c.slug === p.category);
      if (cat) {
        await storage.createProduct({
          name: p.name,
          description: p.description,
          price: p.price,
          categoryId: cat.id,
          images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"], // Placeholder
          isCombo: p.isCombo || false,
          comboDiscount: p.comboDiscount,
          stock: 100
        });
      }
    }
    console.log("Seeded Products");
  }
}
