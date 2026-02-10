import { db } from "./db";
import { 
  users, products, categories, orders, orderItems, reviews, warehouses, inventory, settings,
  type User, type InsertUser, type Product, type Category, type Order, type OrderItem, 
  type Warehouse, type Inventory, type Setting, type Review
} from "@shared/schema";
import { eq, like, or, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(params?: { category?: string; search?: string; isCombo?: boolean }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: Partial<Product>): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: Partial<Category>): Promise<Category>;

  // Orders
  createOrder(order: Partial<Order> & { items: { productId: number; quantity: number }[] }): Promise<Order>;
  getOrders(userId?: number): Promise<Order[]>; // If userId is null, return all (for admin)
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string, trackingNumber?: string): Promise<Order>;

  // Analytics
  getAnalytics(): Promise<any>;

  // Settings
  getSettings(): Promise<Setting[]>;
  updateSetting(key: string, value: any): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(params?: { category?: string; search?: string; isCombo?: boolean }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    if (params?.category) {
      // Find category ID first (simplified, usually a join)
      const [cat] = await db.select().from(categories).where(eq(categories.slug, params.category));
      if (cat) conditions.push(eq(products.categoryId, cat.id));
    }
    if (params?.search) {
      conditions.push(or(
        like(products.name, `%${params.search}%`),
        like(products.description, `%${params.search}%`)
      ));
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
    const [newProduct] = await db.insert(products).values(product as any).returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const [updated] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category as any).returning();
    return newCategory;
  }

  async createOrder(orderData: Partial<Order> & { items: { productId: number; quantity: number }[] }): Promise<Order> {
    // Transaction ideally
    const { items, ...orderInfo } = orderData;
    
    // Calculate total (simple version, assuming frontend passed valid prices or we fetch them)
    // Here we should fetch real prices.
    let total = 0;
    const itemDetails = [];
    
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        const price = Number(product.price);
        total += price * item.quantity;
        itemDetails.push({ ...item, price });
      }
    }

    const [newOrder] = await db.insert(orders).values({
      ...orderInfo,
      totalAmount: total.toFixed(2),
      status: 'pending',
      paymentStatus: 'pending'
    } as any).returning();

    for (const item of itemDetails) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toFixed(2)
      });
    }

    return newOrder;
  }

  async getOrders(userId?: number): Promise<Order[]> {
    if (userId) {
      return await db.select().from(orders).where(eq(orders.userId, userId));
    }
    return await db.select().from(orders);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async updateOrderStatus(id: number, status: string, trackingNumber?: string): Promise<Order> {
    const updates: any = { status };
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    
    const [updated] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return updated;
  }

  async getAnalytics(): Promise<any> {
    const [sales] = await db.select({ value: sql`sum(${orders.totalAmount})` }).from(orders);
    const [count] = await db.select({ value: sql`count(*)` }).from(orders);
    const [customers] = await db.select({ value: sql`count(*)` }).from(users).where(eq(users.role, 'customer'));
    
    return {
      totalSales: Number(sales?.value || 0),
      totalOrders: Number(count?.value || 0),
      totalCustomers: Number(customers?.value || 0),
      recentOrders: [] 
    };
  }

  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async updateSetting(key: string, value: any): Promise<Setting> {
    // Upsert
    const [existing] = await db.select().from(settings).where(eq(settings.key, key));
    if (existing) {
      const [updated] = await db.update(settings).set({ value }).where(eq(settings.key, key)).returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values({ key, value }).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
