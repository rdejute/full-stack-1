import validator from 'validator';

/**
 * Validates agent creation data
 * Ensures required fields are present and properly formatted
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateAgentCreation = (req, res, next) => {
    try {
        const { first_name, last_name, email, region } = req.body;

        // Validate required fields
        const requiredFields = ['first_name', 'last_name', 'email', 'region'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate name fields (non-empty strings)
        if (!first_name || typeof first_name !== 'string' || first_name.trim().length === 0) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'First name is required and must be a non-empty string'
            });
        }

        if (!last_name || typeof last_name !== 'string' || last_name.trim().length === 0) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Last name is required and must be a non-empty string'
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Invalid email format'
            });
        }

        // Validate region (must be one of allowed regions)
        const allowedRegions = ['north', 'south', 'east', 'west'];
        if (!allowedRegions.includes(region.toLowerCase())) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: `Invalid region. Allowed regions: ${allowedRegions.join(', ')}`
            });
        }

        // Validate optional fields if present
        if (req.body.rating !== undefined) {
            const rating = Number(req.body.rating);
            if (isNaN(rating) || rating < 0 || rating > 100) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'Rating must be a number between 0 and 100'
                });
            }
        }

        if (req.body.fee !== undefined) {
            const fee = Number(req.body.fee);
            if (isNaN(fee) || fee < 0) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'Fee must be a non-negative number'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Agent validation middleware error:', error.message);
        res.status(500).json({
            type: 'error',
            data: null,
            message: 'Internal server error in agent validation'
        });
    }
};

/**
 * Validates ObjectId for MongoDB operations
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateObjectId = (req, res, next) => {
    try {
        const agentId = req.params.id || req.query.id || req.body.id;

        if (!agentId) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Agent ID is required'
            });
        }

        // Validate MongoDB ObjectId format
        if (!validator.isMongoId(agentId)) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Invalid agent ID format'
            });
        }

        next();
    } catch (error) {
        console.error('ObjectId validation middleware error:', error.message);
        res.status(500).json({
            type: 'error',
            data: null,
            message: 'Internal server error in ObjectId validation'
        });
    }
};

/**
 * Validates agent update data
 * Ensures at least one valid field is provided for update
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateAgentUpdate = (req, res, next) => {
    try {
        const { first_name, last_name, email, region, rating, fee } = req.body;

        // Check if at least one field is provided for update
        const updateFields = Object.keys(req.body).filter(key => req.body[key] !== undefined);
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'At least one field must be provided for update'
            });
        }

        // Validate email if provided
        if (email !== undefined && !validator.isEmail(email)) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Invalid email format'
            });
        }

        // Validate region if provided
        if (region !== undefined) {
            const allowedRegions = ['north', 'south', 'east', 'west'];
            if (!allowedRegions.includes(region.toLowerCase())) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: `Invalid region. Allowed regions: ${allowedRegions.join(', ')}`
                });
            }
        }

        // Validate rating if provided
        if (rating !== undefined) {
            const ratingNum = Number(rating);
            if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 100) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'Rating must be a number between 0 and 100'
                });
            }
        }

        // Validate fee if provided
        if (fee !== undefined) {
            const feeNum = Number(fee);
            if (isNaN(feeNum) || feeNum < 0) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'Fee must be a non-negative number'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Agent update validation middleware error:', error.message);
        res.status(500).json({
            type: 'error',
            data: null,
            message: 'Internal server error in agent update validation'
        });
    }
};
