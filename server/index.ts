import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import { db } from './db'; // ✅ Ensure this is imported correctly

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Required to parse JSON requests
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Static files (JS/CSS)
app.use(express.static(path.join(__dirname, '../dist/public')));

// ✅ API routes FIRST
app.post("/api/signup", async (req, res) => {
  const { name, email, password, role = "customer" } = req.body;

  const existing = await db.user.findFirst({ where: { email } });
  if (existing) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  res.json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await db.user.findFirst({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// ✅ Catch-all for React App should be LAST
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/public/index.html'));
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
