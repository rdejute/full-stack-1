import quoteController from '../../controllers/quote.controller.js';
import { validateBuildingType } from '../../shared/middleware/buildingTypeValidator.js';
import { validateEmail } from '../../shared/middleware/emailValidator.js';
import { validateQuoteParams, validateQuoteContact } from '../../shared/middleware/quoteValidator.js';

const quoteRoutesEndpoint = (app) => {
    app.post('/calc/:buildingType', validateQuoteParams, validateQuoteContact, quoteController.postQuote);
}

/* *******
 * EXPORTS
 *********/
export default { quoteRoutesEndpoint };