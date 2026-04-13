# Feature Specification: Validation Middleware

**Feature Name:** Input Validation Middleware  
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
Create reusable validation middleware to protect all API endpoints from invalid or malicious input. Bad data is rejected at the middleware layer before reaching controllers and the database.

### What's Included (In Scope)
✅ Email Validator Middleware (validate email format)  
✅ Phone Validator Middleware (validate phone format)  
✅ Region Validator Middleware (validate agent region parameter)  
✅ Building Type Validator Middleware (validate building type parameter)  
✅ Applied to appropriate routes
✅ Consistent error responses
✅ Uses validator.js library

### What's Excluded (Out of Scope)
❌ Password validation  
❌ Rate limiting  
❌ CORS validation  
❌ Authentication/authorization  
❌ SQL injection prevention (not applicable with MongoDB)  

---

## Requirements Breakdown

### 4 Required Validators

#### 1. Email Validator Middleware
**File:** `/src/shared/middleware/emailValidator.js`

**Purpose:** Validate email format on contact form submission

**Applied To:** `POST /contact-us`

**Validation Logic:**
```javascript
function validateEmail(req, res, next) {
  const { email } = req.body;

  // Email must exist
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
      data: null
    });
  }

  // Email must be valid format (using validator.isEmail())
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
      data: null
    });
  }

  // Valid - proceed to next middleware
  next();
}
```

**Valid Examples:**
- john@example.com
- user+tag@example.co.uk
- first.last@company.org

**Invalid Examples:**
- john@ (incomplete)
- @example.com (no local part)
- john example@domain.com (space in local)
- john@domain (no TLD)

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid email format",
  "data": null
}
```

---

#### 2. Phone Validator Middleware
**File:** `/src/shared/middleware/phoneValidator.js`

**Purpose:** Validate phone number format on contact form submission

**Applied To:** `POST /contact-us`

**Validation Logic:**
```javascript
function validatePhone(req, res, next) {
  const { phone } = req.body;

  // Phone must exist
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone is required',
      data: null
    });
  }

  // Phone must be valid format (using validator.isMobilePhone())
  if (!validator.isMobilePhone(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number',
      data: null
    });
  }

  // Valid - proceed to next middleware
  next();
}
```

**Valid Examples:**
- +1-234-567-8901 (with country code)
- (555) 555-5555 (formatted)
- 5555555555 (digits only)
- +1 555 555 5555 (spaces)

**Invalid Examples:**
- 123 (too short)
- 555 (too short)
- abc-def-ghij (letters instead of digits)
- (incomplete) (missing digits)

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid phone number",
  "data": null
}
```

---

#### 3. Region Validator Middleware
**File:** `/src/shared/middleware/regionValidator.js`

**Purpose:** Validate region parameter when querying agents by region

**Applied To:** `GET /agents-by-region/:region`

**Validation Logic:**
```javascript
function validateRegion(req, res, next) {
  const { region } = req.params;
  
  // Allowed regions
  const allowedRegions = ['Montreal', 'Toronto', 'Vancouver', 'Calgary', 'Ottawa'];

  // Region must exist
  if (!region) {
    return res.status(400).json({
      success: false,
      message: 'Region is required',
      data: null
    });
  }

  // Region must be in allowed list
  if (!allowedRegions.includes(region)) {
    return res.status(400).json({
      success: false,
      message: `Invalid region. Allowed regions: ${allowedRegions.join(', ')}`,
      data: null
    });
  }

  // Valid - proceed to next middleware
  next();
}
```

**Valid Regions (Case-Sensitive):**
- Montreal
- Toronto
- Vancouver
- Calgary
- Ottawa

