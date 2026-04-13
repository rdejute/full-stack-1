# Feature Specification: Unified Quote Calculator Endpoint

**Feature Name:** POST /calc/:buildingType - Unified Quote Calculator  
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
Consolidate the existing residential-only quote calculator into a unified endpoint that handles residential, commercial, and industrial building type calculations. Quotes are persisted to MongoDB and calculation logic is extracted into reusable utility functions.

### What's Included (In Scope)
✅ New POST `/calc/:buildingType` endpoint (replaces GET `/calc-residential`)  
✅ Calculation logic extracted to `/src/shared/resources/calculator.js`  
✅ Support for residential, commercial, industrial building types  
✅ Path parameter validation (building type)  
✅ Query parameters for building specifications (apartments, floors, occupancies, elevators)  
✅ Body parameters for customer info (fullname, email)  
✅ Quote persistence to MongoDB  
✅ Success/failure UX feedback  
✅ Postman endpoint testing for all 3 building types  

### What's Excluded (Out of Scope)
❌ Quote editing or deletion  
❌ Quote database queries for users  
❌ Payment processing  
❌ Multiple quote comparisons  
❌ Quote templates or customization  

---

## Requirements Breakdown

### Backend Requirements

#### Calculation Logic Extraction

**File:** `/src/shared/resources/calculator.js`

```javascript
/**
 * Calculate number of elevators needed for residential building
 * 
 * Formula: (apartments / 6) * occupancy_factor
 * where occupancy_factor = 1.5 if occupancy > 2000, else 1
 * 
 * @param {number} apartments - Number of apartments
 * @param {number} floors - Number of floors
 * @param {number} occupancy - Building occupancy
 * @returns {number} Number of elevators needed
 */
function calculateResidentialElevators(apartments, floors, occupancy) {
  const baseElevators = Math.ceil(apartments / 6);
  const occupancyFactor = occupancy > 2000 ? 1.5 : 1;
  return Math.ceil(baseElevators * occupancyFactor);
}

/**
 * Calculate number of elevators needed for commercial building
 * 
 * Formula: floors / 3
 * 
 * @param {number} floors - Number of floors
 * @param {number} occupancy - Building occupancy
 * @returns {number} Number of elevators needed
 */
function calculateCommercialElevators(floors, occupancy) {
  return Math.ceil(floors / 3);
}

/**
 * Calculate number of elevators needed for industrial building
 * 
 * Formula: occupancy / 500
 * 
 * @param {number} apartments - Not used for industrial
 * @param {number} floors - Not used for industrial
 * @param {number} occupancy - Building occupancy
 * @returns {number} Number of elevators needed
 */
function calculateIndustrialElevators(apartments, floors, occupancy) {
  return Math.ceil(occupancy / 500);
}

/**
 * Calculate estimated cost based on elevators and building type
 * 
 * @param {number} elevators - Number of elevators needed
 * @param {string} buildingType - Type of building
 * @returns {number} Estimated cost in dollars
 */
function calculateCost(elevators, buildingType) {
  // Cost per elevator varies by type
  const costs = {
    residential: 10000,
    commercial: 15000,
    industrial: 20000
  };

  const costPerElevator = costs[buildingType] || 10000;
  return elevators * costPerElevator;
}

module.exports = {
  calculateResidentialElevators,
  calculateCommercialElevators,
  calculateIndustrialElevators,
  calculateCost
};
```

#### Quote Schema (MongoDB)

**File:** `/src/shared/db/mongodb/schemas/quoteSchema.js`

```javascript
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
  // Building specifications (all optional, used as available)
  apartments: Number,
  floors: Number,
  occupancy: Number,
  elevators: Number,
  // Calculation results
  calculatedElevators: {
    type: Number,
    required: true
  },
  estimatedCost: {
    type: Number,
    required: true
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

module.exports = mongoose.model('Quote', quoteSchema);
```

#### Quote Controller

**File:** `/src/features/controllers/quoteController.js`

