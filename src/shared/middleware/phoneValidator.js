/* *************************
 * ENVIRONMENT CONFIGURATION
 ***************************/
import dotenv from "dotenv";
dotenv.config();

/* *********************
 * THIRD-PARTY LIBRARIES
 ***********************/
import validator from 'validator';

/* **********************
 * MIDDLEWARE FUNCTIONS
 ***********************/
/**
 * MIDDLEWARE - Phone Validator
 * Validates phone number format using validator library
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validatePhone = (req, res, next) => {
    try {
        const { phone } = req.body;

        // Check if phone exists and is valid
        if (!phone || !validator.isMobilePhone(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number',
                data: null
            });
        }

        next();
    } catch (error) {
        console.error('Phone validation middleware error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error in phone validation',
            data: null
        });
    }
};