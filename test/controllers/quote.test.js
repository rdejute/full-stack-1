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

describe('Quote Controller', () => {
    
    describe('POST /calc/:buildingType', () => {
        
        it('should return 200 for residential quote calculation', (done) => {
            const quoteData = {
                fullname: 'Test User',
                email: 'test@example.com'
            };

            chai.request(app)
                .post('/calc/residential?apartments=50&floors=10')
                .set('Authorization', 'mySecretKey123')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('type', 'success');
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.have.property('buildingType', 'residential');
                    expect(res.body.data).to.have.property('calculatedElevators');
                    expect(res.body.data).to.have.property('estimatedCost');
                    done(err);
                });
        });

        it('should return 200 for commercial quote calculation', (done) => {
            const quoteData = {
                fullname: 'Test User',
                email: 'test@example.com'
            };

            chai.request(app)
                .post('/calc/commercial?floors=5&occupancy=100')
                .set('Authorization', 'mySecretKey123')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('type', 'success');
                    expect(res.body.data).to.have.property('buildingType', 'commercial');
                    done(err);
                });
        });

        it('should return 200 for industrial quote calculation', (done) => {
            const quoteData = {
                fullname: 'Test User',
                email: 'test@example.com'
            };

            chai.request(app)
                .post('/calc/industrial?elevators=3')
                .set('Authorization', 'mySecretKey123')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('type', 'success');
                    expect(res.body.data).to.have.property('buildingType', 'industrial');
                    done(err);
                });
        });

        it('should return 400 for missing query parameters', (done) => {
            const quoteData = {
                fullname: 'Test User',
                email: 'test@example.com'
            };

            chai.request(app)
                .post('/calc/residential') // Missing apartments and floors
                .set('Authorization', 'mySecretKey123')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body).to.have.property('message');
                    done(err);
                });
        });

        it('should return 400 for invalid building type', (done) => {
            const quoteData = {
                fullname: 'Test User',
                email: 'test@example.com'
            };

            chai.request(app)
                .post('/calc/invalid-type?apartments=10&floors=5')
                .set('Authorization', 'mySecretKey123')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    done(err);
                });
        });

        it('should return 401 without Authorization header', (done) => {
            const quoteData = {
                fullname: 'Test User',
                email: 'test@example.com'
            };

            chai.request(app)
                .post('/calc/residential?apartments=10&floors=5')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Authorization header required');
                    done(err);
                });
        });

        it('should return 403 with invalid Authorization header', (done) => {
            const quoteData = {
                fullname: 'Test User',
                email: 'test@example.com'
            };

            chai.request(app)
                .post('/calc/residential?apartments=10&floors=5')
                .set('Authorization', 'invalidToken')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    expect(res.body).to.have.property('error', 'Access Forbidden');
                    done(err);
                });
        });

        it('should return 400 for invalid email format', (done) => {
            const quoteData = {
                fullname: 'Test User',
                email: 'invalid-email' // Invalid email format
            };

            chai.request(app)
                .post('/calc/residential?apartments=10&floors=5')
                .set('Authorization', 'mySecretKey123')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('Invalid email');
                    done(err);
                });
        });

        it('should validate numeric parameters are positive', (done) => {
            const quoteData = {
                fullname: 'Test User',
                email: 'test@example.com'
            };

            chai.request(app)
                .post('/calc/residential?apartments=-5&floors=10') // Negative apartments
                .set('Authorization', 'mySecretKey123')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('must be non-negative');
                    done(err);
                });
        });

        it('should persist quote data to database', (done) => {
            const quoteData = {
                fullname: 'Persistence Test',
                email: 'persist@example.com'
            };

            chai.request(app)
                .post('/calc/residential?apartments=20&floors=5')
                .set('Authorization', 'mySecretKey123')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data).to.have.property('_id'); // Indicates database persistence
                    expect(res.body.data).to.have.property('createdAt');
                    done(err);
                });
        });
    });
});
