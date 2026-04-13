# AI Specification Document – Module 6 Full Stack Development

**Project:** Rocket Elevators Full-Stack Application (Module 6)  
**Organization:** Genesis Solutions  
**Role:** Junior Developer  
**Created:** Apr 13, 2026  
**Version:** 1.0

---

## Table of Contents
1. [Project Identity & Scope](#project-identity--scope)
2. [Architecture Overview](#architecture-overview)
3. [Repository Structure](#repository-structure)
4. [Technology Stack & Constraints](#technology-stack--constraints)
5. [Coding Standards & Conventions](#coding-standards--conventions)
6. [Database Schemas](#database-schemas)
7. [API Patterns](#api-patterns)
8. [Global Definition of Done](#global-definition-of-done)
9. [Cross-Feature Rules](#cross-feature-rules)

---

## Project Identity & Scope

### What We're Building
A full-stack web application that connects the Rocket Elevators frontend website with a production-ready backend API and MongoDB database. This is the first module where all layers (frontend → API → database) work together as a single, integrated system.

### What's Included (In Scope)
✅ Contact form submission with data persistence  
✅ Live agent data table (from MongoDB, not dummy data)  
✅ Unified quote calculator for all building types  
✅ Input validation middleware (email, phone, region, building type)  
✅ Unit tests for core endpoints  
✅ Full data flow documentation  
✅ Postman collection for API testing  

### What's Excluded (Out of Scope)
❌ User authentication/login (not required this module)  
❌ Payment processing  
❌ Email notifications  
❌ File upload handling (Contact form file field can be null)  
❌ React components (vanilla JavaScript only)  
❌ Database transactions or complex relationships  

### Client Expectations
Rocket Elevators expects:
- **Functional features** – All features must work end-to-end
- **Validated data** – Bad input is rejected at the API layer
- **Persistent data** – Information is saved to MongoDB
- **Production-ready code** – Clean, tested, documented

---

## Architecture Overview

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                       │
│  - HTML/CSS for UI                                         │
│  - Vanilla JavaScript (no frameworks)                       │
│  - Makes HTTP requests to API                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Express.js / Node.js)             │
│  - Route handlers                                          │
│  - Middleware (validation, logging, etc.)                   │
│  - Controllers (business logic)                             │
│  - Utility functions (calculations, response formatting)   │
└──────────────────────┬──────────────────────────────────────┘
                       │ Mongoose ODM
                       ▼
┌─────────────────────────────────────────────────────────────┐
│             DATABASE (MongoDB via Mongoose)                 │
│  - Collections: contacts, agents, quotes                    │
│  - Schemas define structure and validation                  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Pattern

All features follow this proven pattern:

```
User Input (Frontend)
    ↓
HTTP Request to API
    ↓
Validation Middleware (reject bad data)
    ↓
Route Handler
    ↓
Controller Logic
    ↓
Utility Functions (calculations, transformations)
    ↓
MongoDB Operation (save/query)
    ↓
Format Response (using Response Utility)
    ↓
HTTP Response (JSON)
    ↓
Frontend Updates UI
```

### Why This Matters
- **Validation first:** Bad data never reaches the database
- **Separation of concerns:** Each layer has one job
- **Testable:** Utility functions can be tested in isolation
- **Maintainable:** Clear, predictable flow

---

## Repository Structure

```
project-name/
│
├── ai/                                    # AI Specifications (READ FIRST)
│   ├── ai-spec.md                        # This document
│   └── features/
│       ├── contact-form.feature.md
│       ├── middleware.feature.md
│       ├── agent-table.feature.md
│       ├── get-calc.feature.md
│       └── unit-test.feature.md
│
├── src/
│   ├── features/
│   │   └── controllers/                  # Handle HTTP requests
│   │       ├── contactController.js
│   │       ├── agentController.js
│   │       ├── quoteController.js
│   │       ├── statusController.js
│   │       └── errorController.js
│   │
│   ├── public/                           # Frontend (HTML/CSS/JS)
│   │   ├── index.html                   # Homepage with contact form
│   │   ├── residential.html              # Residential page with agent table
│   │   ├── commercial.html               # Commercial page with quote form
│   │   ├── industrial.html               # Industrial page with quote form
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   │   └── style.css
│   │   │   └── js/
│   │   │       ├── contact-form.js      # Contact form handler
│   │   │       ├── agent-table.js       # Agent table handler
│   │   │       └── quote-form.js        # Quote form handler
│   │   ├── manifest.json
│   │   └── favicon.ico
│   │
│   ├── routes/
│   │   ├── contact.routes.js             # Contact form routes
│   │   ├── agent.routes.js               # Agent routes
│   │   ├── quote.routes.js               # Quote calculator routes
│   │   ├── status.routes.js              # Status/health routes
│   │   └── error.routes.js               # Error handling routes
│   │
│   └── shared/
│       ├── db/
│       │   └── mongodb/
│       │       ├── conn.js               # MongoDB connection
│       │       └── schemas/
│       │           ├── contactSchema.js
│       │           ├── agentSchema.js
│       │           └── quoteSchema.js
│       │
│       ├── middleware/
│       │   ├── validation/
│       │   │   ├── emailValidator.js    # Email validation
│       │   │   ├── phoneValidator.js    # Phone validation
│       │   │   ├── regionValidator.js   # Region validation
│       │   │   └── buildingTypeValidator.js  # Building type validation
│       │   └── middleware.js
│       │
│       ├── resources/
│       │   └── calculator.js             # Calculation logic (residential, commercial, industrial)
│       │
│       └── utils/
│           ├── response-util.js          # Response formatting
│           └── base-util.js              # Async wrapper
│
├── test/
│   ├── status.test.js                   # Unit tests for /status
│   ├── error.test.js                    # Unit tests for /error
│   └── hello.test.js                    # Reference test (study this)
│
├── LeetCode-Challenges/
│   ├── sleep.png
│   ├── add-two-promises.png
│   ├── promise-time-limit.png
│   ├── design-hashmap.png
│   └── design-hashset.png
│
├── app.js                                # Main Express app
├── package.json                          # Dependencies & scripts
├── .env                                  # Environment variables
├── .gitignore                            # Git ignore rules
├── README.md                             # Project documentation
├── CONCEPTS.md                           # 3 challenging concepts
├── PostmanCollection.json                # API testing collection
└── submission-summary.md                 # Submission info (NOT in GitHub)
```

### Why This Structure?
- **`ai/` first:** AI must read specifications before any code is implemented
- **Separated concerns:** Middleware, controllers, schemas are distinct
- **`shared/` for reusable code:** Database, utilities, middleware used across features
- **`resources/` for logic:** Calculation logic lives here, not in controllers
- **`utils/` for patterns:** Response formatting is centralized

---

## Technology Stack & Constraints

### Required Technologies
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Backend** | Node.js | v14+ | JavaScript runtime |
| **Backend** | Express.js | v4+ | Web framework & routing |
| **Frontend** | Vanilla JavaScript | ES6+ | DOM manipulation, form handling |
| **Database** | MongoDB | Community | NoSQL database |
| **Database** | Mongoose | v5+ | MongoDB ODM & schema validation |
| **Testing** | Mocha | v10+ | Test framework |
| **Testing** | Chai | v4+ | Assertion library |
| **Testing** | Sinon | v15+ | Mocking/stubbing library |
| **Validation** | Validator.js | Latest | Email/phone validation |

### Constraints & Rules

#### ❌ Do NOT Use
- React, Vue, or any frontend frameworks (vanilla JavaScript only)
- TypeScript (plain JavaScript)
- Async/await for routes (use .then() or wrap with utility)
- Inline validation in controllers (must be middleware)
- Inline calculation logic (must be in `/resources/calculator.js`)
- File uploads for contact form (file field is optional, can be null)
- Database transactions

#### ✅ DO Use
- Express middleware for validation
- Mongoose schemas for data validation
- Response Utility for consistent API responses
- Utility functions for calculations
- Promise-based Mongoose operations
- Environment variables for configuration

---

## Coding Standards & Conventions

### Naming Conventions

#### Variables & Functions
```javascript
// ✅ Correct: camelCase
const fullName = "John Doe";
const emailAddress = "john@example.com";
function validateEmail(email) { }
function calculateResidentialElevators(apartments) { }

// ❌ Wrong: PascalCase for variables
const FullName = "John Doe";
const EmailAddress = "john@example.com";
```

#### Classes & Schemas
```javascript
// ✅ Correct: PascalCase
class ContactController { }
const contactSchema = new mongoose.Schema(...);

// ❌ Wrong: camelCase
class contactController { }
```

#### Filenames
```javascript
// ✅ Correct: descriptive, lowercase, hyphenated
contactController.js
emailValidator.js
contact-form.js
response-util.js

// ❌ Wrong: unclear names
contact.js
email.js
form.js
util.js
```

#### Constants
```javascript
// ✅ Correct: UPPER_SNAKE_CASE
const RATING_GREEN = 100;
const RATING_BLUE_MIN = 90;
const API_TIMEOUT = 5000;

// ❌ Wrong: camelCase
const ratingGreen = 100;
const apiTimeout = 5000;
```

### Code Style

#### Spacing & Indentation
```javascript
// ✅ Correct: 2-space indentation, consistent spacing
function validateEmail(email) {
  const trimmed = email.trim();
  if (!trimmed.includes('@')) {
    return false;
  }
  return true;
}

// ❌ Wrong: inconsistent indentation
function validateEmail(email) {
const trimmed = email.trim();
    if (!trimmed.includes('@')) {
      return false;
    }
return true;
}
```

#### Comments
```javascript
// ✅ Correct: JSDoc for functions, explanations for why
/**
 * Validates email format using the validator library
 * @param {string} email - The email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 */
function validateEmail(email) {
  // Using validator library for robust email validation
  return validator.isEmail(email);
}

// ❌ Wrong: obvious comments, no JSDoc
// validate email
function validateEmail(email) {
  // check if email
  if (validator.isEmail(email)) {
    return true; // it's valid
  }
  return false; // it's not valid
}
```

#### Error Handling
```javascript
// ✅ Correct: meaningful error messages
try {
  const result = await Contact.create(contactData);
  res.json({ success: true, data: result });
} catch (error) {
  console.error('Failed to save contact:', error.message);
  res.status(500).json({ success: false, message: 'Error saving contact' });
}

// ❌ Wrong: silent failures, vague errors
try {
  const result = await Contact.create(contactData);
  res.json({ success: true, data: result });
} catch (error) {
  res.status(500).json({ error: 'error' });
}
```

### Commit Message Conventions

All commits MUST follow this pattern:

```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

#### Types
- `feat` – New feature (e.g., `feat: add contact form validation`)
- `fix` – Bug fix (e.g., `fix: correct email validation logic`)
- `docs` – Documentation (e.g., `docs: update README with setup instructions`)
- `test` – Tests (e.g., `test: add unit tests for status endpoint`)
- `refactor` – Code refactoring (e.g., `refactor: extract calculation logic to util`)
- `chore` – Build, dependencies, tooling (e.g., `chore: install validator package`)
- `debug` – Debugging or investigation (e.g., `debug: investigate MongoDB connection issue`)

#### Examples
```
feat(contact-form): implement POST /contact-us endpoint
fix(email-validator): handle edge case in email validation
docs(api): add endpoint documentation to README
test(unit): add unit tests for /status route
refactor(calculator): extract calculation logic to resources/calculator.js
chore(git): set up branching structure
```

### Code Organization Rules

#### Controllers
```javascript
// ✅ Correct: Thin controllers, logic in utilities/services
const { validateEmail, validatePhone } = require('../shared/middleware/validators');
const { saveContact } = require('../shared/utils/contact-util');
const { sendResponse } = require('../shared/utils/response-util');

async function postContact(req, res) {
  try {
    const contact = await saveContact(req.body);
    return sendResponse(res, 201, 'Contact saved successfully', contact);
  } catch (error) {
    return sendResponse(res, 500, 'Failed to save contact', null);
  }
}

// ❌ Wrong: Fat controllers with all logic
async function postContact(req, res) {
  try {
    const { email, phone, fullname, message } = req.body;
    
    // Validation inline
    if (!validator.isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    if (!validator.isMobilePhone(phone)) return res.status(400).json({ error: 'Invalid phone' });
    
    // Database logic inline
    const contact = new Contact({ email, phone, fullname, message });
    await contact.save();
    
    // Response formatting inline
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

#### Utilities/Resources
```javascript
// ✅ Correct: Pure functions that can be tested in isolation
// resources/calculator.js
function calculateResidentialElevators(apartments, floors, occupancy) {
  const baseElevators = Math.ceil(apartments / 6);
  const occupancyFactor = occupancy > 2000 ? 1.5 : 1;
  return Math.ceil(baseElevators * occupancyFactor);
}

function calculateCommercialElevators(floors, occupancy) {
  return Math.ceil(floors / 3);
}

module.exports = { calculateResidentialElevators, calculateCommercialElevators };

// ❌ Wrong: Logic embedded in controller
async function postQuote(req, res) {
  const { apartments, floors, occupancy, buildingType } = req.body;
  
  let elevators;
  if (buildingType === 'residential') {
    elevators = Math.ceil(apartments / 6); // Calculation inline
  } else if (buildingType === 'commercial') {
    elevators = Math.ceil(floors / 3); // Calculation inline
  }
  
  await Quote.create({ ...req.body, elevators });
  res.json({ elevators });
}
```

#### Middleware
```javascript
// ✅ Correct: Middleware validates and passes to next()
const { validateEmail } = require('../shared/middleware/emailValidator');

router.post('/contact-us', validateEmail, contactController.postContact);

// emailValidator.js
function validateEmail(req, res, next) {
  const { email } = req.body;
  
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }
  
  next(); // Pass to next middleware/controller
}

// ❌ Wrong: Validation in controller
router.post('/contact-us', contactController.postContact);

async function postContact(req, res) {
  if (!req.body.email || !validator.isEmail(req.body.email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  // ... rest of logic
}
```

---

## Database Schemas

### Contact Schema

```javascript
// src/shared/db/mongodb/schemas/contactSchema.js
const contactSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    trim: true
  },
  project_name: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  project_description: {
    type: String
  },
  message: {
    type: String
  },
  file: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contact', contactSchema);
```

### Agent Schema

```javascript
// src/shared/db/mongodb/schemas/agentSchema.js
const agentSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  fee: {
    type: Number,
    required: true
  },
  region: {
    type: String,
    required: true,
    enum: ['Montreal', 'Toronto', 'Vancouver', 'Calgary', 'Ottawa']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Agent', agentSchema);
```

### Quote Schema

```javascript
// src/shared/db/mongodb/schemas/quoteSchema.js
const quoteSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  buildingType: {
    type: String,
    required: true,
    enum: ['residential', 'commercial', 'industrial']
  },
  // Residential parameters
  apartments: Number,
  floors: Number,
  occupancy: Number,
  elevators: Number,
  // Calculation result
  calculatedElevators: Number,
  estimatedCost: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quote', quoteSchema);
```

---

## API Patterns

### Response Utility Format

All API responses MUST use this consistent format:

```javascript
// ✅ Correct: Using Response Utility
const { sendResponse } = require('../shared/utils/response-util');

// Success response
sendResponse(res, 200, 'Operation successful', { id: 123, name: 'John' });

// Error response
sendResponse(res, 400, 'Validation failed', null);

// Response format returned:
{
  "success": true/false,
  "message": "Human-readable message",
  "data": { /* optional data */ }
}

// ❌ Wrong: Inconsistent response formats
res.json({ id: 123, name: 'John' });
res.status(400).json({ error: 'Validation failed' });
res.json({ success: true, data: { ... } });
```

### Endpoint Categories

#### 1. Form Submission Endpoints
- **Purpose:** Accept form data, validate, save to database
- **Method:** POST
- **Validation:** Middleware before controller
- **Response:** Use Response Utility
- **Example:** `POST /contact-us`

```javascript
// Request body
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890"
}

// Response
{
  "success": true,
  "message": "Contact saved successfully",
  "data": { "_id": "...", "fullname": "John Doe", ... }
}
```

#### 2. Data Retrieval Endpoints
- **Purpose:** Query database and return filtered/sorted data
- **Method:** GET
- **Parameters:** Can be query params or path params
- **Validation:** Validate path/query parameters
- **Response:** Array or single object
- **Example:** `GET /agents-by-region/:region?sort=name`

#### 3. Calculation Endpoints
- **Purpose:** Perform calculations and save results
- **Method:** POST
- **Path Params:** Building type
- **Query Params:** Calculation parameters
- **Body Params:** User info (name, email)
- **Logic Location:** `/resources/calculator.js`
- **Example:** `POST /calc/:buildingType?apartments=50&floors=10`

#### 4. Health/Status Endpoints
- **Purpose:** Check API health
- **Method:** GET
- **Validation:** None
- **Response:** Simple status message
- **Example:** `GET /status`, `GET /error`

---

## Global Definition of Done

A feature is **complete** when:

### Code Quality
- [ ] Code follows naming conventions (camelCase, PascalCase)
- [ ] No console.log() in production code
- [ ] Functions have JSDoc comments
- [ ] No code duplication (DRY principle)
- [ ] Error messages are meaningful

### Architecture
- [ ] Validation is middleware, not inline
- [ ] Calculation logic is in `/resources/`, not in controllers
- [ ] Controllers are thin (delegate to utilities)
- [ ] All responses use Response Utility
- [ ] Database queries use Mongoose schemas

### Testing
- [ ] Code compiles and runs without errors
- [ ] Tested in Postman (valid and invalid data)
- [ ] Tested in browser (UI works as expected)
- [ ] All validators tested

### Documentation
- [ ] Code has meaningful comments
- [ ] Feature specification is completed
- [ ] API endpoint documented in README
- [ ] Postman collection updated

### Git
- [ ] Changes committed with proper message (feat/fix/test)
- [ ] Commit message explains WHAT and WHY
- [ ] Changes pushed to feature branch
- [ ] Ready for merge to `dev`

---

## Cross-Feature Rules

### Rule 1: All Validation is Middleware
- **What:** Every endpoint that accepts user input must validate BEFORE reaching the controller
- **How:** Create middleware functions in `/src/shared/middleware/`
- **Apply:** Use middleware in route definition: `router.post('/route', middleware, controller)`
- **Don't:** Validate inside controller function

### Rule 2: Calculation Logic Lives in Resources
- **What:** Any calculations (elevators, costs, etc.) go in `/src/shared/resources/`
- **How:** Create pure functions that take inputs, return results
- **Use:** Import and call from controller
- **Don't:** Put calculations inline in controllers

### Rule 3: Consistent Response Format
- **What:** Every API response uses Response Utility
- **Format:** `{ success: boolean, message: string, data: any }`
- **How:** Import and call `sendResponse(res, statusCode, message, data)`
- **Don't:** Return different formats from different endpoints

### Rule 4: Meaningful Error Messages
- **What:** Users/graders can understand why an error occurred
- **Examples:**
  - ✅ "Invalid email format"
  - ❌ "Error"
  - ✅ "Agent not found in region"
  - ❌ "Query failed"

### Rule 5: Database Queries Use Mongoose
- **What:** All MongoDB operations go through Mongoose models
- **How:** Define schemas, create models, use async methods
- **Don't:** Use raw MongoDB client
- **Don't:** Use synchronous operations

### Rule 6: No Direct Commits to Main
- **What:** Work always flows: feature branch → dev → main
- **How:** Commit to feature/*, merge to dev when done, merge dev to main for submission
- **Don't:** Commit directly to main
- **Don't:** Merge feature branch directly to main

### Rule 7: Environment Variables for Configuration
- **What:** Never hardcode sensitive info (connection strings, API keys, etc.)
- **How:** Use `.env` file, access via `process.env`
- **Example:** `process.env.MONGODB_URI`, `process.env.PORT`
- **Don't:** Commit `.env` file to GitHub

### Rule 8: Async/Await or Promise .then()
- **What:** Use consistent async patterns
- **How:** Use async/await OR .then(), not mixed
- **Route handlers:** Prefer async/await for readability
- **Don't:** Use callbacks (promise-based)

---

## How to Use This Document

1. **Read this document FIRST** before implementing any feature
2. **Review the feature specification** for the feature you're building (`/ai/features/*.feature.md`)
3. **Follow the patterns** outlined here (naming, structure, validation, responses)
4. **Reference this document** when unsure about conventions
5. **Update this document** if you discover better practices or clarifications needed

---

**End of AI Specification Document**

This specification is the source of truth for the project. All code decisions should align with these standards.
