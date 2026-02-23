// utils/jwt.js
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET || "mavuno_secret_2026", {
        expiresIn: "30d",
    });
};

module.exports = { generateToken };