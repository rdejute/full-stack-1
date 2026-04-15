import dotenv from "dotenv";
dotenv.config();

/**
 * Authentication middleware that validates Authorization header
 * 
 * Protects API endpoints by requiring a valid authorization token that matches
 * the SECRET environment variable. Public routes bypass authentication.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object  
 * @param {Function} next - Express next function
 */
export const authHeader = (req, res, next) => {
    try {
        const publicRoutes = ['/hello', '/status', '/error'];

        // Skip authentication for public routes
        // Allows health check endpoints to work without auth
        if (publicRoutes.includes(req.path)) {
            return next();
        }

        const headerAuth = req.header('Authorization');

        // Reject requests without Authorization header
        // Frontend must include this header for protected endpoints
        if (!headerAuth) {
            return res.status(401).json({ 
                error: 'Authorization header required',
                message: 'Please provide Authorization header' 
            });
        }

        // Ensure SECRET environment variable is configured
        // Prevents server from running without proper auth setup
        if (!process.env.SECRET) {
            console.error('SECRET not configured in environment variables');
            return res.status(500).json({ 
                error: 'Server configuration error',
                message: 'Authentication not properly configured' 
            });
        }

        // Validate token matches environment secret exactly
        // Simple token-based authentication for development/demo purposes
        if (headerAuth !== process.env.SECRET) {
            return res.status(403).json({ 
                error: 'Access Forbidden',
                message: 'Invalid authorization token' 
            });
        }

        // Authentication successful, continue to next middleware
        next();

    } catch (error) {
        // Handle unexpected errors in authentication logic
        console.error('Authentication middleware error:', error.message);
        res.status(500).json({ 
            error: 'Internal server error in authentication middleware',
            message: error.message 
        });
    }
};