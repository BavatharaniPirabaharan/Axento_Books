const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,  // Ensure email is unique
        trim: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address'] // Email format validation
    },
    password: { 
        type: String, 
        required: true 
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Hash password before saving the user document
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // If password hasn't been modified, skip hashing

    try {
        const hashedPassword = await bcrypt.hash(this.password, 10);  // Hash password
        this.password = hashedPassword;
        next();  // Proceed to save the document
    } catch (error) {
        next(error);  // Handle errors
    }
});

// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ businessName: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
