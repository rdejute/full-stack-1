/* *******************
 * CONTROLLERS IMPORT
 *********************/
import contactController from '../../controllers/contact.controller.js';

/* *******************
 * MIDDLEWARE IMPORTS
 *********************/
import { validateEmail } from '../../shared/middleware/emailValidator.js';
import { validatePhone } from '../../shared/middleware/phoneValidator.js';

/* *******************
 * ROUTE CONFIGURATION
 *********************/
const contactRoutesEndpoint = (app) => {
    app.post('/contact-us', validateEmail, validatePhone, contactController.contactUs);
}

/* *******
 * EXPORTS
 *********/
export default { contactRoutesEndpoint };