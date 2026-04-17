/**
 * Rocket Elevators Full-Stack Application
 * 
 * Express server that serves static frontend files and provides RESTful API endpoints
 * for contact forms, quote calculations, agent management, and business analytics.
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from 'cors';

import mongoManager from './src/shared/db/mongodb/mongo-manager.js';

import { apiLogger } from './src/shared/middleware/api-logger.middleware.js';
import { authHeader } from './src/shared/middleware/auth-header.middleware.js';

// Public routes (no authentication required)
import healthRoutes from './src/routes/open/health.routes.js';
// Protected routes (header authentication required)
import quoteRoutes from './src/routes/protected/quote.routes.js';
import contactRoutes from './src/routes/protected/contact.routes.js';
import agentRoutes from './src/routes/protected/agent.routes.js';
import regionRoutes from './src/routes/protected/region.routes.js';

// Initialize Express app with port from environment or default
const PORT = process.env.PORT || 3004;
const app = express();

// Establish database connection before starting server
// Exit process if connection fails to prevent running without data persistence
try {
    await mongoManager.openMongoConnection();
    console.log(' Database connected successfully');
} catch (error) {
    console.error(' Database connection failed:', error.message);
    process.exit(1);
}

// Configure global middleware in execution order
// JSON parsing must come before CORS for proper request handling
app.use(express.json());
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500'
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.static('./src/public'));
app.use(apiLogger);
app.use(authHeader);

// Register all route endpoints with the Express app
// Public routes are registered first, followed by protected routes
healthRoutes.healthRoutesEndpoint(app);
quoteRoutes.quoteRoutesEndpoint(app);
contactRoutes.contactRoutesEndpoint(app);
agentRoutes.agentRoutesEndpoint(app);
regionRoutes.regionRoutesEndpoint(app);

// Catch-all handler for undefined routes
// Must be registered after all other routes to act as fallback
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `${req.method} ${req.originalUrl} does not exist`
    });
});

// Start server and listen for incoming connections
app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Base URL: http://localhost:${PORT}`);
});

// Handle graceful shutdown on SIGINT (Ctrl+C)
// Ensures database connection is properly closed before process exit
process.on('SIGINT', async () => {
    console.log(' Shutting down server gracefully...');
    try {
        await mongoManager.closeMongoConnection();
        console.log(' Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error(' Error during shutdown:', error.message);
        process.exit(1);
    }
});

// Export app instance for testing purposes
// Allows test files to import and make requests against the app
export default app;