```javascript
const {
  calculateResidentialElevators,
  calculateCommercialElevators,
  calculateIndustrialElevators,
  calculateCost
} = require('../shared/resources/calculator');

const Quote = require('../shared/db/mongodb/schemas/quoteSchema');
const { sendResponse } = require('../shared/utils/response-util');

async function postQuote(req, res) {
  try {
    const { buildingType } = req.params;
    const { fullname, email, apartments, floors, occupancy, elevators } = req.body;

    // Determine elevators needed based on building type
    let calculatedElevators;

    if (buildingType === 'residential') {
      calculatedElevators = calculateResidentialElevators(apartments, floors, occupancy);
    } else if (buildingType === 'commercial') {
      calculatedElevators = calculateCommercialElevators(floors, occupancy);
    } else if (buildingType === 'industrial') {
      calculatedElevators = calculateIndustrialElevators(apartments, floors, occupancy);
    }

    // Calculate cost
    const estimatedCost = calculateCost(calculatedElevators, buildingType);

    // Create quote document
    const quoteData = {
      fullname,
      email,
      buildingType,
      apartments,
      floors,
      occupancy,
      elevators,
      calculatedElevators,
      estimatedCost
    };

    const quote = await Quote.create(quoteData);

    // Return success response
    return sendResponse(res, 201, 'Quote calculated and saved successfully', {
      ...quote.toObject(),
      calculatedElevators,
      estimatedCost
    });
  } catch (error) {
    console.error('Error calculating quote:', error.message);
    return sendResponse(res, 500, 'Failed to calculate quote', null);
  }
}

module.exports = { postQuote };
```

#### Quote Route

**File:** `/src/routes/quote.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { validateBuildingType } = require('../shared/middleware/buildingTypeValidator');
const quoteController = require('../features/controllers/quoteController');

// Validate building type, then calculate and save quote
router.post(
  '/calc/:buildingType',
  validateBuildingType,
  quoteController.postQuote
);

module.exports = router;
```

#### API Endpoint Specification

**Endpoint:** `POST /calc/:buildingType`

**Path Parameter:**
- `buildingType` - One of: `residential`, `commercial`, `industrial`

**Query Parameters:**
These are passed as query string parameters and depend on building type:
- `apartments` (residential only) - Number of apartments
- `floors` (residential, commercial) - Number of floors
- `occupancy` (all types) - Building occupancy level
- `elevators` (optional, all types) - Existing elevators (for reference)

**Body Parameters:**
```json
{
  "fullname": "John Doe",
  "email": "john@example.com"
}
```

**Request Examples:**

Residential:
```
POST /calc/residential?apartments=50&floors=10&occupancy=2500

Body:
{
  "fullname": "John Doe",
  "email": "john@example.com"
}
```

Commercial:
```
POST /calc/commercial?floors=15&occupancy=3000

Body:
{
  "fullname": "Jane Smith",
  "email": "jane@example.com"
}
```

Industrial:
```
POST /calc/industrial?occupancy=5000

Body:
{
  "fullname": "Bob Johnson",
  "email": "bob@example.com"
}
```

**Success Response (201):**

Residential:
```json
{
  "success": true,
  "message": "Quote calculated and saved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullname": "John Doe",
    "email": "john@example.com",
    "buildingType": "residential",
    "apartments": 50,
    "floors": 10,
    "occupancy": 2500,
    "elevators": null,
    "calculatedElevators": 9,
    "estimatedCost": 90000,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

Commercial:
```json
{
  "success": true,
  "message": "Quote calculated and saved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "fullname": "Jane Smith",
    "email": "jane@example.com",
    "buildingType": "commercial",
    "apartments": null,
    "floors": 15,
    "occupancy": 3000,
    "elevators": null,
    "calculatedElevators": 5,
    "estimatedCost": 75000,
    "createdAt": "2024-01-15T10:35:00Z",
    "updatedAt": "2024-01-15T10:35:00Z"
  }
}
```

Industrial:
```json
{
  "success": true,
  "message": "Quote calculated and saved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "fullname": "Bob Johnson",
    "email": "bob@example.com",
    "buildingType": "industrial",
    "apartments": null,
    "floors": null,
    "occupancy": 5000,
    "elevators": null,
    "calculatedElevators": 10,
    "estimatedCost": 200000,
    "createdAt": "2024-01-15T10:40:00Z",
    "updatedAt": "2024-01-15T10:40:00Z"
  }
}
```

**Error Response (400) - Invalid Building Type:**
```json
{
  "success": false,
  "message": "Invalid building type. Allowed types: residential, commercial, industrial",
  "data": null
}
```

**Error Response (500) - Server Error:**
```json
{
  "success": false,
  "message": "Failed to calculate quote",
  "data": null
}
```

---

### Frontend Requirements

#### Quote Form HTML (Residential Example)

**File:** `/src/public/residential.html`

```html
<h2>Request a Quote</h2>

