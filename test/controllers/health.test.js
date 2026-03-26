/* *********************
 * TESTING LIBRARIES
 ***********************/
import chai from 'chai'; // Assertion library for verifying test results
import sinon from 'sinon'; // Mocking library to stub/spy on functions

/* *********************
 * MODULE TO TEST
 ***********************/
import HealthController from '../../src/controllers/health.controller.js';

/* *********************
 * DEPENDENCIES TO MOCK
 ***********************/
import { ResponseUtil } from '../../src/shared/utilities/response-util.js'; // Stub this to intercept calls

/* *********************
 * TEST SUITE
 ***********************/
describe('HealthController',() => {
  // Clean up all stubs after each test to avoid interference
  afterEach(() => {
    sinon.restore();
  });

  describe('#helloWorld()',() => {
    it('respond with Hello World',(done) => {
      // Create a fake version of respondOk to intercept the call
      sinon.stub(ResponseUtil,'respondOk').callsFake((res,data,message) => {
        // Verify the message is "Hello World"
        chai.assert.equal(message,'Hello World');
        // Signal that the async test is complete
        done();
      });
      
      // Execute the hello function (void ignores the promise)
      void HealthController.hello();
    });
  });
});
