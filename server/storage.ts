import { db } from "./db";
import {
  users,
  products,
  categories,
  orders,
  orderItems,
  settings,
  type User,
  type InsertUser,
  type Product,
  type Category,
  type Order,
  type Setting,
} from "@shared/schema";

import { eq, like, or, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Staff
  getStaffUsers(): Promise<User[]>;
  updateUserRole(id: number, role: string): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Customers
  getCustomers(): Promise<User[]>;

  // Products
  getProducts(params?: {
    category?: string;
    search?: string;
    isCombo?: boolean;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: Partial<Product>): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: Partial<Category>): Promise<Category>;

  // Orders
  createOrder(
    order: Partial<Order> & { items: { productId: number; quantity: number }[] },
  ): Promise<Order>;

  getOrders(userId?: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;

  getOrderDetails(id: number): Promise<{
    order: Order;
    items: {
      id: number;
      productId: number;
      quantity: number;
      price: string;
      productName: string;
    }[];
  } | null>;

  updateOrder(
    id: number,
    updates: Partial<Order>,
  ): Promise<Order>;

  // Analytics
  getAnalytics(): Promise<any>;

  // Settings
  getSettings(): Promise<Setting[]>;
  updateSetting(key: string, value: any): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  // =========================
  // USERS
  // =========================
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // =========================
  // STAFF
  // =========================
  async getStaffUsers(): Promise<User[]> {
    return await db.query.users.findMany({
      where: (u, { ne }) => ne(u.role, "customer"),
      orderBy: (u, { desc }) => [desc(u.createdAt)],
      columns: { password: false },
    });
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // =========================
  // CUSTOMERS
  // =========================
  async getCustomers(): Promise<User[]> {
    return await db.query.users.findMany({
      where: (u, { eq }) => eq(u.role, "customer"),
      orderBy: (u, { desc }) => [desc(u.createdAt)],
      columns: { password: false },
    });
  }

  // =========================
  // PRODUCTS
  // =========================
  async getProducts(params?: {
    category?: string;
    search?: string;
    isCombo?: boolean;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    const conditions: any[] = [];

    if (params?.category) {
      const [cat] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, params.category));

      if (cat) conditions.push(eq(products.categoryId, cat.id));
    }

    if (params?.search) {
      conditions.push(
        or(
          like(products.name, `%${params.search}%`),
          like(products.description, `%${params.search}%`),
        ),
      );
    }

    if (params?.isCombo !== undefined) {
      conditions.push(eq(products.isCombo, params.isCombo));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    // Auto SKU if not provided
    if (!(product as any).sku) {
      const base = (product.name || "ORIVYA")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 18);

      (product as any).sku = `ORV-${base}-${Date.now().toString().slice(-5)}`;
    }

    const [newProduct] = await db
      .insert(products)
      .values(product as any)
      .returning();

    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();

    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // =========================
  // CATEGORIES
  // =========================
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category as any)
      .returning();

    return newCategory;
  }

  // =========================
  // ORDERS (REAL DB)
  // =========================
  async createOrder(
    orderData: Partial<Order> & { items: { productId: number; quantity: number }[] },
  ): Promise<Order> {
    const { items, ...orderInfo } = orderData;

    let total = 0;
    const itemDetails: { productId: number; quantity: number; price: number }[] = [];

    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        const price = Number(product.price);
        total += price * item.quantity;
        itemDetails.push({ ...item, price });
      }
    }

    const [newOrder] = await db
      .insert(orders)
      .values({
        ...orderInfo,
        totalAmount: total.toFixed(2),
        status: "pending",
        paymentStatus: "pending",
      } as any)
      .returning();

    for (const item of itemDetails) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toFixed(2),
      });
    }

    return newOrder;
  }

  async getOrders(userId?: number): Promise<Order[]> {
    if (userId) {
      return await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
    }

    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderDetails(id: number) {
    const order = await this.getOrder(id);
    if (!order) return null;

    const items = await db.execute(sql`
      SELECT 
        oi.id,
        oi.product_id as "productId",
        oi.quantity,
        oi.price,
        p.name as "productName"
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ${id}
    `);

    return {
      order,
      items: items.rows as any,
    };
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set(updates as any)
      .where(eq(orders.id, id))
      .returning();

    return updated;
  }

  // =========================
  // ANALYTICS
  // =========================
  async getAnalytics(): Promise<any> {
    const [sales] = await db
      .select({ value: sql`coalesce(sum(${orders.totalAmount}), 0)` })
      .from(orders);

    const [count] = await db
      .select({ value: sql`count(*)` })
      .from(orders);

    const [customers] = await db
      .select({ value: sql`count(*)` })
      .from(users)
      .where(eq(users.role, "customer"));

    const monthly = await db.execute(sql`
      SELECT 
        to_char(date_trunc('month', created_at), 'Mon') as name,
        coalesce(sum(total_amount), 0)::float as total
      FROM orders
      WHERE created_at >= now() - interval '12 months'
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at) ASC
    `);

    const weekly = await db.execute(sql`
      SELECT 
        to_char(created_at, 'Dy') as name,
        count(*)::int as orders
      FROM orders
      WHERE created_at >= now() - interval '7 days'
      GROUP BY to_char(created_at, 'Dy'), date_trunc('day', created_at)
      ORDER BY date_trunc('day', created_at) ASC
    `);

    return {
      totalSales: Number(sales?.value || 0),
      totalOrders: Number(count?.value || 0),
      totalCustomers: Number(customers?.value || 0),
      monthlySales: monthly.rows,
      weeklyOrders: weekly.rows,
    };
  }

  // =========================
  // SETTINGS
  // =========================
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async updateSetting(key: string, value: any): Promise<Setting> {
    const [existing] = await db.select().from(settings).where(eq(settings.key, key));

    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ value })
        .where(eq(settings.key, key))
        .returning();

      return updated;
    } else {
      const [created] = await db.insert(settings).values({ key, value }).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
