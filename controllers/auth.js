// controllers/auth.js
const User = require("../models/user.js");
const { generateToken } = require("../utils/jwt.js");
const bcrypt = require("bcryptjs");

const signup = async (req, res) => {
    try {
        const { name, email, password, location, role } = req.body;
        
        // Ensure role is valid for Mavuno Protocol
        const validRoles = ["farmer", "buyer", "porter", "mansart"];
        if (!validRoles.includes(role)) {
            throw new Error("Invalid role selection");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            location,
            role
        });

        const token = generateToken(user._id);
        res.status(201).json({ token, user: { id: user._id, role: user.role } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user._id);
        res.status(200).json({ token, user: { id: user._id, role: user.role } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = { signup, login };