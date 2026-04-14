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
 * MIDDLEWARE - Email Validator
 * Validates email format using validator library
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateEmail = (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if email exists and is valid
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
                data: null
            });
        }

        next();
    } catch (error) {
        console.error('Email validation middleware error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error in email validation',
            data: null
        });
    }
};