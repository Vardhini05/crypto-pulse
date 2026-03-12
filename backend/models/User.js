import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  cryptos: {
    type: [String],
    default: ['bitcoin', 'ethereum', 'solana', 'cardano', 'tron']
  }
});

const User = mongoose.model("User", userSchema);

export default User;