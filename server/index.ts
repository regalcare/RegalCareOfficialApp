import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { db } from './db';
import { customers } from './schema';
import { eq, or } from 'drizzle-orm';
import { registerRoutes } from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, '../dist/public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Signup route
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, phone, password, role = "customer" } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user already exists
    const existing = await db.query.customers.findFirst({
      where: or(
        eq(customers.email, email),
        eq(customers.phone, phone)
      ),
    });

    if (existing) {
      if (existing.email === email) {
        return res.status(400).json({ error: "Email already registered" });
      }
      if (existing.phone === phone) {
        return res.status(400).json({ error: "Phone number already registered" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(customers).values({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      address: '', // Default empty address
      plan: 'basic', // Default plan
      status: 'active', // Default status
    }).returning();

    res.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password || (!email && !phone)) {
      return res.status(400).json({ error: "Email or phone and password are required" });
    }

    // Build query conditions
    const conditions = [];
    if (email) conditions.push(eq(customers.email, email));
    if (phone) conditions.push(eq(customers.phone, phone));

    const user = await db.query.customers.findFirst({
      where: conditions.length > 1 ? or(...conditions) : conditions[0],
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if user has a password (for legacy users)
    if (!user.password) {
      return res.status(401).json({ error: "Please reset your password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Return user data (without password)
    return res.json({
      user: {
        id: user.id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role || 'customer',
        address: user.address,
        plan: user.plan,
        status: user.status,
        serviceDay: 'Tuesday', // You might want to add this to your schema
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Register other routes
registerRoutes(app).then((httpServer) => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// React catch-all route (should be after all API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});