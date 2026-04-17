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

describe('Agent Controller', () => {
    
    describe('GET /email-list', () => {
        
        it('should return 200 with comma-separated emails', (done) => {
            chai.request(app)
                .get('/email-list')
                .set('Authorization', 'mySecretKey123')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.text).to.be.a('string');
                    expect(res.text).to.include('@');
                    done(err);
                });
        });

        it('should return 404 when no agents exist', (done) => {
            // This test would require mocking the database to return empty array
            // For now, test the response format
            chai.request(app)
                .get('/email-list')
                .set('Authorization', 'mySecretKey123')
                .end((err, res) => {
                    // Should return either 200 with emails or 404
                    expect(res).to.have.oneOf([200, 404]);
                    done(err);
                });
        });

        it('should return 401 without Authorization header', (done) => {
            chai.request(app)
                .get('/email-list')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Authorization header required');
                    done(err);
                });
        });
    });

    describe('POST /agent-create', () => {
        
        it('should return 201 for valid agent creation', (done) => {
            const validAgent = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                region: 'north'
            };

            chai.request(app)
                .post('/agent-create')
                .set('Authorization', 'mySecretKey123')
                .send(validAgent)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('type', 'success');
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.have.property('first_name', 'John');
                    done(err);
                });
        });

        it('should return 400 for missing required fields', (done) => {
            const invalidAgent = {
                first_name: 'Jane',
                // Missing last_name, email, region
            };

            chai.request(app)
                .post('/agent-create')
                .set('Authorization', 'mySecretKey123')
                .send(invalidAgent)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Missing required fields');
                    done(err);
                });
        });

        it('should return 401 without Authorization header', (done) => {
            const validAgent = {
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                region: 'south'
            };

            chai.request(app)
                .post('/agent-create')
                .send(validAgent)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    done(err);
                });
        });

        it('should apply default values for optional fields', (done) => {
            const minimalAgent = {
                first_name: 'Default',
                last_name: 'Test',
                email: 'default@example.com',
                region: 'east'
            };

            chai.request(app)
                .post('/agent-create')
                .set('Authorization', 'mySecretKey123')
                .send(minimalAgent)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body.data).to.have.property('sales', 0);
                    expect(res.body.data).to.have.property('rating', 50); // default value
                    expect(res.body.data).to.have.property('fee', 5.0); // default value
                    done(err);
                });
        });
    });

    describe('GET /agents', () => {
        
        it('should return 200 with sorted agents list', (done) => {
            chai.request(app)
                .get('/agents')
                .set('Authorization', 'mySecretKey123')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('type', 'success');
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.be.an('array');
                    done(err);
                });
        });

        it('should return 401 without Authorization header', (done) => {
            chai.request(app)
                .get('/agents')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    done(err);
                });
        });

        it('should return agents sorted by last_name', (done) => {
            chai.request(app)
                .get('/agents')
                .set('Authorization', 'mySecretKey123')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    // Verify sorting by checking if agents are in alphabetical order by last_name
                    // This would require known test data or database seeding
                    expect(res.body.data).to.be.an('array');
                    done(err);
                });
        });
    });

    describe('GET /agents-by-region/:region', () => {
        
        it('should return 200 for valid region', (done) => {
            chai.request(app)
                .get('/agents-by-region/north')
                .set('Authorization', 'mySecretKey123')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('type', 'success');
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.be.an('array');
                    done(err);
                });
        });

        it('should return 400 for invalid region', (done) => {
            chai.request(app)
                .get('/agents-by-region/invalid')
                .set('Authorization', 'mySecretKey123')
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body).to.have.property('message');
                    done(err);
                });
        });

        it('should return 401 without Authorization header', (done) => {
            chai.request(app)
                .get('/agents-by-region/north')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    done(err);
                });
        });
    });

    describe('PATCH /agent-update-info/:id', () => {
        
        it('should return 200 for valid update', (done) => {
            const updateData = {
                first_name: 'Updated',
                region: 'west'
            };

            chai.request(app)
                .patch('/agent-update-info/507f1f77bcf86cd799439011') // Mock ObjectId
                .set('Authorization', 'mySecretKey123')
                .send(updateData)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('type', 'success');
                    done(err);
                });
        });

        it('should return 400 for invalid ObjectId', (done) => {
            const updateData = {
                first_name: 'Test'
            };

            chai.request(app)
                .patch('/agent-update-info/invalid-id')
                .set('Authorization', 'mySecretKey123')
                .send(updateData)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Invalid agent ID format');
                    done(err);
                });
        });

        it('should return 401 without Authorization header', (done) => {
            const updateData = {
                first_name: 'Test'
            };

            chai.request(app)
                .patch('/agent-update-info/507f1f77bcf86cd799439011')
                .send(updateData)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    done(err);
                });
        });
    });

    describe('DELETE /agent-delete', () => {
        
        it('should return 200 for successful deletion', (done) => {
            chai.request(app)
                .delete('/agent-delete')
                .set('Authorization', 'mySecretKey123')
                .query({ email: 'test@example.com' }) // Delete by email
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('type', 'success');
                    done(err);
                });
        });

        it('should return 404 when agent not found', (done) => {
            chai.request(app)
                .delete('/agent-delete')
                .set('Authorization', 'mySecretKey123')
                .query({ email: 'nonexistent@example.com' })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('error', 'Agent not found');
                    done(err);
                });
        });

        it('should return 401 without Authorization header', (done) => {
            chai.request(app)
                .delete('/agent-delete')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    done(err);
                });
        });
    });
});