**Invalid Examples:**
- montreal (lowercase - rejected due to case sensitivity)
- New York (not in allowed list)
- (empty - missing parameter)

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid region. Allowed regions: Montreal, Toronto, Vancouver, Calgary, Ottawa",
  "data": null
}
```

---

#### 4. Building Type Validator Middleware
**File:** `/src/shared/middleware/buildingTypeValidator.js`

**Purpose:** Validate building type path parameter on quote calculator endpoint

**Applied To:** `POST /calc/:buildingType`

**Validation Logic:**
```javascript
function validateBuildingType(req, res, next) {
  const { buildingType } = req.params;

  // Allowed building types
  const allowedTypes = ['residential', 'commercial', 'industrial'];

  // Building type must exist
  if (!buildingType) {
    return res.status(400).json({
      success: false,
      message: 'Building type is required',
      data: null
    });
  }

  // Building type must be in allowed list
  if (!allowedTypes.includes(buildingType.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Invalid building type. Allowed types: ${allowedTypes.join(', ')}`,
      data: null
    });
  }

  // Valid - proceed to next middleware
  next();
}
```

**Valid Building Types (Case-Insensitive):**
- residential
- commercial
- industrial

**Invalid Examples:**
- Residential (uppercase - rejected or normalized)
- office (not in allowed list)
- (empty - missing parameter)
- apt (abbreviated, not allowed)

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid building type. Allowed types: residential, commercial, industrial",
  "data": null
}
```

---

### Middleware Application

#### Contact Form Route
**File:** `/src/routes/contact.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { emailValidator } = require('../shared/middleware/emailValidator');
const { phoneValidator } = require('../shared/middleware/phoneValidator');
const contactController = require('../features/controllers/contactController');

// Validation happens in this order:
// 1. Email validator
// 2. Phone validator
// 3. Controller (if both pass)
router.post(
  '/contact-us',
  emailValidator,
  phoneValidator,
  contactController.postContact
);

module.exports = router;
```

#### Agent Table Route
**File:** `/src/routes/agent.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { regionValidator } = require('../shared/middleware/regionValidator');
const agentController = require('../features/controllers/agentController');

// Validation happens before controller
router.get(
  '/agents-by-region/:region',
  regionValidator,
  agentController.getAgentsByRegion
);

module.exports = router;
```

#### Quote Calculator Route
**File:** `/src/routes/quote.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { buildingTypeValidator } = require('../shared/middleware/buildingTypeValidator');
const quoteController = require('../features/controllers/quoteController');

// Validation happens before controller
router.post(
  '/calc/:buildingType',
  buildingTypeValidator,
  quoteController.postQuote
);

module.exports = router;
```

---

## User Flow

### Email Validator Flow

```
POST /contact-us with { email: "john@example.com" }
    ↓
Email Validator Middleware
    ├─ Email exists? Yes ✓
    ├─ Email is valid format? Yes ✓
    └─ Pass to next middleware
        ↓
    [Phone Validator Middleware]
        ↓
    [Contact Controller]
        ↓
    201 Response with saved contact
```

### Email Validator Error Flow

```
POST /contact-us with { email: "notanemail" }
    ↓
Email Validator Middleware
    ├─ Email exists? Yes ✓
    ├─ Email is valid format? No ✗
    └─ Return 400 "Invalid email format"
        ↓
    [Request stops here - no further processing]
        ↓
    400 Response: Invalid email format
```

### Region Validator Flow

```
GET /agents-by-region/Montreal
    ↓
Region Validator Middleware
    ├─ Region exists? Yes ✓
    ├─ Region in allowed list? Yes ✓
    └─ Pass to next middleware
        ↓
    [Agent Controller]
        ↓
    200 Response with agents from Montreal region
```

### Region Validator Error Flow

```
GET /agents-by-region/NewYork
    ↓
Region Validator Middleware
    ├─ Region exists? Yes ✓
    ├─ Region in allowed list? No ✗
    └─ Return 400 "Invalid region"
        ↓
    [Request stops here - no further processing]
        ↓
    400 Response: Invalid region. Allowed regions: ...
```

---

## Interfaces Involved

### 1. Validator Middleware Pattern

All validators follow this pattern:

```javascript
// File: /src/shared/middleware/[validatorName].js

const validator = require('validator');

function validateField(req, res, next) {
  // 1. Extract field from request
  const { fieldName } = req.body; // or req.params for path parameters

  // 2. Check if field exists (required fields)
  if (!fieldName) {
    return res.status(400).json({
      success: false,
      message: 'Field is required',
      data: null
    });
  }

  // 3. Validate using validator library or custom logic
  if (!validator.isValidFormat(fieldName)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid field format',
      data: null
    });
  }

  // 4. Pass to next middleware if valid
  next();
}

