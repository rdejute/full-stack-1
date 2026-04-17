# Feature Specification: Unit Tests

**Feature Name:** Unit Tests for /status and /error Endpoints  
**Module:** Module 6 - Full Stack Development 1  
**Created:** Apr 13, 2026
**Version:** 1.0

---

## Table of Contents
1. [Feature Goal & Scope](#feature-goal--scope)
2. [Requirements Breakdown](#requirements-breakdown)
3. [User Flow](#user-flow)
4. [Interfaces Involved](#interfaces-involved)
5. [Data & Validations](#data--validations)
6. [Expected Behavior](#expected-behavior)
7. [Acceptance Criteria](#acceptance-criteria)
8. [Implementation Notes](#implementation-notes)

---

## Feature Goal & Scope

### Feature Goal
Write automated unit tests to verify that `/status` and `/error` endpoints work correctly and that the Response Utility formatting is applied consistently across responses.

### What's Included (In Scope)
✅ Unit tests for `/status` endpoint using Mocha, Chai, Sinon  
✅ Unit tests for `/error` endpoint using Mocha, Chai, Sinon  
✅ Test Response Utility behavior  
✅ Test HTTP status codes  
✅ Test response JSON structure  
✅ All tests pass with `npm run test`  
✅ Tests serve as reference for future test writing  

### What's Excluded (Out of Scope)
❌ Tests for contact form, agent table, quote calculator (not required)  
❌ Integration tests (testing through full stack)  
❌ End-to-end tests (testing through browser)  
❌ Performance/load testing  
❌ API documentation tests  

---

## Requirements Breakdown

### Testing Framework Setup

#### Dependencies Required
```json
{
  "devDependencies": {
    "mocha": "^10.x",
    "chai": "^4.x",
    "sinon": "^15.x"
  }
}
```

#### npm Script
**File:** `package.json`

```json
{
  "scripts": {
    "test": "mocha test/**/*.test.js"
  }
}
```

This allows running all tests with `npm run test`

### /status Endpoint (Reference Implementation)

#### Status Endpoint Code
**File:** `/src/routes/status.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { sendResponse } = require('../shared/utils/response-util');

router.get('/status', (req, res) => {
  return sendResponse(res, 200, 'Server is running', { status: 'ok' });
});

module.exports = router;
```

#### Status Controller
**File:** `/src/features/controllers/statusController.js`

```javascript
const { sendResponse } = require('../shared/utils/response-util');

function getStatus(req, res) {
  return sendResponse(res, 200, 'Server is running', { status: 'ok' });
}

module.exports = { getStatus };
```

### /error Endpoint (Reference Implementation)

#### Error Endpoint Code
**File:** `/src/routes/error.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { sendResponse } = require('../shared/utils/response-util');

router.get('/error', (req, res) => {
  return sendResponse(res, 500, 'This is a test error', null);
});

module.exports = router;
```

#### Error Controller
**File:** `/src/features/controllers/errorController.js`

```javascript
const { sendResponse } = require('../shared/utils/response-util');

function getError(req, res) {
  return sendResponse(res, 500, 'This is a test error', null);
}

module.exports = { getError };
```

---

### Unit Tests for /status

#### Test File
**File:** `/test/status.test.js`

```javascript
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../app'); // Import your Express app

describe('GET /status', () => {
  
  it('should return 200 status code', (done) => {
    request(app)
      .get('/status')
      .expect(200, done);
  });

  it('should return success: true', (done) => {
    request(app)
      .get('/status')
      .end((err, res) => {
        expect(res.body.success).to.be.true;
        done(err);
      });
  });

  it('should return message about server running', (done) => {
    request(app)
      .get('/status')
      .end((err, res) => {
        expect(res.body.message).to.include('running');
        done(err);
      });
  });

  it('should have data property with status: ok', (done) => {
    request(app)
      .get('/status')
      .end((err, res) => {
        expect(res.body.data).to.exist;
        expect(res.body.data.status).to.equal('ok');
        done(err);
      });
  });

  it('should use Response Utility format', (done) => {
    request(app)
      .get('/status')
      .end((err, res) => {
        expect(res.body).to.have.property('success');
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('data');
        done(err);
      });
  });

});
```

#### Test Breakdown

| Test | What It Validates | Pass Condition |
|------|---|---|
| returns 200 status | Endpoint responds with OK | Status code is 200 |
| returns success: true | Response shows success | success field is true |
| returns message | Response has human-readable message | message includes "running" |
| has data property | Response includes result data | data object exists with status: ok |
| uses Response Utility format | Response is consistent | Has success, message, data fields |

### Unit Tests for /error

#### Test File
**File:** `/test/error.test.js`

```javascript
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../app'); // Import your Express app

describe('GET /error', () => {
  
  it('should return 500 status code', (done) => {
    request(app)
      .get('/error')
      .expect(500, done);
  });

  it('should return success: false', (done) => {
    request(app)
      .get('/error')
      .end((err, res) => {
        expect(res.body.success).to.be.false;
        done(err);
      });
  });

  it('should return error message', (done) => {
    request(app)
      .get('/error')
      .end((err, res) => {
        expect(res.body.message).to.exist;
        expect(res.body.message).to.equal('This is a test error');
        done(err);
      });
  });

  it('should have data: null for error', (done) => {
    request(app)
      .get('/error')
      .end((err, res) => {
        expect(res.body.data).to.be.null;
        done(err);
      });
  });

  it('should use Response Utility format', (done) => {
    request(app)
      .get('/error')
      .end((err, res) => {
        expect(res.body).to.have.property('success');
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('data');
        done(err);
      });
  });

});
```

#### Test Breakdown

| Test | What It Validates | Pass Condition |
|------|---|---|
| returns 500 status | Endpoint responds with error | Status code is 500 |
| returns success: false | Response shows error | success field is false |
| returns error message | Response has error description | message equals expected text |
| has data: null | Error response has no data | data field is null |
| uses Response Utility format | Response is consistent | Has success, message, data fields |

---

### Response Utility Reference

#### Response Utility Code
**File:** `/src/shared/utils/response-util.js`

```javascript
/**
 * Sends a consistent JSON response to the client
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, 400, 500, etc.)
 * @param {string} message - Human-readable message
 * @param {any} data - Response data (can be null, object, or array)
 */
function sendResponse(res, statusCode, message, data) {
  return res.status(statusCode).json({
    success: statusCode < 400, // 200-399 = success, 400+ = failure
    message,
    data
  });
}

module.exports = { sendResponse };
```

#### Response Utility Behavior
- **Success Responses:** statusCode < 400 → success: true
  - 200 OK → success: true
  - 201 Created → success: true
  - 204 No Content → success: true
- **Error Responses:** statusCode >= 400 → success: false
  - 400 Bad Request → success: false
  - 404 Not Found → success: false
  - 500 Server Error → success: false

---

## User Flow

### Running Tests

1. Developer opens terminal
2. Developer types: `npm run test`
3. npm executes mocha script
4. Mocha loads all test files from `/test/**/*.test.js`
5. Mocha runs tests in parallel or sequence
6. Each test:
   - Sends HTTP request to endpoint
   - Receives response
   - Asserts expectations
   - Reports pass/fail
7. Test summary displays:
   - Total tests
   - Passed tests
   - Failed tests
   - Duration
8. Exit code 0 if all pass, 1 if any fail

### Test Execution Example

```bash
$ npm run test

  GET /status
    ✓ should return 200 status code
    ✓ should return success: true
    ✓ should return message about server running
    ✓ should have data property with status: ok
    ✓ should use Response Utility format

  GET /error
    ✓ should return 500 status code
    ✓ should return success: false
    ✓ should return error message
    ✓ should have data: null for error
    ✓ should use Response Utility format

  10 passing (145ms)
```

---

## Interfaces Involved

### 1. Testing Framework: Mocha
- **Role:** Test runner, structure
- **Usage:** Organizes tests with `describe()` and `it()`
- **Example:**
  ```javascript
  describe('GET /status', () => {
    it('should return 200', (done) => { ... });
  });
  ```

### 2. Assertion Library: Chai
- **Role:** Makes assertions/expectations
- **Usage:** `expect(value).to.equal(expected)`
- **Examples:**
  ```javascript
  expect(res.status).to.equal(200);
  expect(res.body.success).to.be.true;
  expect(res.body.message).to.exist;
  expect(res.body.data).to.be.null;
  ```

### 3. HTTP Test Library: Supertest
- **Role:** Makes HTTP requests to endpoints
- **Usage:** `request(app).get('/endpoint')`
- **Example:**
  ```javascript
  request(app)
    .get('/status')
    .expect(200)
    .end((err, res) => { ... });
  ```

### 4. Mocking Library: Sinon
- **Role:** Mock external calls, spies on functions
- **Usage:** For advanced tests (not required for /status and /error)
- **Example:**
  ```javascript
  const spy = sinon.spy(database, 'save');
  // ... do something
  expect(spy.called).to.be.true;
  ```

### 5. Express App Module
**File:** `/app.js`

Tests import the app to make requests against it:
```javascript
const app = require('../app');
```

This assumes `app.js` exports the Express application.

---

## Data & Validations

### /status Endpoint Response

**Request:**
```
GET /status
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "data": { "status": "ok" }
}
```

**Status Code:** 200

### /error Endpoint Response

**Request:**
```
GET /error
```

**Expected Response:**
```json
{
  "success": false,
  "message": "This is a test error",
  "data": null
}
```

**Status Code:** 500

### Response Utility Format

All API responses MUST follow this format:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": null|object|array
}
```

**Rules:**
- `success` is boolean: true if statusCode < 400, false if >= 400
- `message` is always a string describing the response
- `data` can be null, object, or array

---

## Expected Behavior

### Test Execution Flow

```
npm run test
    ↓
Mocha loads test files
    ↓
For each test:
    ├─ Set up any fixtures (if needed)
    ├─ Make HTTP request
    ├─ Receive response
    ├─ Run assertions
    ├─ Report result (pass/fail)
    └─ Tear down (if needed)
    ↓
Display summary
    ↓
Exit with code 0 (all pass) or 1 (some fail)
```

### Test Structure

```javascript
describe('Feature or Endpoint', () => {
  // Optional: beforeEach, afterEach hooks
  
  it('should do something', (done) => {
    // Arrange: Set up data
    // Act: Perform action (HTTP request)
    // Assert: Check expectations
    done(); // Callback tells mocha test is complete
  });
});
```

### Assertion Flow

```
Assertion (expect)
    ├─ If expectation met → Test passes ✓
    ├─ If expectation not met → Test fails ✗
    └─ Error message is descriptive
```

---

## Acceptance Criteria

### Test File Requirements

- [ ] `/test/status.test.js` exists
- [ ] `/test/error.test.js` exists
- [ ] Both files use Mocha, Chai, Supertest
- [ ] Tests follow consistent naming pattern
- [ ] Tests have clear descriptions of what they test

### /status Endpoint Tests
- [ ] Test 1: Returns 200 status code
- [ ] Test 2: Returns success: true
- [ ] Test 3: Returns appropriate message
- [ ] Test 4: Returns data object with status: ok
- [ ] Test 5: Response follows Response Utility format
- [ ] All 5 tests pass

### /error Endpoint Tests
- [ ] Test 1: Returns 500 status code
- [ ] Test 2: Returns success: false
- [ ] Test 3: Returns error message
- [ ] Test 4: Returns data: null
- [ ] Test 5: Response follows Response Utility format
- [ ] All 5 tests pass

### Test Quality
- [ ] Tests are independent (order doesn't matter)
- [ ] Tests use meaningful assertions
- [ ] Tests have clear naming (describe what they test)
- [ ] Tests don't have side effects
- [ ] Tests run quickly (< 1 second for all)

### npm test Command
- [ ] `npm run test` runs all tests
- [ ] All tests pass
- [ ] Output shows passing tests with ✓
- [ ] Exit code is 0
- [ ] Summary shows "X passing"

### Test Utilities
- [ ] Response Utility is imported correctly in tests
- [ ] Tests verify Response Utility format
- [ ] Tests verify success/failure behavior

---

## Implementation Notes

### Code References
- **Global AI Spec:** `/ai/ai-spec.md`
- **Mocha Documentation:** https://mochajs.org/
- **Chai Assertion Library:** https://www.chaijs.com/
- **Supertest:** https://github.com/visionmedia/supertest
- **Sinon:** https://sinonjs.org/

### Setup Steps

1. **Install dependencies:**
   ```bash
   npm install --save-dev mocha chai supertest sinon
   ```

2. **Create test directory:**
   ```bash
   mkdir test
   ```

3. **Create test files:**
   ```bash
   touch test/status.test.js
   touch test/error.test.js
   ```

4. **Add npm script to package.json:**
   ```json
   "test": "mocha test/**/*.test.js"
   ```

5. **Run tests:**
   ```bash
   npm run test
   ```

### Common Assertion Patterns

```javascript
// Equality
expect(value).to.equal(expected);
expect(value).to.not.equal(other);

// Boolean
expect(value).to.be.true;
expect(value).to.be.false;

// Type
expect(value).to.be.a('string');
expect(value).to.be.an('object');

// Existence
expect(value).to.exist;
expect(value).to.be.null;
expect(value).to.be.undefined;

// Array/Object
expect(array).to.include(item);
expect(object).to.have.property('key');
expect(object).to.have.all.keys('key1', 'key2');

// Strings
expect(string).to.include('substring');
expect(string).to.match(/regex/);
```

### Common Test Patterns

#### Testing HTTP Endpoint
```javascript
it('should return 200', (done) => {
  request(app)
    .get('/endpoint')
    .expect(200)
    .end((err, res) => {
      if (err) return done(err);
      expect(res.body.success).to.be.true;
      done();
    });
});
```

#### Testing Response Structure
```javascript
it('should have all required fields', (done) => {
  request(app)
    .get('/endpoint')
    .end((err, res) => {
      expect(res.body).to.have.all.keys('success', 'message', 'data');
      done(err);
    });
});
```

#### Testing With Query Parameters
```javascript
it('should accept query params', (done) => {
  request(app)
    .get('/endpoint?region=Montreal')
    .expect(200, done);
});
```

#### Testing With POST Body
```javascript
it('should accept POST data', (done) => {
  request(app)
    .post('/endpoint')
    .send({ name: 'John', email: 'john@example.com' })
    .expect(201, done);
});
```

### Debugging Tests

If a test fails:

1. **Read the error message carefully** - It tells you what assertion failed
2. **Add console.log** to see what values were received
3. **Run a single test** for focus:
   ```bash
   npx mocha test/status.test.js
   ```
4. **Check the endpoint** works in Postman first

### Key Decisions

1. **Mocha + Chai + Supertest:** Industry standard combination
2. **Test /status and /error:** Simpler endpoints for learning
3. **HTTP testing:** Use Supertest (not mocking)
4. **Response Utility validation:** Ensures consistency across endpoints

### Common Mistakes to Avoid

- ❌ Forgetting `done()` callback → Test hangs
- ❌ Not checking `err` in callback → Tests pass even on error
- ❌ Testing implementation details (how it works) instead of behavior (what it does)
- ❌ Writing tests that depend on other tests → Tests should be independent
- ❌ Not starting Express server for tests → Supertest handles this
- ❌ Hardcoding expected values → Tests break when valid values change

### Testing Best Practices

- **AAA Pattern:** Arrange, Act, Assert
  ```javascript
  it('should work', (done) => {
    // Arrange: Set up data
    const inputData = { ... };
    
    // Act: Perform action
    request(app)
      .post('/endpoint')
      .send(inputData)
      
      // Assert: Check result
      .end((err, res) => {
        expect(res.status).to.equal(201);
        done(err);
      });
  });
  ```

- **One assertion per test (ideally):** Makes it clear what broke
- **Descriptive test names:** "should return 200 status code" is better than "test 1"
- **Independent tests:** One failing test shouldn't cause others to fail
- **Fast tests:** Unit tests should run in milliseconds

---

**End of Unit Tests Feature Specification**

This feature is complete when both /status and /error endpoints have passing unit tests using Mocha, Chai, and Supertest, and all tests validate the Response Utility format.