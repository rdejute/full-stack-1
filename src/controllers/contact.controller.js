import contactSchema from '../shared/db/mongodb/schemas/contact.schema.js';
import { ResponseUtil } from '../shared/utilities/response-util.js';

/**
 * Handles contact form submissions from the website
 * 
 * Processes incoming contact requests, validates data through Mongoose schema,
 * and persists contact information to MongoDB for lead generation.
 * 
 * @param {Request} req - Express request object with contact form data
 * @param {Response} res - Express response object
 */
const contactUs = async (req, res) => {
    try {
        // Destructure required fields from request body
        // Mongoose schema will validate required fields and data types
        const {
            fullname,
            email,
            phone,
            company_name,
            project_name,
            department,
            project_desc,
            message,
            file
        } = req.body;

        // Prepare contact data for database insertion
        // File field is optional, default to null if not provided
        const contactData = {
            fullname,
            email,
            phone,
            company_name,
            project_name,
            department,
            project_desc,
            message,
            file: file || null
        };

        // Persist contact to MongoDB with automatic validation
        // Mongoose will throw ValidationError if required fields are missing
        const savedContact = await contactSchema.create(contactData);

        // Return standardized success response with saved contact data
        ResponseUtil.respondOk(res, savedContact, 'Contact submitted successfully');
    } catch (error) {
        console.error('ContactUs error:', error.message);

        // Handle Mongoose validation errors specifically
        // Returns detailed validation messages to help frontend fix issues
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map(err => err.message).join(', '),
                data: null
            });
        }

        // Handle database connection or other server errors
        // Generic error message to avoid exposing internal details
        res.status(500).json({
            success: false,
            message: 'Failed to save contact',
            data: null
        });
    }
};

export default {
    contactUs,
};