/* *******************
 * CONTROLLERS IMPORT
 *********************/
import contactController from '../../controllers/contact.controller.js';

/* *******************
 * ROUTE CONFIGURATION
 *********************/
const contactRoutesEndpoint = (app) => {
    app.post('/contact-us', contactController.contactUs);
}

/* *******
 * EXPORTS
 *********/
export default { contactRoutesEndpoint };