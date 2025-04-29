const express = require("express");
const { registerUser, loginUser, registerStep2 } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");  // Import your auth middleware
const router = express.Router();

// Register route (Step 1)
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Register Step 2 route
router.post("/register/step2", registerStep2);

// Example of a protected route (you can add more like this)
router.get("/profile", authMiddleware, (req, res) => {
    res.status(200).json({ message: "User profile data", user: req.user });
});

module.exports = router;
