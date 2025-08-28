import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";

const { MONGO_URI } = process.env;

async function seed() {
  await mongoose.connect(MONGO_URI);
  const email = "admin@costao.com";
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Usuário admin já existe:", email);
  } else {
    const password_hash = await bcrypt.hash("admin@123", 10);
    await User.create({ name: "Administrador", email, password_hash, role: "admin" });
    console.log("✅ Admin criado:", email, "senha: admin@123");
  }
  await mongoose.disconnect();
}
seed().catch((e) => { console.error(e); process.exit(1); });
