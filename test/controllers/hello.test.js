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

describe('Health Controller - Hello Endpoint', () => {
    
    describe('GET /hello', () => {
        
        it('should return 200 status code', (done) => {
            chai.request(app)
                .get('/hello')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done(err);
                });
        });

        it('should return Response Utility success format', (done) => {
            chai.request(app)
                .get('/hello')
                .end((err, res) => {
                    expect(res.body).to.have.property('type', 'success');
                    expect(res.body).to.have.property('data');
                    expect(res.body).to.have.property('message');
                    expect(res.body.data).to.be.null;
                    done(err);
                });
        });

        it('should return "Hello World" message', (done) => {
            chai.request(app)
                .get('/hello')
                .end((err, res) => {
                    expect(res.body.message).to.equal('Hello World');
                    done(err);
                });
        });

        it('should work without Authorization header', (done) => {
            chai.request(app)
                .get('/hello')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('type', 'success');
                    done(err);
                });
        });

        it('should work with Authorization header', (done) => {
            chai.request(app)
                .get('/hello')
                .set('Authorization', 'mySecretKey123')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('type', 'success');
                    done(err);
                });
        });
    });
});