module.exports = { validateField };
```

### 2. Route Integration

```javascript
// File: /src/routes/routeName.routes.js

const express = require('express');
const router = express.Router();
const { validator1, validator2 } = require('../shared/middleware/validators');
const controller = require('../features/controllers/controller');

// Validators run in order before controller
router.post('/endpoint', validator1, validator2, controller.method);

module.exports = router;
```

### 3. Response Format

All validators return Response Utility format:

```javascript
{
  "success": false,
  "message": "Descriptive error message",
  "data": null
}
```

---

## Data & Validations

### Email Validation Rules

| Rule | Tool | Check |
|------|------|-------|
| Required | Manual | Email field exists |
| Format | validator.isEmail() | Valid email structure |
| Lowercase | Mongoose Schema | Auto-converted in schema |
| Trimmed | Mongoose Schema | Auto-trimmed in schema |

**Validator.js isEmail() Details:**
- Requires @ symbol
- Requires local part before @
- Requires domain after @
- Domain must have valid structure
- Supports most common formats

### Phone Validation Rules

| Rule | Tool | Check |
|------|------|-------|
| Required | Manual | Phone field exists |
| Format | validator.isMobilePhone() | Valid phone structure |
| Length | validator.isMobilePhone() | Minimum length check |

**Validator.js isMobilePhone() Details:**
- Validates mobile phone numbers
- Supports various formats: +1-234-567-8901, (555) 555-5555, etc.
- Can specify locale (default: 'any')
- Returns true for valid mobile numbers

### Region Validation Rules

| Rule | Check |
|------|-------|
| Required | Region parameter exists |
| Whitelist | Region is in allowed list |
| Case-Sensitive | Exact match required |

**Allowed Regions:**
1. Montreal
2. Toronto
3. Vancouver
4. Calgary
5. Ottawa

### Building Type Validation Rules

| Rule | Check |
|------|-------|
| Required | Building type parameter exists |
| Whitelist | Building type in allowed list |
| Case-Insensitive | Normalized before check (optional) |

**Allowed Building Types:**
1. residential
2. commercial
3. industrial

---

## Expected Behavior

### When Validation Passes
1. Middleware extracts data from request
2. Middleware validates data
3. Data is valid
4. Middleware calls `next()` to pass control to next middleware/controller
5. Controller receives request and processes normally
6. Response is returned to client

### When Validation Fails
1. Middleware extracts data from request
2. Middleware validates data
3. Data is invalid
4. Middleware returns error response immediately using Response Utility format
5. Request stops - controller is NOT called
6. Database is NOT affected
7. Client receives 400 status with error message

### Error Handling
- All validators use same response format (Response Utility)
- All validators return 400 (Bad Request) status
- All error messages are clear and actionable
- Multiple validators can chain together
- If first validator fails, request stops (doesn't check remaining validators)

### Order of Execution

```
Request arrives
    ↓
First Middleware (e.g., emailValidator)
    ├─ Fails? → Return error immediately
    └─ Passes? → Call next()
        ↓
    Second Middleware (e.g., phoneValidator)
        ├─ Fails? → Return error immediately
        └─ Passes? → Call next()
            ↓
        Controller
            ├─ Error? → Return 500
            └─ Success? → Return 201/200
