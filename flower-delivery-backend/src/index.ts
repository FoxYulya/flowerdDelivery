import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const PORT = process.env.PORT || 10000;

// Инициализация Prisma с обработкой ошибок
const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

// Проверка подключения к базе данных при старте
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

const corsOptions = {
  origin: [
    'https://foxyulya.github.io',
    'http://localhost:3000', 
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions)); 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (должен быть первым)
app.get("/", (req, res) => {
  res.json({ 
    message: "Flower delivery API is running!",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Server is alive! Database is connected!",
    timestamp: new Date().toISOString(),
    cors: "enabled for GitHub Pages",
    environment: process.env.NODE_ENV || "development"
  });
});

// Middleware для обработки ошибок Prisma
const handlePrismaError = (error: any, res: any) => {
  console.error("Prisma error:", error);
  
  if (error.code === 'P2002') {
    return res.status(400).json({ error: "Duplicate entry" });
  }
  if (error.code === 'P2025') {
    return res.status(404).json({ error: "Record not found" });
  }
  if (error.code === 'P2003') {
    return res.status(400).json({ error: "Foreign key constraint failed" });
  }
  
  return res.status(500).json({ 
    error: "Database error", 
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

app.get("/api/shops", async (req, res) => {
  try {
    const shops = await prisma.shop.findMany();
    res.json(shops);
  } catch (error) {
    console.error("Error fetching shops:", error);
    return handlePrismaError(error, res);
  }
});

app.get("/api/shops/:id/products", async (req, res) => {
  try {
    const shopId = parseInt(req.params.id);
    
    if (isNaN(shopId)) {
      return res.status(400).json({ error: "Invalid shop ID" });
    }

    const { sortBy, sortOrder = "asc" } = req.query;

    let orderBy: any = {};

    if (sortBy === "price") {
      orderBy = { price: sortOrder };
    } else if (sortBy === "date") {
      orderBy = { createdAt: sortOrder };
    } else if (sortBy === "favorite") {
      orderBy = [{ isFavorite: "desc" }, { createdAt: "desc" }];
    } else {
      orderBy = { createdAt: "desc" }; // default
    }

    const products = await prisma.product.findMany({
      where: { shopId },
      orderBy,
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return handlePrismaError(error, res);
  }
});

app.patch("/api/products/:id/favorite", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const { isFavorite } = req.body;

    if (typeof isFavorite !== 'boolean') {
      return res.status(400).json({ error: "isFavorite must be a boolean" });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { isFavorite },
    });

    res.json(product);
  } catch (error) {
    console.error("Error updating favorite:", error);
    return handlePrismaError(error, res);
  }
});

app.get("/api/shops/:id/products/paginated", async (req, res) => {
  try {
    const shopId = parseInt(req.params.id);
    
    if (isNaN(shopId)) {
      return res.status(400).json({ error: "Invalid shop ID" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 6, 100); // max 100
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: { shopId },
        skip,
        take: limit,
        orderBy: [{ isFavorite: "desc" }, { [sortBy]: sortOrder }],
      }),
      prisma.product.count({ where: { shopId } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      products,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    });
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    return handlePrismaError(error, res);
  }
});

app.get("/api/coupons", async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { isActive: true },
    });
    res.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return handlePrismaError(error, res);
  }
});

app.get("/api/coupons/validate/:code", async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code || code.trim().length === 0) {
      return res.status(400).json({ error: "Coupon code is required" });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ error: "Coupon is not active" });
    }

    res.json(coupon);
  } catch (error) {
    console.error("Error validating coupon:", error);
    return handlePrismaError(error, res);
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { email, phone, address, items, shopId, couponCode } = req.body;

    // Валидация обязательных полей
    if (!email || !phone || !address || !items || !shopId) {
      return res.status(400).json({
        error: "All fields (email, phone, address, items, shopId) are required",
      });
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Валидация items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items must be a non-empty array" });
    }

    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });
      if (!coupon || !coupon.isActive) {
        return res.status(400).json({ error: "Invalid or inactive coupon" });
      }
    }

    const order = await prisma.order.create({
      data: {
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        items,
        createdAt: new Date(),
        shopId: parseInt(shopId),
        coupon: coupon ? { connect: { id: coupon.id } } : undefined,
      },
      include: {
        coupon: true
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return handlePrismaError(error, res);
  }
});

app.get("/api/orders/search", async (req, res) => {
  try {
    const { email, phone, orderId } = req.query;

    if (!email && !phone && !orderId) {
      return res.status(400).json({ error: "At least one search parameter is required" });
    }

    const whereClause: any = {};
    
    if (email && typeof email === "string") {
      whereClause.email = { contains: email.trim().toLowerCase(), mode: "insensitive" };
    }
    if (phone && typeof phone === "string") {
      whereClause.phone = { contains: phone.trim(), mode: "insensitive" };
    }
    if (orderId) {
      const parsedOrderId = parseInt(orderId as string);
      if (!isNaN(parsedOrderId)) {
        whereClause.id = parsedOrderId;
      } else {
        return res.status(400).json({ error: "Invalid orderId format" });
      }
    }

    console.log("Searching orders with:", whereClause);

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: { coupon: true },
      orderBy: { createdAt: "desc" },
    });

    if (orders.length === 0) {
      return res.status(404).json({ error: "No orders found" });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error searching orders:", error);
    return handlePrismaError(error, res);
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { coupon: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return handlePrismaError(error, res);
  }
});

// Global error handler
app.use((error: any, req: any, res: any, next: any) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Запуск сервера
async function startServer() {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();