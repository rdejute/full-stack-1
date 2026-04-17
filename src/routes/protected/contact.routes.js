import contactController from '../../controllers/contact.controller.js';

import { validateEmail } from '../../shared/middleware/emailValidator.js';
import { validatePhone } from '../../shared/middleware/phoneValidator.js';
import { validateContactSubmission } from '../../shared/middleware/contactValidator.js';

const contactRoutesEndpoint = (app) => {
    app.post('/contact-us', validateContactSubmission, contactController.contactUs);
}

/* *******
 * EXPORTS
 *********/
export default { contactRoutesEndpoint };