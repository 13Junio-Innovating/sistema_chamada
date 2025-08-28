import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

// POST /api/auth/login  { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u) return res.status(401).json({ error: "Credenciais inválidas" });

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign({ id: u._id, name: u.name, email: u.email }, process.env.JWT_SECRET, { expiresIn: "10h" });
    res.json({ token, user: { id: u._id, name: u.name, email: u.email } });
  } catch (e) {
    res.status(500).json({ error: "Erro ao autenticar" });
  }
});

export default router;
