/* *************************
 * ENVIRONMENT CONFIGURATION
 ***************************/
import dotenv from "dotenv";
dotenv.config();


/* *****************
 * CORE DEPENDENCIES
 *******************/
import express from "express";
import cors from 'cors';


/* ****************
 * DATABASE IMPORTS
 ******************/
import mongoManager from './src/shared/db/mongodb/mongo-manager.js';


/* ******************
 * MIDDLEWARE IMPORTS
 ********************/
import { apiLogger } from './src/shared/middleware/api-logger.middleware.js';
import { authHeader } from './src/shared/middleware/auth-header.middleware.js';


/* *************
 * ROUTE IMPORTS
 ***************/
// Public routes
import healthRoutes from './src/routes/open/health.routes.js';
// Protected routes
import quoteRoutes from './src/routes/protected/quote.routes.js';
import contactRoutes from './src/routes/protected/contact.routes.js';
import agentRoutes from './src/routes/protected/agent.routes.js';
import regionRoutes from './src/routes/protected/region.routes.js';


/* ********************
 * SERVER CONFIGURATION
 **********************/
const PORT = process.env.PORT || 3004;
const app = express();


/* ***********************
 * DATABASE INITIALIZATION
 *************************/
try {
    await mongoManager.openMongoConnection();
    console.log('✅ Database connected successfully');
} catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
}


/* ***********************
 * GLOBAL MIDDLEWARE SETUP
 *************************/
app.use(express.json());
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500'
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.static('./src/public')) //serves our static genesis project
app.use(apiLogger);
app.use(authHeader);


/* ******************
 * ROUTE REGISTRATION
 ********************/
// Open routes (no authentication required)
healthRoutes.healthRoutesEndpoint(app);
// Protected routes (header authentication required)
quoteRoutes.quoteRoutesEndpoint(app);
contactRoutes.contactRoutesEndpoint(app);
agentRoutes.agentRoutesEndpoint(app);
regionRoutes.regionRoutesEndpoint(app);


/* **************
 * ERROR HANDLING
 ****************/
// 404 handler for unmatched routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `${req.method} ${req.originalUrl} does not exist`
    });
});


/* **************
 * SERVER STARTUP
 ****************/
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Base URL: http://localhost:${PORT}`);
});


/* *****************
 * GRACEFUL SHUTDOWN
 *******************/
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down server gracefully...');
    try {
        await mongoManager.closeMongoConnection();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
    }
});

/* *****************
 * EXPORT APP FOR TESTING
 *******************/
export default app;