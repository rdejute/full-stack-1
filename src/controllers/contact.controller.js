/* ***************
 * ROUTE HANDLERS
 *****************/
/**
 * POST - /contact-us
 * Handles contact form submissions from the website
 */
const contactUs = (req, res) => {
    try {
        // Extract form data from request body
        const { first_name, last_name, message } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !message) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                message: 'first_name, last_name, and message are required' 
            });
        }

        // Simulate processing the contact form (e.g., saving to DB or sending email)
        console.log(`Message from ${first_name} ${last_name}: ${message}`);

        res.status(200).json({
            message: `Thank you ${first_name} ${last_name} for contacting us.`,
            received: { first_name, last_name, message }
        });
    } catch (error) {
        console.error('ContactUs error:', error.message);
        res.status(500).json({ error: 'Server error processing contact form' });
    }
};

/* *******
 * EXPORTS
 *********/
export default {
  contactUs,
};