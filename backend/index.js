import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDb from "./config/connectionDb.js";
import authRoutes from "./routes/authRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://crypto-pulse-8dtn.onrender.com"
  ],
  credentials: true
}));

app.use(express.json());

// API routes
app.use("/api", authRoutes);

// Test route (important for Render)
app.get("/", (req, res) => {
  res.send("🚀 Crypto Pulse Backend Running");
});

// Start server
const startServer = async () => {
  try {

    await connectDb();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {

    console.error("❌ Server startup failed:", error);
    process.exit(1);

  }
};

startServer();