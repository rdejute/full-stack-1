/* *******************
 * CONTROLLERS IMPORT
 *********************/
import regionController from '../../controllers/region.controller.js';

/* *******************
 * ROUTE CONFIGURATION
 *********************/
const regionRoutesEndpoint = (app) => {
    app.get('/region-avg', regionController.regionAvg);
    app.post('/region-create', regionController.createRegion);
    app.get('/region', regionController.getRegion);
    app.get('/all-stars', regionController.getAllStars);
}

/* *******
 * EXPORTS
 *********/
export default { regionRoutesEndpoint };