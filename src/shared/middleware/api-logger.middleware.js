/* **********************
 * MIDDLEWARE FUNCTIONS
 ***********************/
/**
 * MIDDLEWARE - Logger
 * Logs each API call with method, URL, and timestamp
 * Used for monitoring and debugging API usage
 */
export const apiLogger = (req, res, next) => {
    try {
        console.log(`API call: ${req.method} on ${req.originalUrl} at ${new Date()}`);
        next();
    } catch (error) {
        console.error('Logger middleware error:', error.message);
        res.status(500).json({ 
            error: 'Internal server error in logging middleware',
            message: error.message 
        });
    }
};