<form id="residentialQuoteForm" class="quote-form">
  <input type="hidden" name="buildingType" value="residential">

  <label for="fullname">Full Name *</label>
  <input type="text" id="fullname" name="fullname" required>

  <label for="email">Email *</label>
  <input type="email" id="email" name="email" required>

  <label for="apartments">Number of Apartments *</label>
  <input type="number" id="apartments" name="apartments" required>

  <label for="floors">Number of Floors *</label>
  <input type="number" id="floors" name="floors" required>

  <label for="occupancy">Building Occupancy *</label>
  <input type="number" id="occupancy" name="occupancy" required>

  <button type="submit">Get Quote</button>
</form>

<div id="quoteResult"></div>
```

#### Quote Form JavaScript

**File:** `/src/public/assets/js/quote-form.js`

```javascript
// Handle all quote forms (residential, commercial, industrial)
document.querySelectorAll('.quote-form').forEach(form => {
  form.addEventListener('submit', handleQuoteSubmit);
});

async function handleQuoteSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const buildingType = formData.get('buildingType');

  // Build query parameters from form data
  const params = new URLSearchParams();
  params.append('apartments', formData.get('apartments') || '');
  params.append('floors', formData.get('floors') || '');
  params.append('occupancy', formData.get('occupancy') || '');

  // Body parameters
  const bodyData = {
    fullname: formData.get('fullname'),
    email: formData.get('email')
  };

  try {
    // Send POST request to /calc/:buildingType?params
    const response = await fetch(`/calc/${buildingType}?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    const result = await response.json();

    if (response.ok) {
      // Success
      const { calculatedElevators, estimatedCost } = result.data;
      showQuoteResult(
        true,
        `Your quote has been calculated!`,
        `Elevators needed: ${calculatedElevators}\nEstimated cost: $${estimatedCost.toLocaleString()}`
      );
    } else {
      // Error
      showQuoteResult(false, 'Error', `Error: ${result.message}`);
    }
  } catch (error) {
    showQuoteResult(false, 'Error', 'Unable to calculate quote');
  }
}

function showQuoteResult(success, title, message) {
  const resultDiv = document.getElementById('quoteResult');
  resultDiv.className = success ? 'success' : 'error';
  resultDiv.innerHTML = `<h3>${title}</h3><p>${message}</p>`;
  resultDiv.style.display = 'block';
}
```

---

## User Flow

### Residential Building Quote

1. User navigates to `/residential.html`
2. User sees quote form with fields:
   - Full Name
   - Email
   - Number of Apartments
   - Number of Floors
   - Building Occupancy
3. User fills in form:
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Apartments: 50
   - Floors: 10
   - Occupancy: 2500
4. User clicks "Get Quote" button
5. JavaScript collects form data
6. JavaScript constructs URL: `/calc/residential?apartments=50&floors=10&occupancy=2500`
7. JavaScript sends POST request with body: `{ fullname: "John Doe", email: "john@example.com" }`
8. Backend Building Type Validator checks buildingType = "residential" ✓
9. Backend Controller receives request
10. Controller calls `calculateResidentialElevators(50, 10, 2500)`
11. Calculator computes: (50/6) * 1.5 = 12.5, rounded up = 13 elevators
12. Controller calls `calculateCost(13, 'residential')`
13. Calculator computes: 13 * $10,000 = $130,000
14. Controller creates Quote document with all data
15. MongoDB saves quote
16. Controller returns 201 response with calculated results
17. Frontend receives success response
18. Frontend displays: "Elevators needed: 13, Estimated cost: $130,000"
19. User sees results

### Commercial Building Quote

1. User navigates to `/commercial.html`
2. User sees quote form with fields:
   - Full Name
   - Email
   - Number of Floors
   - Building Occupancy
3. User fills in form:
   - Full Name: "Jane Smith"
   - Email: "jane@example.com"
   - Floors: 15
   - Occupancy: 3000
4. User clicks "Get Quote" button
5. JavaScript sends POST to `/calc/commercial?floors=15&occupancy=3000`
6. Backend Validator checks buildingType = "commercial" ✓
7. Controller calls `calculateCommercialElevators(15, 3000)`
8. Calculator computes: 15/3 = 5 elevators
9. Controller calls `calculateCost(5, 'commercial')`
10. Calculator computes: 5 * $15,000 = $75,000
11. Quote saved to MongoDB
12. Frontend displays: "Elevators needed: 5, Estimated cost: $75,000"

### Industrial Building Quote

1. Similar flow as above but with industrial-specific parameters
2. POST to `/calc/industrial?occupancy=5000`
3. Calculation: 5000/500 = 10 elevators
4. Cost: 10 * $20,000 = $200,000

### Error Scenario: Invalid Building Type

1. User somehow sends request to `/calc/office`
2. Building Type Validator checks "office" is valid
3. "office" is not in ['residential', 'commercial', 'industrial']
4. Validator returns 400: "Invalid building type"
5. Controller is NOT called
6. Database is NOT affected
7. Frontend receives error
8. Frontend displays error message

---

## Interfaces Involved

### 1. Calculation Logic Module
**File:** `/src/shared/resources/calculator.js`

Pure functions that take inputs and return calculated values. No database access, no side effects.

```javascript
calculateResidentialElevators(apartments, floors, occupancy) → elevators
calculateCommercialElevators(floors, occupancy) → elevators
calculateIndustrialElevators(apartments, floors, occupancy) → elevators
calculateCost(elevators, buildingType) → cost
```

### 2. Quote Controller
**File:** `/src/features/controllers/quoteController.js`

- Receives request with path params (buildingType) and body params (fullname, email)
- Calls appropriate calculator function
- Creates Quote document
- Saves to MongoDB
- Returns Response Utility formatted response

### 3. Quote Route
**File:** `/src/routes/quote.routes.js`

```javascript
POST /calc/:buildingType
```

Applies Building Type Validator middleware, then calls controller.

### 4. Quote Schema
**File:** `/src/shared/db/mongodb/schemas/quoteSchema.js`

Defines structure of quote documents in MongoDB.

### 5. Frontend Quote Forms
**Files:** `/src/public/residential.html`, `/src/public/commercial.html`, `/src/public/industrial.html`

Each has a form with fields appropriate to building type.

### 6. Frontend Quote JavaScript
**File:** `/src/public/assets/js/quote-form.js`

Handles form submission, constructs API request, displays results.

---

## Data & Validations

### Path Parameter Validation

**Building Type:**
- Required: Yes
- Valid Values: `residential`, `commercial`, `industrial` (case-sensitive)
- Validated By: Building Type Validator Middleware
- On Invalid: 400 "Invalid building type"

### Query Parameters

| Param | Building Types | Required | Type | Example |
|-------|---|---|---|---|
| apartments | residential | Yes | number | 50 |
| floors | residential, commercial | Yes | number | 10 |
| occupancy | all | Yes | number | 2500 |
| elevators | all | No | number | 2 |

### Body Parameters

| Field | Type | Required | Example |
|-------|------|----------|---------|
| fullname | string | Yes | "John Doe" |
| email | string | Yes | "john@example.com" |

### Calculation Formulas

**Residential:**
```
elevators = ceil((apartments / 6) * occupancyFactor)
where occupancyFactor = 1.5 if occupancy > 2000 else 1
```

Examples:
- 50 apartments, occupancy 2500 → (50/6) * 1.5 = 12.5 → 13 elevators
- 30 apartments, occupancy 1500 → (30/6) * 1 = 5 → 5 elevators

**Commercial:**
```
elevators = ceil(floors / 3)
```

Examples:
- 15 floors → 15/3 = 5 elevators
- 16 floors → 16/3 = 5.33 → 6 elevators

**Industrial:**
```
elevators = ceil(occupancy / 500)
```

Examples:
- 5000 occupancy → 5000/500 = 10 elevators
- 5100 occupancy → 5100/500 = 10.2 → 11 elevators

**Cost Calculation:**
```
cost = elevators * costPerElevator
where costPerElevator = 10000 (residential), 15000 (commercial), 20000 (industrial)
```

Examples:
- 13 elevators residential → 13 * 10000 = $130,000
- 5 elevators commercial → 5 * 15000 = $75,000
- 10 elevators industrial → 10 * 20000 = $200,000

---

## Expected Behavior

### Request Processing

1. **Path Validation:** Building type validated first (middleware)
2. **Query Parsing:** Query parameters extracted from URL
3. **Body Parsing:** JSON body parsed (fullname, email)
4. **Calculation:** Appropriate calculation function called
5. **Cost Calculation:** Cost calculated based on result
6. **Database Save:** Quote document created and saved
7. **Response:** Results returned in Response Utility format

### Calculation Logic

- Calculation functions are **pure** (no side effects)
- Calculation functions can be tested in isolation
- Calculations are **deterministic** (same inputs = same output)
- Calculation results are **included in response**
- Calculation results are **saved in database**

### Data Persistence

- Quote document includes all input parameters
- Quote document includes calculated results
- Quote document includes timestamps
- Quotes can be queried later for follow-up

### Error Handling

- Invalid building type caught by middleware (400)
- Database errors caught in controller (500)
- All errors use Response Utility format
- Errors logged to console for debugging

---

## Acceptance Criteria

### Calculation Logic Tests
- [ ] `calculateResidentialElevators(50, 10, 2500)` returns 13
- [ ] `calculateResidentialElevators(30, 8, 1500)` returns 5
- [ ] `calculateCommercialElevators(15, 3000)` returns 5
- [ ] `calculateCommercialElevators(16, 3000)` returns 6
- [ ] `calculateIndustrialElevators(0, 0, 5000)` returns 10
- [ ] `calculateIndustrialElevators(0, 0, 5100)` returns 11
- [ ] `calculateCost(13, 'residential')` returns 130000
- [ ] `calculateCost(5, 'commercial')` returns 75000
- [ ] `calculateCost(10, 'industrial')` returns 200000

### Backend API Tests - Residential
- [ ] POST `/calc/residential?apartments=50&floors=10&occupancy=2500` returns 201
- [ ] Response includes `calculatedElevators: 13`
- [ ] Response includes `estimatedCost: 130000`
- [ ] Quote saved to MongoDB with all data

### Backend API Tests - Commercial
- [ ] POST `/calc/commercial?floors=15&occupancy=3000` returns 201
- [ ] Response includes `calculatedElevators: 5`
- [ ] Response includes `estimatedCost: 75000`

### Backend API Tests - Industrial
- [ ] POST `/calc/industrial?occupancy=5000` returns 201
- [ ] Response includes `calculatedElevators: 10`
- [ ] Response includes `estimatedCost: 200000`

### Validation Tests
- [ ] POST `/calc/office` returns 400 (invalid building type)
- [ ] POST `/calc/residential` with no parameters returns calculation error
- [ ] POST `/calc/residential` with invalid building type returns 400

### Frontend Tests
- [ ] Residential form submits and receives quote
- [ ] Commercial form submits and receives quote
- [ ] Industrial form submits and receives quote
- [ ] Success message displays with elevators and cost
- [ ] Error message displays on failure

### Integration Tests
- [ ] Can submit residential quote end-to-end
- [ ] Can submit commercial quote end-to-end
- [ ] Can submit industrial quote end-to-end
- [ ] Data in MongoDB matches submitted quote
- [ ] Calculated values match expected formulas

### Postman Tests
- [ ] POST /calc/residential with all parameters returns 201
- [ ] POST /calc/commercial with all parameters returns 201
- [ ] POST /calc/industrial with all parameters returns 201
- [ ] POST /calc/invalid returns 400
- [ ] Response includes all calculated data

---

## Implementation Notes

### Code References
- **Global AI Spec:** `/ai/ai-spec.md`
- **Middleware Feature:** `/ai/features/middleware.feature.md` (building type validator)
- **Response Utility:** `/src/shared/utils/response-util.js`
- **Calculator Module:** `/src/shared/resources/calculator.js`

### Key Architecture Decisions

1. **Calculation Logic in Resources:** Separated from controllers for testability
2. **Three Validators (Email, Phone, Region, Building Type):** Protects API
3. **Unified Endpoint:** One endpoint handles all building types via path parameter
4. **Query vs Body Parameters:** Flexible parameters in query, fixed user info in body
5. **Database Persistence:** All quotes saved for later analysis

### Common Mistakes to Avoid
- ❌ Calculation logic inline in controller
- ❌ Inconsistent response format
- ❌ Validation after controller runs
- ❌ Not persisting calculation results
- ❌ Hardcoding cost values (should be in config)
- ❌ Not handling edge cases (missing parameters, invalid types)

### Testing Strategy
1. Test calculations in isolation (unit tests)
2. Test API with Postman (all 3 building types)
3. Test frontend forms (all 3 buildings)
4. Test error scenarios (invalid building type)
5. Verify data in MongoDB (ensure persistence)

---

**End of Quote Calculator Feature Specification**

This feature is complete when all calculation logic is extracted to resources/calculator.js, all endpoints work for all 3 building types, and quotes persist to MongoDB.