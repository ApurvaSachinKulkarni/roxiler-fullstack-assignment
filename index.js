import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 

  if (!token) {
    return res.status(401).json({ error: "Access denied, token missing!" });
  }

  try {
    const decoded = jwt.verify(token, "secretkey"); 
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token!" });
  }
};

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password || !address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role: role || "USER",
      },
    });

    res.json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);

    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied: insufficient permissions" });
    }
    next();
  };
};

app.get("/admin/dashboard", authenticate, authorize(["ADMIN"]), (req, res) => {
  res.json({ message: "Welcome Admin 🚀", user: req.user });
});

app.get("/user/stores", authenticate, authorize(["USER"]), (req, res) => {
  res.json({ message: "Welcome User 🙋", user: req.user });
});

app.get("/owner/dashboard", authenticate, authorize(["OWNER"]), (req, res) => {
  res.json({ message: "Welcome Store Owner 🏪", user: req.user });
});

app.post("/stores", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || !email || !address || !ownerId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== "OWNER") {
      return res.status(400).json({ error: "Owner must be a valid STORE OWNER" });
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId
      }
    });

    res.json({ message: "Store created successfully", store });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create store" });
  }
});

app.get("/stores", authenticate, async (req, res) => {
  try {
    const { name, address } = req.query;

    const stores = await prisma.store.findMany({
      where: {
        AND: [
          name ? { name: { contains: name, mode: "insensitive" } } : {},
          address ? { address: { contains: address, mode: "insensitive" } } : {}
        ]
      },
      include: {
        ratings: true
      }
    });

    const formattedStores = stores.map(store => {
      const avgRating =
        store.ratings.length > 0
          ? store.ratings.reduce((a, b) => a + b.rating, 0) / store.ratings.length
          : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        avgRating: avgRating.toFixed(1)
      };
    });

    res.json(formattedStores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

app.post("/stores/:id/rating", authenticate, authorize(["USER"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const store = await prisma.store.findUnique({ where: { id: parseInt(id) } });
    if (!store) return res.status(404).json({ error: "Store not found" });

    const existingRating = await prisma.rating.findFirst({
      where: { userId: req.user.userId, storeId: parseInt(id) }
    });

    if (existingRating) {
      return res.status(400).json({ error: "You already rated this store. Use update instead." });
    }

    const newRating = await prisma.rating.create({
      data: {
        rating,
        userId: req.user.userId,
        storeId: parseInt(id)
      }
    });

    res.json({ message: "Rating submitted successfully", newRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

app.put("/stores/:id/rating", authenticate, authorize(["USER"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const existingRating = await prisma.rating.findFirst({
      where: { userId: req.user.userId, storeId: parseInt(id) }
    });

    if (!existingRating) {
      return res.status(404).json({ error: "You have not rated this store yet" });
    }

    const updatedRating = await prisma.rating.update({
      where: { id: existingRating.id },
      data: { rating }
    });

    res.json({ message: "Rating updated successfully", updatedRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update rating" });
  }
});

app.get("/owner/stores/:id/ratings", authenticate, authorize(["OWNER"]), async (req, res) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id: parseInt(id) },
      include: { ratings: { include: { user: true } } }
    });

    if (!store || store.ownerId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized to view this store's ratings" });
    }

    const avgRating =
      store.ratings.length > 0
        ? store.ratings.reduce((a, b) => a + b.rating, 0) / store.ratings.length
        : 0;

    res.json({
      store: store.name,
      avgRating: avgRating.toFixed(1),
      ratings: store.ratings.map(r => ({
        user: r.user.name,
        email: r.user.email,
        rating: r.rating
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

app.get("/admin/dashboard", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

app.get("/admin/users", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    const { name, email, address, role } = req.query;

    const users = await prisma.user.findMany({
      where: {
        AND: [
          name ? { name: { contains: name, mode: "insensitive" } } : {},
          email ? { email: { contains: email, mode: "insensitive" } } : {},
          address ? { address: { contains: address, mode: "insensitive" } } : {},
          role ? { role } : {}
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true
      }
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/admin/stores", authenticate, authorize(["ADMIN"]), async (req, res) => {
  try {
    const { name, email, address } = req.query;

    const stores = await prisma.store.findMany({
      where: {
        AND: [
          name ? { name: { contains: name, mode: "insensitive" } } : {},
          email ? { email: { contains: email, mode: "insensitive" } } : {},
          address ? { address: { contains: address, mode: "insensitive" } } : {}
        ]
      },
      include: {
        ratings: true,
        owner: true
      }
    });
    
    const formattedStores = stores.map(store => {
      const avgRating =
        store.ratings.length > 0
          ? store.ratings.reduce((a, b) => a + b.rating, 0) / store.ratings.length
          : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner?.name || "N/A",
        avgRating: avgRating.toFixed(1)
      };
    });

    res.json(formattedStores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

app.get("/owner/my-store", authenticate, authorize(["OWNER"]), async (req, res) => {
  try {
    const store = await prisma.store.findFirst({
      where: { ownerId: req.user.userId },
      include: { ratings: { include: { user: true } } },
    });

    if (!store) {
      return res.status(404).json({ error: "No store found for this owner" });
    }

    const avgRating =
      store.ratings.length > 0
        ? store.ratings.reduce((a, b) => a + b.rating, 0) / store.ratings.length
        : 0;

    res.json({
      store: store.name,
      avgRating: avgRating.toFixed(1),
      ratings: store.ratings.map((r) => ({
        user: r.user.name,
        email: r.user.email,
        rating: r.rating,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch store info" });
  }
});