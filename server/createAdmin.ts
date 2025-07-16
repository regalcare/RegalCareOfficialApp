import { db } from "./db";
import { customers } from "./schema";
import bcrypt from "bcryptjs";

async function createAdmin() {
  try {
    console.log("Creating admin user...");

    const hashedPassword = await bcrypt.hash("yourAdminPassword", 10);

    const result = await db.insert(customers).values({
      name: "Admin User",
      email: "admin@regalcare.com",
      phone: "407-443-4142",
      password: hashedPassword,
      role: "admin",
      address: "123 Admin Lane", // ✅ Required field
      servicePlan: "basic",      // ✅ Required field
      status: "active",          // ✅ Optional if default
    });

    console.log("✅ Admin created:", result);
  } catch (err) {
    console.error("❌ Failed to create admin:", err);
  }
}

createAdmin();
