// backend/server.js - UniHub Backend Server
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import middleware (if they exist)
const errorHandler = require("./middleware/error.middleware"); // optional - comment out if file doesn't exist yet

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic test route
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "✅ UniHub Backend Server is Running Successfully!" 
  });
});

// TODO: Add your routes here later (uncomment when ready)
// const authRoutes = require("./routes/authRoutes");
// const teamRoutes = require("./routes/teamRoutes");
// const taskRoutes = require("./routes/taskRoutes");
// const resourceRoutes = require("./routes/resourceRoutes");
// const notificationRoutes = require("./routes/notificationRoutes");

// app.use("/api/auth", authRoutes);
// app.use("/api/teams", teamRoutes);
// app.use("/api/tasks", taskRoutes);
// app.use("/api/resources", resourceRoutes);
// app.use("/api/notifications", notificationRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
// backend/server.js  (add this debug right after dotenv)

require("dotenv").config();

console.log("=== ENV DEBUG ===");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ LOADED" : "❌ MISSING");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ LOADED" : "❌ MISSING");
console.log("PORT:", process.env.PORT);
console.log("================");

// ... rest of your code ...

// Then the connection:
mongoose.connect(process.env.MONGO_URI || "")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));