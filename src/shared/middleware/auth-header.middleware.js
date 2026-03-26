/* *************************
 * ENVIRONMENT CONFIGURATION
 ***************************/
import dotenv from "dotenv";
dotenv.config();


/* **********************
 * MIDDLEWARE FUNCTIONS
 ***********************/
/**
 * MIDDLEWARE - Authentication Token
 * Validates authentication token against environment variable
 * Requires Authorization header to match SECRET in .env file
 */
export const authHeader = (req, res, next) => {
    try {
        const publicRoutes = ['/hello', '/status', '/error'];

        // Check if the requested path is public
        if (publicRoutes.includes(req.path)) {
            return next();
        }

        const headerAuth = req.header('Authorization');

        // Check if Authorization header exists
        if (!headerAuth) {
            return res.status(401).json({ 
                error: 'Authorization header required',
                message: 'Please provide Authorization header' 
            });
        }

        // Validate environment secret exists
        if (!process.env.SECRET) {
            console.error('SECRET not configured in environment variables');
            return res.status(500).json({ 
                error: 'Server configuration error',
                message: 'Authentication not properly configured' 
            });
        }

        // Compare authorization header with environment secret
        if (headerAuth !== process.env.SECRET) {
            return res.status(403).json({ 
                error: 'Access Forbidden',
                message: 'Invalid authorization token' 
            });
        }

        next();

    } catch (error) {
        console.error('Authentication middleware error:', error.message);
        res.status(500).json({ 
            error: 'Internal server error in authentication middleware',
            message: error.message 
        });
    }
};