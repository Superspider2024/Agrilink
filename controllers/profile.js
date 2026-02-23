const User = require("../models/user.js")

// Get own user's details (Secured)
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) throw new Error("User not found");
        
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

// Get another user's profile (Secured)
const profile = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).select('-password');
        if (!user) throw new Error("User not found");

        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

// Update own profile (Optimized)
const updateProfile = async (req, res) => {
    try {
        const { name, location } = req.body;
        if (!name || !location) throw new Error("All fields are required");

        // findByIdAndUpdate handles the save operation natively.
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, location },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) throw new Error("Update failed");
        
        res.status(200).json(updatedUser);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

// Get all users (Secured)
const users = async (req, res) => {
    try {
        const allUsers = await User.find().select('-password');
        res.status(200).json(allUsers);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

module.exports = { getMe, profile, updateProfile, users }