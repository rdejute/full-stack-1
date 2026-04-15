/* *********************
 * TESTING LIBRARIES
 ***********************/
import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';

/* *********************
 * MODULE TO TEST
 ***********************/
import app from '../../app.js';

// Use chai-http for HTTP testing
chai.use(chaiHttp);
const expect = chai.expect;

describe('GET /error', () => {
  
  it('should return 500 status code', (done) => {
    chai.request(app)
      .get('/error')
      .end((err, res) => {
        expect(res).to.have.status(500);
        done(err);
      });
  });

  it('should return success: false (type: error)', (done) => {
    chai.request(app)
      .get('/error')
      .end((err, res) => {
        expect(res.body).to.have.property('type', 'error');
        done(err);
      });
  });

  it('should return error message', (done) => {
    chai.request(app)
      .get('/error')
      .end((err, res) => {
        expect(res.body.message).to.exist;
        expect(res.body.message).to.equal('This is a test error');
        done(err);
      });
  });

  it('should have data: null for error', (done) => {
    chai.request(app)
      .get('/error')
      .end((err, res) => {
        expect(res.body.data).to.be.null;
        done(err);
      });
  });

  it('should use Response Utility format', (done) => {
    chai.request(app)
      .get('/error')
      .end((err, res) => {
        expect(res.body).to.have.property('type');
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('data');
        done(err);
      });
  });

});