```

---

## Acceptance Criteria

### Email Validator Tests
- [ ] Rejects empty email
- [ ] Rejects invalid email format (no @)
- [ ] Rejects invalid email format (no domain)
- [ ] Accepts valid email formats
- [ ] Returns 400 status on invalid
- [ ] Returns error message "Invalid email format"
- [ ] Uses validator.isEmail() library
- [ ] Passes control to next middleware on valid

### Phone Validator Tests
- [ ] Rejects empty phone
- [ ] Rejects short phone (e.g., "123")
- [ ] Rejects invalid format (e.g., "abc-def-ghij")
- [ ] Accepts valid phone formats with country code
- [ ] Accepts valid phone formats without country code
- [ ] Accepts formatted phone (with parentheses/dashes)
- [ ] Returns 400 status on invalid
- [ ] Returns error message "Invalid phone number"
- [ ] Uses validator.isMobilePhone() library
- [ ] Passes control to next middleware on valid

### Region Validator Tests
- [ ] Rejects empty region
- [ ] Rejects region not in allowed list
- [ ] Rejects lowercase region (case-sensitive)
- [ ] Accepts "Montreal"
- [ ] Accepts "Toronto"
- [ ] Accepts "Vancouver"
- [ ] Accepts "Calgary"
- [ ] Accepts "Ottawa"
- [ ] Returns 400 status on invalid
- [ ] Returns error message with allowed regions list
- [ ] Passes control to next middleware on valid

### Building Type Validator Tests
- [ ] Rejects empty building type
- [ ] Rejects building type not in allowed list
- [ ] Accepts "residential"
- [ ] Accepts "commercial"
- [ ] Accepts "industrial"
- [ ] Returns 400 status on invalid
- [ ] Returns error message with allowed types list
- [ ] Passes control to next middleware on valid

### Integration Tests
- [ ] Email validator correctly positioned in `/contact-us` route
- [ ] Phone validator correctly positioned in `/contact-us` route
- [ ] Both validators run in order on `/contact-us`
- [ ] Region validator correctly positioned in `/agents-by-region/:region` route
- [ ] Building type validator correctly positioned in `/calc/:buildingType` route
- [ ] All validators use Response Utility format
- [ ] All validators return 400 on failure
- [ ] All validators call next() on success

### Postman Tests
- [ ] POST /contact-us with invalid email returns 400
- [ ] POST /contact-us with invalid phone returns 400
- [ ] GET /agents-by-region/NewYork returns 400
- [ ] GET /agents-by-region/Montreal returns 200
- [ ] POST /calc/office returns 400
- [ ] POST /calc/residential returns 201

---

## Implementation Notes

### Code References
- **Global AI Spec:** `/ai/ai-spec.md` (patterns and conventions)
- **Validator.js Docs:** https://github.com/validatorjs/validator.js
- **Express Middleware:** https://expressjs.com/en/guide/using-middleware.html
- **Response Utility:** `/src/shared/utils/response-util.js`

### Installation
```bash
npm install validator
```

### Import Pattern
```javascript
const validator = require('validator');

// Usage
validator.isEmail('test@example.com'); // true
validator.isMobilePhone('+1-234-567-8901'); // true
```

### Key Decisions
1. **Validator.js Library:** Industry standard for input validation
2. **Middleware Pattern:** Validation happens before business logic
3. **Order Matters:** Email validator before phone validator (convention)
4. **Response Utility:** All error responses consistent
5. **Case Sensitivity:** Region/building type respect casing for explicit validation

### Common Mistakes to Avoid
- ❌ Validating inside controller (should be middleware)
- ❌ Not using validator library (regex is fragile)
- ❌ Inconsistent error messages
- ❌ Not returning 400 status
- ❌ Not calling next() on valid data
- ❌ Validating after controller runs

### Testing Strategy
1. Test each validator in isolation (Postman)
2. Test validators in chain (POST /contact-us)
3. Test both valid and invalid inputs
4. Test error messages
5. Test that controller IS called on valid data
6. Test that controller IS NOT called on invalid data

---

**End of Validation Middleware Feature Specification**

This feature is complete when all 4 validators are implemented, tested, and integrated into their respective routes.