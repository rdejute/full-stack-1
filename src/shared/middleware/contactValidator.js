import validator from 'validator';

/**
 * Validates contact form submission data
 * Ensures all required fields are present and properly formatted
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateContactSubmission = (req, res, next) => {
    try {
        const {
            fullname,
            email,
            phone,
            company_name,
            project_name,
            department,
            project_desc,
            message
        } = req.body;

        // Validate required fields
        const requiredFields = [
            'fullname',
            'email', 
            'phone',
            'company_name',
            'project_name',
            'department',
            'project_desc',
            'message'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate fullname (non-empty string)
        if (!fullname || typeof fullname !== 'string' || fullname.trim().length === 0) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Full name is required and must be a non-empty string'
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

        // Validate phone number (10 digits)
        const cleanedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
        if (!/^\d{10}$/.test(cleanedPhone)) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Invalid phone number - must be 10 digits'
            });
        }

        // Validate company name (non-empty string)
        if (!company_name || typeof company_name !== 'string' || company_name.trim().length === 0) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Company name is required and must be a non-empty string'
            });
        }

        // Validate project name (non-empty string)
        if (!project_name || typeof project_name !== 'string' || project_name.trim().length === 0) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Project name is required and must be a non-empty string'
            });
        }

        // Validate department (non-empty string)
        if (!department || typeof department !== 'string' || department.trim().length === 0) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Department is required and must be a non-empty string'
            });
        }

        // Validate project description (non-empty string)
        if (!project_desc || typeof project_desc !== 'string' || project_desc.trim().length === 0) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Project description is required and must be a non-empty string'
            });
        }

        // Validate message (non-empty string)
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Message is required and must be a non-empty string'
            });
        }

        // Validate field lengths to prevent excessive input
        if (fullname.length > 100) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Full name must be 100 characters or less'
            });
        }

        if (email.length > 100) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Email must be 100 characters or less'
            });
        }

        if (company_name.length > 100) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Company name must be 100 characters or less'
            });
        }

        if (project_name.length > 100) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Project name must be 100 characters or less'
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Message must be 1000 characters or less'
            });
        }

        next();
    } catch (error) {
        console.error('Contact validation middleware error:', error.message);
        res.status(500).json({
            type: 'error',
            data: null,
            message: 'Internal server error in contact validation'
        });
    }
};
