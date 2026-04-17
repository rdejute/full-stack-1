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

describe('Validation Middleware Tests', () => {
    
    describe('Contact Form Validation', () => {
        
        it('should reject contact submission with missing required fields', (done) => {
            const incompleteContact = {
                fullname: 'Test User',
                email: 'test@example.com'
                // Missing phone, company_name, project_name, department, project_desc, message
            };

            chai.request(app)
                .post('/contact-us')
                .set('Authorization', 'mySecretKey123')
                .send(incompleteContact)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('Missing required fields');
                    done(err);
                });
        });

        it('should reject contact submission with invalid email format', (done) => {
            const invalidContact = {
                fullname: 'Test User',
                email: 'invalid-email',
                phone: '5145551234',
                company_name: 'Test Corp',
                project_name: 'Test Project',
                department: 'Sales',
                project_desc: 'Test description',
                message: 'Test message'
            };

            chai.request(app)
                .post('/contact-us')
                .set('Authorization', 'mySecretKey123')
                .send(invalidContact)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('Invalid email format');
                    done(err);
                });
        });

        it('should reject contact submission with invalid phone number', (done) => {
            const invalidContact = {
                fullname: 'Test User',
                email: 'test@example.com',
                phone: '123', // Invalid phone number
                company_name: 'Test Corp',
                project_name: 'Test Project',
                department: 'Sales',
                project_desc: 'Test description',
                message: 'Test message'
            };

            chai.request(app)
                .post('/contact-us')
                .set('Authorization', 'mySecretKey123')
                .send(invalidContact)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('Invalid phone number');
                    done(err);
                });
        });

        it('should accept valid contact submission', (done) => {
            const validContact = {
                fullname: 'Valid User',
                email: 'valid@example.com',
                phone: '5145551234',
                company_name: 'Valid Corp',
                project_name: 'Valid Project',
                department: 'Sales',
                project_desc: 'Valid description',
                message: 'Valid message'
            };

            chai.request(app)
                .post('/contact-us')
                .set('Authorization', 'mySecretKey123')
                .send(validContact)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('type', 'success');
                    done(err);
                });
        });
    });

    describe('Agent Creation Validation', () => {
        
        it('should reject agent creation with missing required fields', (done) => {
            const incompleteAgent = {
                first_name: 'John',
                // Missing last_name, email, region
            };

            chai.request(app)
                .post('/agent-create')
                .set('Authorization', 'mySecretKey123')
                .send(incompleteAgent)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('Missing required fields');
                    done(err);
                });
        });

        it('should reject agent creation with invalid email format', (done) => {
            const invalidAgent = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'invalid-email',
                region: 'north'
            };

            chai.request(app)
                .post('/agent-create')
                .set('Authorization', 'mySecretKey123')
                .send(invalidAgent)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('Invalid email format');
                    done(err);
                });
        });

        it('should reject agent creation with invalid region', (done) => {
            const invalidAgent = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                region: 'invalid-region'
            };

            chai.request(app)
                .post('/agent-create')
                .set('Authorization', 'mySecretKey123')
                .send(invalidAgent)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('Invalid region');
                    done(err);
                });
        });

        it('should accept valid agent creation', (done) => {
            const validAgent = {
                first_name: 'Jane',
                last_name: 'Smith',
                email: 'jane@example.com',
                region: 'north'
            };

            chai.request(app)
                .post('/agent-create')
                .set('Authorization', 'mySecretKey123')
                .send(validAgent)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('type', 'success');
                    done(err);
                });
        });
    });

    describe('Agent Update Validation', () => {
        
        it('should reject agent update with invalid ObjectId', (done) => {
            const updateData = {
                first_name: 'Updated'
            };

            chai.request(app)
                .patch('/agent-update-info/invalid-id')
                .set('Authorization', 'mySecretKey123')
                .send(updateData)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('Invalid agent ID format');
                    done(err);
                });
        });

        it('should reject agent update with no fields provided', (done) => {
            chai.request(app)
                .patch('/agent-update-info/507f1f77bcf86cd799439011')
                .set('Authorization', 'mySecretKey123')
                .send({})
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('At least one field must be provided');
                    done(err);
                });
        });

        it('should reject agent update with invalid rating', (done) => {
            const updateData = {
                rating: 150 // Invalid rating > 100
            };

            chai.request(app)
                .patch('/agent-update-info/507f1f77bcf86cd799439011')
                .set('Authorization', 'mySecretKey123')
                .send(updateData)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('Rating must be a number between 0 and 100');
                    done(err);
                });
        });
    });

    describe('Quote Calculation Validation', () => {
        
        it('should reject residential quote with missing parameters', (done) => {
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
                    expect(res.body.message).to.include('apartments and floors are required');
                    done(err);
                });
        });

        it('should reject commercial quote with negative parameters', (done) => {
            const quoteData = {
                fullname: 'Test User',
                email: 'test@example.com'
            };

            chai.request(app)
                .post('/calc/commercial?floors=-5&occupancy=100') // Negative floors
                .set('Authorization', 'mySecretKey123')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('must be a non-negative integer');
                    done(err);
                });
        });

        it('should reject industrial quote with invalid contact email', (done) => {
            const quoteData = {
                fullname: 'Test User',
                email: 'invalid-email'
            };

            chai.request(app)
                .post('/calc/industrial?elevators=3')
                .set('Authorization', 'mySecretKey123')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body.message).to.include('Invalid email format');
                    done(err);
                });
        });

        it('should accept valid residential quote', (done) => {
            const quoteData = {
                fullname: 'Valid User',
                email: 'valid@example.com'
            };

            chai.request(app)
                .post('/calc/residential?apartments=50&floors=10')
                .set('Authorization', 'mySecretKey123')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('type', 'success');
                    done(err);
                });
        });

        it('should accept valid commercial quote', (done) => {
            const quoteData = {
                fullname: 'Valid User',
                email: 'valid@example.com'
            };

            chai.request(app)
                .post('/calc/commercial?floors=5&occupancy=100')
                .set('Authorization', 'mySecretKey123')
                .send(quoteData)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('type', 'success');
                    done(err);
                });
        });
    });

    describe('Response Utility Format Validation', () => {
        
        it('should return Response Utility error format for validation failures', (done) => {
            const invalidContact = {
                fullname: 'Test User',
                email: 'invalid-email'
                // Missing other required fields
            };

            chai.request(app)
                .post('/contact-us')
                .set('Authorization', 'mySecretKey123')
                .send(invalidContact)
                .end((err, res) => {
                    expect(res.body).to.have.property('type', 'error');
                    expect(res.body).to.have.property('data', null);
                    expect(res.body).to.have.property('message');
                    done(err);
                });
        });

        it('should return Response Utility success format for valid requests', (done) => {
            const validAgent = {
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                region: 'north'
            };

            chai.request(app)
                .post('/agent-create')
                .set('Authorization', 'mySecretKey123')
                .send(validAgent)
                .end((err, res) => {
                    expect(res.body).to.have.property('type', 'success');
                    expect(res.body).to.have.property('data');
                    expect(res.body).to.have.property('message');
                    done(err);
                });
        });
    });
});
