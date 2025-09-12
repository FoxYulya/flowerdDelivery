import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/shops", async (req, res) => {
  try {
    const shops = await prisma.shop.findMany();
    res.json(shops);
  } catch (error) {
    console.error("Error fetching shops:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/shops/:id/products", async (req, res) => {
  try {
    const shopId = parseInt(req.params.id);
    const { sortBy, sortOrder = "asc" } = req.query;

    let orderBy: any = {};

    if (sortBy === "price") {
      orderBy = { price: sortOrder };
    } else if (sortBy === "date") {
      orderBy = { createdAt: sortOrder };
    } else if (sortBy === "favorite") {
      orderBy = [{ isFavorite: "desc" }, { createdAt: "desc" }];
    }

    const products = await prisma.product.findMany({
      where: { shopId },
      orderBy,
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/api/products/:id/favorite", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { isFavorite } = req.body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: { isFavorite },
    });

    res.json(product);
  } catch (error) {
    console.error("Error updating favorite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/shops/:id/products/paginated", async (req, res) => {
  try {
    const shopId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
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
    });
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/coupons", async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { isActive: true },
    });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/coupons/validate/:code", async (req, res) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: req.params.code },
    });

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { email, phone, address, items, shopId, couponCode } = req.body;

    if (!email || !phone || !address || !items || !shopId) {
      return res
        .status(400)
        .json({
          error:
            "All fields (email, phone, address, items, shopId) are required",
        });
    }

    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });
      if (!coupon || !coupon.isActive) {
        return res.status(400).json({ error: "Invalid or inactive coupon" });
      }
    }

    const order = await prisma.order.create({
      data: {
        email,
        phone,
        address,
        items,
        createdAt: new Date(),
        shopId,
        coupon: coupon ? { connect: { id: coupon.id } } : undefined,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/orders/search", async (req, res) => {
  try {
    const { email, phone, orderId } = req.query;

    const whereClause: any = {};
    if (email && typeof email === "string") {
      whereClause.email = { contains: email, mode: "insensitive" };
    }
    if (phone && typeof phone === "string") {
      whereClause.phone = { contains: phone, mode: "insensitive" };
    }
    if (orderId) {
      const parsedOrderId = parseInt(orderId as string);
      if (!isNaN(parsedOrderId)) {
        whereClause.id = parsedOrderId;
      } else {
        return res.status(400).json({ error: "Invalid orderId format" });
      }
    }

    console.log("Where clause:", whereClause);

    const orders = await prisma.order.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: { coupon: true },
      orderBy: { createdAt: "desc" },
    });

    if (orders.length === 0) {
      return res.status(404).json({ error: "No orders found" });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error searching orders:", error);
    if (error instanceof Error) {
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Internal server error", details: "Unknown error" });
    }
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
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
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Server is alive! Database is connected!" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
