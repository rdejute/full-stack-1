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

describe('GET /status', () => {
  
  it('should return 200 status code', (done) => {
    chai.request(app)
      .get('/status')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done(err);
      });
  });

  it('should return success: true', (done) => {
    chai.request(app)
      .get('/status')
      .end((err, res) => {
        expect(res.body).to.have.property('type', 'success');
        done(err);
      });
  });

  it('should return message about server running', (done) => {
    chai.request(app)
      .get('/status')
      .end((err, res) => {
        expect(res.body.message).to.include('running');
        done(err);
      });
  });

  it('should have data property with status: ok', (done) => {
    chai.request(app)
      .get('/status')
      .end((err, res) => {
        expect(res.body).to.have.property('data');
        expect(res.body.data).to.have.property('status', 'ok');
        done(err);
      });
  });

  it('should use Response Utility format', (done) => {
    chai.request(app)
      .get('/status')
      .end((err, res) => {
        expect(res.body).to.have.property('type');
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('data');
        done(err);
      });
  });

});
