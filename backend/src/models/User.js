import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["admin"], default: "admin" }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
