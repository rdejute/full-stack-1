/* **********************
 * UTILITY IMPORT
 ************************/
import { ResponseUtil } from '../shared/utilities/response-util.js';


/* ********************
* ENVIRONMENT VARIABLES
***********************/
const PORT = process.env.PORT || 3004;
const ENV = process.env.ENV_NAME || process.env.ENV || 'local';


/* ***************
* ROUTE HANDLERS
*****************/
/**
 * GET - /hello
 * Simple endpoint that returns a greeting message
*/
const hello = async (_req, res) => {
    console.log(`Server listening on port ${PORT}`);
    ResponseUtil.respondOk(res, null, 'Hello World')
    // res.status(200).send('Hello World');
};

/**
 * GET - /status
 * Returns server status information including port and environment
 */
const status = (_req, res) => {
    res.status(200).send(`Server listening on port ${PORT} in the ${ENV} environment`)
};

/**
 * GET - /error
 * Simulates an error response for front-end testing
 */
const error = (_req, res) => {
    try {
        // Intentionally throw an error to simulate server problems
        throw new Error('Internal Server Error - This is a simulated error response for front-end development purposes.');
    } catch (error) {
        ResponseUtil.respondError(res, 500, null, error.message);
    }
};


/* *******
 * EXPORTS
 *********/
export default {
    hello,
    status,
    error,
};
