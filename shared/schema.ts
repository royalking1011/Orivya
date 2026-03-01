import { pgTable, text, serial, integer, boolean, timestamp,numeric, jsonb, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", [
  "super_admin",
  "admin",
  "order_manager",
  "product_manager",
  "support_executive",
  "refund_manager",
  "marketing_manager",
  "accountant",
  "warehouse_manager",
  "customer"
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned"
]);

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const paymentMethodEnum = pgEnum("payment_method", ["razorpay", "stripe", "paypal", "cod"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").default("customer").notNull(),
  referralCode: text("referral_code").unique(),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image"),
  description: text("description"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").unique(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  images: text("images").array().notNull(), // PostgreSQL array of strings
  attributes: jsonb("attributes").$type<{
    brand?: string;
    skinType?: string;
    ingredients?: string[];
    [key: string]: any;
  }>(),
  isCombo: boolean("is_combo").default(false),
  comboDiscount: decimal("combo_discount", { precision: 5, scale: 2 }), // Percentage or fixed amount
  stock: integer("stock").default(0).notNull(), // Global stock for simple view
  createdAt: timestamp("created_at").defaultNow(),
});

export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  managerId: integer("manager_id").references(() => users.id),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(0).notNull(),
});

// =========================
// ORDERS
// =========================
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  totalAmount: numeric("total_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),

  status: text("status").notNull().default("pending"),

  paymentMethod: text("payment_method").notNull().default("cod"),
  paymentStatus: text("payment_status").notNull().default("pending"),

  trackingNumber: text("tracking_number"),

  // IMPORTANT: JSON shipping address
  shippingAddress: jsonb("shipping_address").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// =========================
// ORDER ITEMS
// =========================
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),

  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),

  quantity: integer("quantity").notNull().default(1),

  price: numeric("price", { precision: 12, scale: 2 })
    .notNull()
    .default("0.00"),
});


export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g., 'theme', 'homepage_banner'
  value: jsonb("value").notNull(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id).notNull(),
  referredUserId: integer("referred_user_id").references(() => users.id),
  status: text("status").default("pending"), // pending, completed
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  inventory: many(inventory),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  warehouse: one(warehouses, {
    fields: [inventory.warehouseId],
    references: [warehouses.id],
  }),
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, trackingNumber: true, warehouseId: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, isApproved: true });
export const insertWarehouseSchema = createInsertSchema(warehouses).omit({ id: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Warehouse = typeof warehouses.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type Setting = typeof settings.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
