import { z } from 'zod';
import { 
  insertUserSchema, insertProductSchema, insertCategorySchema, 
  insertOrderSchema, insertReviewSchema, insertWarehouseSchema,
  insertInventorySchema, insertSettingsSchema,
  users, products, categories, orders, reviews, warehouses, inventory, settings
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  // Auth
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: { 200: z.void() },
    },
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },

  // Products
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        isCombo: z.boolean().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products' as const,
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id' as const,
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id' as const,
      responses: { 204: z.void() },
    },
  },

  // Categories
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: { 200: z.array(z.custom<typeof categories.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/categories' as const,
      input: insertCategorySchema,
      responses: { 201: z.custom<typeof categories.$inferSelect>() },
    },
  },

  // Orders
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: z.object({
        ...insertOrderSchema.shape,
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
        })),
      }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      responses: { 200: z.array(z.custom<typeof orders.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id' as const,
      responses: { 200: z.custom<typeof orders.$inferSelect>() },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/orders/:id/status' as const,
      input: z.object({ status: z.string(), trackingNumber: z.string().optional() }),
      responses: { 200: z.custom<typeof orders.$inferSelect>() },
    },
  },
  
  // Analytics
  analytics: {
    get: {
      method: 'GET' as const,
      path: '/api/analytics' as const,
      responses: { 
        200: z.object({
          totalSales: z.number(),
          totalOrders: z.number(),
          totalCustomers: z.number(),
          recentOrders: z.array(z.any()),
        }) 
      },
    },
  },

  // Settings (Theme, etc)
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: { 200: z.array(z.custom<typeof settings.$inferSelect>()) },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings' as const,
      input: insertSettingsSchema,
      responses: { 200: z.custom<typeof settings.$inferSelect>() },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
