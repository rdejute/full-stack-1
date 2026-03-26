/* *******************
 * CONTROLLERS IMPORT
 *********************/
import healthController from '../../controllers/health.controller.js';

/* *******************
 * ROUTE CONFIGURATION
 *********************/
const healthRoutesEndpoint = (router) => {
    router.get('/hello', healthController.hello);
    router.get('/status', healthController.status);
    router.get('/error', healthController.error);
}

/* *******
 * EXPORTS
 *********/
export default { healthRoutesEndpoint };