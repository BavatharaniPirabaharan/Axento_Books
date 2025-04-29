const fetch = require('node-fetch'); // Make sure you install it: npm install node-fetch
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/authMiddleware");
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB Connection Error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB Disconnected. Attempting to reconnect...');
  connectDB();
});

// Chat Routes
app.use('/api/chat', chatRoutes);

// POST endpoint for login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: user.businessName,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST endpoint for registration
app.post("/api/auth/register", async (req, res) => {
  const { firstName, lastName, email, password, businessName, phoneNumber, nonCurrentAssets, nonCurrentAssetsDesc, liabilities, liabilitiesDesc, equity, equityDesc, currency } = req.body;

  // Check if all required fields are provided
  if (!firstName || !lastName || !email || !password || !businessName || !phoneNumber || !nonCurrentAssets || !liabilities || !equity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the provided data
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      businessName,
      phoneNumber,
      nonCurrentAssets,
      nonCurrentAssetsDesc,
      liabilities,
      liabilitiesDesc,
      equity,
      equityDesc,
      currency,
    });

    // Save the new user to the database
    await newUser.save();

    // Generate a JWT token for the new user
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Respond with success message and the token
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        businessName: newUser.businessName,
        phoneNumber: newUser.phoneNumber,
        nonCurrentAssets: newUser.nonCurrentAssets,
        nonCurrentAssetsDesc: newUser.nonCurrentAssetsDesc,
        liabilities: newUser.liabilities,
        liabilitiesDesc: newUser.liabilitiesDesc,
        equity: newUser.equity,
        equityDesc: newUser.equityDesc,
        currency: newUser.currency,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected Route - Get User Info
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      businessName: user.businessName,
      phoneNumber: user.phoneNumber,
      currency: user.currency,
      nonCurrentAssets: user.nonCurrentAssets,
      nonCurrentAssetsDesc: user.nonCurrentAssetsDesc,
      liabilities: user.liabilities,
      liabilitiesDesc: user.liabilitiesDesc,
      equity: user.equity,
      equityDesc: user.equityDesc,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✨ ADD THIS NEW ROUTE to connect to Gemini
app.post('/api/gemini/ask', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  // Log the received prompt for debugging
  console.log("Prompt received:", prompt);

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    const data = await response.json();

    // Log the response for debugging
    console.log("Gemini API response:", data);

    if (!data || !data.contents) {
      return res.status(500).json({ message: 'Invalid response from Gemini API' });
    }

    res.json(data);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ message: 'Error connecting to Gemini API' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start the server with error handling
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
    server.close();
    app.listen(PORT + 1, () => {
      console.log(`Server running on port ${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});
