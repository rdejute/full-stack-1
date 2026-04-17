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

describe('Contact Controller', () => {
    
    describe('POST /contact-us', () => {
        
        it('should return 201 status code for valid contact submission', (done) => {
            const validContact = {
                fullname: 'John Doe',
                email: 'john@example.com',
                phone: '5145551234',
                company_name: 'Acme Corp',
                project_name: 'Test Project',
                department: 'Sales',
                project_desc: 'Test project description',
                message: 'Test message'
            };

            chai.request(app)
                .post('/contact-us')
                .set('Authorization', 'mySecretKey123')
                .send(validContact)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    done(err);
                });
        });

        it('should return Response Utility success format', (done) => {
            const validContact = {
                fullname: 'Jane Smith',
                email: 'jane@example.com',
                phone: '5145555678',
                company_name: 'Test Company',
                project_name: 'Demo Project',
                department: 'Marketing',
                project_desc: 'Demo description',
                message: 'Demo message'
            };

            chai.request(app)
                .post('/contact-us')
                .set('Authorization', 'mySecretKey123')
                .send(validContact)
                .end((err, res) => {
                    expect(res.body).to.have.property('type', 'success');
                    expect(res.body).to.have.property('data');
                    expect(res.body).to.have.property('message');
                    expect(res.body.data).to.have.property('_id');
                    done(err);
                });
        });

        it('should return 400 for missing required fields', (done) => {
            const invalidContact = {
                fullname: 'Test User',
                email: 'test@example.com'
                // Missing phone, company_name, project_name, department, project_desc, message
            };

            chai.request(app)
                .post('/contact-us')
                .set('Authorization', 'mySecretKey123')
                .send(invalidContact)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('success', false);
                    expect(res.body).to.have.property('message');
                    done(err);
                });
        });

        it('should return 401 without Authorization header', (done) => {
            const validContact = {
                fullname: 'Test User',
                email: 'test@example.com',
                phone: '5145551234',
                company_name: 'Test Corp',
                project_name: 'Test Project',
                department: 'Sales',
                project_desc: 'Test description',
                message: 'Test message'
            };

            chai.request(app)
                .post('/contact-us')
                .send(validContact)
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error', 'Authorization header required');
                    done(err);
                });
        });

        it('should return 403 with invalid Authorization header', (done) => {
            const validContact = {
                fullname: 'Test User',
                email: 'test@example.com',
                phone: '5145551234',
                company_name: 'Test Corp',
                project_name: 'Test Project',
                department: 'Sales',
                project_desc: 'Test description',
                message: 'Test message'
            };

            chai.request(app)
                .post('/contact-us')
                .set('Authorization', 'invalidToken')
                .send(validContact)
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    expect(res.body).to.have.property('error', 'Access Forbidden');
                    done(err);
                });
        });

        it('should persist contact data to database', (done) => {
            const validContact = {
                fullname: 'Persistence Test',
                email: 'persist@example.com',
                phone: '5145559999',
                company_name: 'Persistence Corp',
                project_name: 'Persistence Project',
                department: 'Testing',
                project_desc: 'Testing persistence functionality',
                message: 'Testing message'
            };

            chai.request(app)
                .post('/contact-us')
                .set('Authorization', 'mySecretKey123')
                .send(validContact)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body.data).to.have.property('fullname', 'Persistence Test');
                    expect(res.body.data).to.have.property('email', 'persist@example.com');
                    expect(res.body.data).to.have.property('createdAt');
                    done(err);
                });
        });

        it('should handle file field gracefully', (done) => {
            const contactWithFile = {
                fullname: 'File Test User',
                email: 'file@example.com',
                phone: '5145551234',
                company_name: 'File Test Corp',
                project_name: 'File Test Project',
                department: 'Testing',
                project_desc: 'Testing file handling',
                message: 'Testing file field',
                file: 'test.txt'
            };

            chai.request(app)
                .post('/contact-us')
                .set('Authorization', 'mySecretKey123')
                .send(contactWithFile)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body.data).to.have.property('file', null);
                    done(err);
                });
        });
    });
});
