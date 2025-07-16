import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { db } from './db';
import { customers } from './schema'; // ✅ import the table
import { eq, or } from 'drizzle-orm'; // ✅ for query conditions

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json()); // ✅ Required to read JSON bodies

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, '../dist/public')));

// Signup route
app.post("/api/signup", async (req, res) => {
  const { name, email, phone, password, role = "customer" } = req.body;

  if (!email || !password || !name || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existing = await db.query.customers.findFirst({
    where: eq(customers.email, email),
  });

  if (existing) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const [newUser] = await db.insert(customers).values({
    name,
    email,
    phone,
    password: hashedPassword,
    role,
  }).returning();

  res.json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
  });
});

// Login route
app.post("/api/login", async (req, res) => {
  const { email, phone, password } = req.body;

  if (!password || (!email && !phone)) {
    return res.status(400).json({ message: "Email or phone and password are required" });
  }

  const user = await db.query.customers.findFirst({
    where: or(
      email ? eq(customers.email, email) : undefined,
      phone ? eq(customers.phone, phone) : undefined
    ),
  });

  if (!user) return res.status(401).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid password" });

  return res.json({
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
  });
});

// React catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
