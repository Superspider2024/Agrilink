const jwt = require("jsonwebtoken");

// Added 'role' parameter to the function and payload
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

module.exports = { generateToken };