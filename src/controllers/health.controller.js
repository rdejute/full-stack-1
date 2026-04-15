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
 * Returns server status information using Response Utility format
 */
const status = (_req, res) => {
    ResponseUtil.respondOk(res, { status: 'ok' }, 'Server is running');
};

/**
 * GET - /error
 * Simulates an error response for front-end testing using Response Utility format
 */
const error = (_req, res) => {
    ResponseUtil.respondError(res, 500, null, 'This is a test error');
};


/* *******
 * EXPORTS
 *********/
export default {
    hello,
    status,
    error,
};
