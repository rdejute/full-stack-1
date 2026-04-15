/* *******************
 * CONTROLLERS IMPORT
 *********************/
import quoteController from '../../controllers/quote.controller.js';
import { validateBuildingType } from '../../shared/middleware/buildingTypeValidator.js';
import { validateEmail } from '../../shared/middleware/emailValidator.js';

/* *******************
 * ROUTE CONFIGURATION
 *********************/
const quoteRoutesEndpoint = (app) => {
    app.post('/calc/:buildingType', validateBuildingType, validateEmail, quoteController.postQuote);
}

/* *******
 * EXPORTS
 *********/
export default { quoteRoutesEndpoint };