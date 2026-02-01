const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        console.log(`[AUTH] Checking token for path: ${req.path}`);

        if (!token) {
            console.log('[AUTH] No token found in headers');
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`[AUTH] Token verified for userId: ${decoded.userId}`);

        // Find user
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            console.log('[AUTH] User not found in database');
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user to request
        req.user = user;
        req.userId = decoded.userId;

        console.log(`[AUTH] Authenticated as: ${user.username}`);
        next();
    } catch (error) {
        console.log(`[AUTH] Error: ${error.message}`);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;