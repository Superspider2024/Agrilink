// middleware/authorize.js
const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // req.user is populated by the protect middleware
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return res.status(403).json({ error: "Access Denied: Unauthorized Role" });
        }
        next();
    };
};

module.exports = authorize;