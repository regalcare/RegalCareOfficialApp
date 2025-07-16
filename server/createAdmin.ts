import { db } from "../db"; // adjust the import path to your actual DB instance
import { customers } from "../schema"; // adjust as needed
import bcrypt from "bcryptjs";

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("Drums8888!", 10);

  await db.insert(customers).values({
    name: "Admin User",
    email: "admin@regalcare.com",
    phone: "407-443-4142",
    password: hashedPassword,
    role: "admin",
  });

  console.log("✅ Admin created successfully.");
  process.exit();
}

createAdmin().catch((err) => {
  console.error("❌ Failed to create admin:", err);
  process.exit(1);
});