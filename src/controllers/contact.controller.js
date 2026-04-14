/* **************************
 * SCHEMAS IMPORT
 ****************************/
import contactSchema from '../shared/db/mongodb/schemas/contact.schema.js';

/* **************
 * UTILITY IMPORT
 ************************/
import { ResponseUtil } from '../shared/utilities/response-util.js';

/* ***************
 * ROUTE HANDLERS
 *****************/
/**
 * POST - /contact-us
 * Handles contact form submissions from the website
 */
const contactUs = async (req, res) => {
    try {
        // Extract form data from request body
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

        // Create new contact document
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

        // Save to MongoDB
        const savedContact = await contactSchema.create(contactData);

        // Return success response
        ResponseUtil.respondOk(res, savedContact, 'Contact submitted successfully');
    } catch (error) {
        console.error('ContactUs error:', error.message);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map(err => err.message).join(', '),
                data: null
            });
        }

        // Handle other errors
        res.status(500).json({
            success: false,
            message: 'Failed to save contact',
            data: null
        });
    }
};

/* *******
 * EXPORTS
 *********/
export default {
    contactUs,
};