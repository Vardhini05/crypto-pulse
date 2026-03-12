import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailOTP from "../utils/sendOTP.js";
import dotenv from "dotenv";

dotenv.config();

// SIGNUP
export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Email and password are required" });

    const existuser = await User.findOne({ email });

    if (existuser)
      return res.status(400).json({ message: "User already exists" });

    const hashpwd = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashpwd,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ token, user });

  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};


// LOGIN
export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.password)
      return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ token, user });

  } catch (err) {

    res.status(500).json({ message: "Login failed", error: err.message });

  }
};


// SEND OTP
export const sendOTP = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ msg: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpiresAt = new Date(Date.now() + 10 * 60000);

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;

    await user.save();

    // FIXED HERE
    await sendEmailOTP(email, otp);

    res.json({ msg: "OTP sent to email" });

  } catch (err) {

    console.error("Error sending OTP:", err);

    res.status(500).json({
      message: "Failed to generate OTP",
      error: err.message
    });

  }
};


// VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {

    const { email, otp, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ msg: "Invalid or expired OTP" });

    if (user.otp !== otp || new Date() > user.otpExpiresAt) {

      if (new Date() > user.otpExpiresAt) {
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();
      }

      return res.status(400).json({ msg: "Invalid or expired OTP" });

    }

    if (!password)
      return res.status(400).json({ msg: "Password is required" });

    user.password = await bcrypt.hash(password, 12);

    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    res.json({ msg: "Password updated successfully" });

  } catch (err) {

    console.error("Error verifying OTP:", err);

    res.status(500).json({
      msg: "Failed to verify OTP",
      error: err.message
    });

  }
};


// GOOGLE LOGIN
export const googleSignIn = async (req, res) => {
  res.status(501).json({ msg: "Google Sign-in not implemented yet" });
};