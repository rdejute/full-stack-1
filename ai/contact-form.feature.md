# Feature Specification: Contact Form

**Feature Name:** Contact Form Submission with Persistence  
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
Enable visitors to the Rocket Elevators website to submit contact information through a form on the homepage. All submitted information must be validated for correctness and saved to MongoDB for lead follow-up.

### What's Included (In Scope)
✅ Contact form on homepage (`index.html`)  
✅ Form accepts 9 fields: fullname, email, phone, company_name, project_name, department, project_desc, message, file  
✅ Validation middleware for email and phone  
✅ MongoDB schema for contact submissions  
✅ POST `/contact-us` API endpoint  
✅ Data persistence to MongoDB  
✅ Success/failure UX feedback (toast/alert)  
✅ Postman endpoint testing  

### What's Excluded (Out of Scope)
❌ Email notifications to Rocket Elevators staff  
❌ File upload processing (file field can be null)  
❌ Duplicate detection or duplicate prevention  
❌ Contact form archival or deletion  
❌ Admin dashboard for reviewing contacts  

---

## Requirements Breakdown

### Frontend Requirements

#### 1. Contact Form HTML
- [ ] Form located on `/src/public/index.html`
- [ ] Form has `id="contactForm"` for JavaScript targeting
- [ ] Form contains input fields:
  - [ ] Full Name (text input, required)
  - [ ] Email (email input, required)
  - [ ] Phone (tel input, required)
  - [ ] Company Name (text input)
  - [ ] Project Name (text input)
  - [ ] Department (text input or select)
  - [ ] Project Description (textarea)
  - [ ] Message (textarea)
  - [ ] File Attachment (file input, optional)
  - [ ] Submit Button
- [ ] Form uses standard HTML5 input types
- [ ] Form has no action/method attributes (handled by JavaScript)

#### 2. Contact Form JavaScript
- [ ] JavaScript file: `/src/public/assets/js/contact-form.js`
- [ ] Listen for form submission event
- [ ] Collect all form field values into object:
  ```javascript
  {
    fullname: "",
    email: "",
    phone: "",
    company_name: "",
    project_name: "",
    department: "",
    project_desc: "",
    message: "",
    file: null
  }
  ```
- [ ] Create POST request to `/contact-us` endpoint
- [ ] Send data as JSON in request body
- [ ] Handle success response:
  - [ ] Show success message (toast, alert, or modal)
  - [ ] Clear form fields
  - [ ] Display message: "Thank you! Your submission has been received."
- [ ] Handle error response:
  - [ ] Show error message with server response
  - [ ] Display message: "Error: [server message]"
  - [ ] Keep form data (don't clear)

#### 3. Form Behavior
- [ ] Form prevents default submission
- [ ] Submit button shows loading state during POST (optional but nice)
- [ ] Form is usable on desktop and mobile
- [ ] All required fields are marked visually (*)

---

### Backend Requirements

#### 1. Contact Schema (MongoDB)
**File:** `/src/shared/db/mongodb/schemas/contactSchema.js`

```javascript
{
  fullname: String (required, trimmed),
  email: String (required, lowercase, trimmed),
  phone: String (required),
  company_name: String (trimmed),
  project_name: String (trimmed),
  department: String (trimmed),
  project_desc: String,
  message: String,
  file: String or null (default: null),
  createdAt: Date (auto-set to now),
  updatedAt: Date (auto-set to now)
}
```

#### 2. Validation Middleware

**Email Validator**
- **File:** `/src/shared/middleware/emailValidator.js`
- **What it validates:** Email field format
- **Tool:** validator.js library
- **Validation rules:**
  - Must not be empty
  - Must contain @ symbol
  - Must have valid email format (use validator.isEmail())
- **On invalid:** Return 400 status with message "Invalid email format"
- **On valid:** Pass to next middleware/controller

**Phone Validator**
- **File:** `/src/shared/middleware/phoneValidator.js`
- **What it validates:** Phone field format
- **Tool:** validator.js library
- **Validation rules:**
  - Must not be empty
  - Must be valid phone number format (use validator.isMobilePhone())
- **On invalid:** Return 400 status with message "Invalid phone number"
- **On valid:** Pass to next middleware/controller

#### 3. Contact Controller
**File:** `/src/features/controllers/contactController.js`

- [ ] Function: `postContact(req, res)`
- [ ] Receive form data from request body
- [ ] Create new Contact document from data
- [ ] Save to MongoDB using Mongoose
- [ ] On success:
  - [ ] Return 201 status code
  - [ ] Use Response Utility to format response
  - [ ] Include saved contact data
- [ ] On error:
  - [ ] Return 500 status code
  - [ ] Log error to console
  - [ ] Use Response Utility to format response

#### 4. Contact Route
**File:** `/src/routes/contact.routes.js`

```javascript
router.post(
  '/contact-us',
  emailValidator,        // Validate email first
  phoneValidator,        // Validate phone second
  contactController.postContact  // Then save to database
);
```

#### 5. API Endpoint
- **Route:** `POST /contact-us`
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "fullname": "John Doe",
    "email": "john@example.com",
    "phone": "+1-234-567-8901",
    "company_name": "Genesis Solutions",
    "project_name": "Elevator Modernization",
    "department": "Engineering",
    "project_desc": "We need to upgrade our elevators",
    "message": "Please contact us ASAP",
    "file": null
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "Contact submitted successfully",
    "data": {
      "_id": "507f1f77bcf86cd799439011",
      "fullname": "John Doe",
      "email": "john@example.com",
      "phone": "+1-234-567-8901",
      "company_name": "Genesis Solutions",
      "project_name": "Elevator Modernization",
      "department": "Engineering",
      "project_desc": "We need to upgrade our elevators",
      "message": "Please contact us ASAP",
      "file": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
  ```
- **Validation Error (400):**
  ```json
  {
    "success": false,
    "message": "Invalid email format",
    "data": null
  }
  ```
- **Server Error (500):**
  ```json
  {
    "success": false,
    "message": "Failed to save contact",
    "data": null
  }
  ```

---

## User Flow

### Happy Path (Success)
1. User navigates to Rocket Elevators homepage
2. User sees contact form
3. User fills in all required fields (fullname, email, phone)
4. User fills in optional fields (company, project, etc.)
5. User clicks "Submit" button
6. Frontend collects all form values
7. Frontend sends POST request to `/contact-us` with JSON data
8. Backend Email Validator checks email format → passes ✓
9. Backend Phone Validator checks phone format → passes ✓
10. Backend Contact Controller receives valid data
11. Controller creates Contact document and saves to MongoDB
12. MongoDB returns saved document with auto-generated `_id`
13. Controller returns 201 response with saved data
14. Frontend receives success response
15. Frontend displays success message to user: "Thank you! Your submission has been received."
16. Frontend clears form fields
17. User sees empty form, ready for next submission

### Unhappy Path #1 (Invalid Email)
1. User fills in form with invalid email: "notanemail"
2. User clicks "Submit" button
3. Frontend sends POST request to `/contact-us`
4. Backend Email Validator checks email format
5. Email "notanemail" fails validation (no @)
6. Validator returns 400 response: "Invalid email format"
7. Frontend receives error response
8. Frontend displays error message: "Error: Invalid email format"
9. Form data remains (not cleared)
10. User corrects email and resubmits

### Unhappy Path #2 (Invalid Phone)
1. User fills in form with invalid phone: "123" (too short)
2. User clicks "Submit" button
3. Frontend sends POST request to `/contact-us`
4. Backend Email Validator checks email format → passes ✓
5. Backend Phone Validator checks phone format
6. Phone "123" fails validation
7. Validator returns 400 response: "Invalid phone number"
8. Frontend receives error response
9. Frontend displays error message: "Error: Invalid phone number"
10. Form data remains
11. User corrects phone and resubmits

### Unhappy Path #3 (Database Error)
1. User fills in valid form data
2. User clicks "Submit" button
3. Frontend sends POST request to `/contact-us`
4. Both validators pass ✓
5. Controller tries to save to MongoDB
6. MongoDB connection is down (error)
7. Controller catches error
8. Controller logs error to console
9. Controller returns 500 response: "Failed to save contact"
10. Frontend receives error response
11. Frontend displays error message: "Error: Failed to save contact"
12. Form data remains
13. User can try again when database is back online

---

## Interfaces Involved

### 1. Frontend HTML Interface
**File:** `/src/public/index.html`

```html
<form id="contactForm">
  <label for="fullname">Full Name *</label>
  <input type="text" id="fullname" name="fullname" required>

  <label for="email">Email *</label>
  <input type="email" id="email" name="email" required>

  <label for="phone">Phone *</label>
  <input type="tel" id="phone" name="phone" required>

  <label for="company_name">Company Name</label>
  <input type="text" id="company_name" name="company_name">

  <label for="project_name">Project Name</label>
  <input type="text" id="project_name" name="project_name">

  <label for="department">Department</label>
  <select id="department" name="department">
    <option value="">Select Department</option>
    <option value="Sales">Residential</option>
    <option value="Engineering">Commercial</option>
    <option value="Operations">Industrial</option>
    <option value="Other">Other</option>
  </select>

  <label for="project_description">Project Description</label>
  <textarea id="project_description" name="project_description"></textarea>

  <label for="message">Message</label>
  <textarea id="message" name="message"></textarea>

  <label for="file">Attach File</label>
  <input type="file" id="file" name="file">

  <button type="submit">Submit</button>
</form>

<div id="feedbackMessage"></div>
```

### 2. Frontend JavaScript Interface
**File:** `/src/public/assets/js/contact-form.js`

```javascript
// Listen for form submission
document.getElementById('contactForm').addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();

  // Collect form data
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    // Send POST request
    const response = await fetch('/contact-us', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      // Success
      showFeedback('Thank you! Your submission has been received.', 'success');
      document.getElementById('contactForm').reset();
    } else {
      // Error
      showFeedback(`Error: ${result.message}`, 'error');
    }
  } catch (error) {
    showFeedback('Error: Unable to submit form', 'error');
  }
}

function showFeedback(message, type) {
  const feedbackDiv = document.getElementById('feedbackMessage');
  feedbackDiv.textContent = message;
  feedbackDiv.className = type; // 'success' or 'error'
  feedbackDiv.style.display = 'block';
}
```

### 3. MongoDB Schema Interface
**File:** `/src/shared/db/mongodb/schemas/contactSchema.js`

Defines the structure and validation rules for contact documents in MongoDB.

### 4. Validator Middleware Interface
**Files:** `/src/shared/middleware/emailValidator.js`, `/src/shared/middleware/phoneValidator.js`

Validate request data before it reaches the controller.

### 5. Controller Interface
**File:** `/src/features/controllers/contactController.js`

Handles business logic: create document, save to database, return response.

---

## Data & Validations

### Input Data

| Field | Type | Required | Format | Max Length | Notes |
|-------|------|----------|--------|-----------|-------|
| fullname | string | Yes | Text | 100 | Trimmed |
| email | string | Yes | Email | 100 | Lowercase, trimmed, must pass validator.isEmail() |
| phone | string | Yes | Phone | 20 | Must pass validator.isMobilePhone() |
| company_name | string | No | Text | 100 | Trimmed |
| project_name | string | No | Text | 100 | Trimmed |
| department | string | No | Text/Select | 50 | Trimmed |
| project_description | string | No | Text | 1000 | Long form text |
| message | string | No | Text | 1000 | Long form text |
| file | file | No | Binary | null | Optional, can be null |

### Validation Rules

#### Email Validation
```javascript
// Using validator.isEmail()
// Valid: john@example.com, user+tag@example.co.uk
// Invalid: john@, @example.com, john example@domain.com, "john"@example.com
```

#### Phone Validation
```javascript
// Using validator.isMobilePhone()
// Valid: +1-234-567-8901, (555) 555-5555, 5555555555
// Invalid: 123, 555, (555) 555-555
```

### Validation Flow

```
Form Submission
    ↓
Email Validator Middleware
    ├─ Invalid? → Return 400 "Invalid email format"
    └─ Valid? → Continue ↓
Phone Validator Middleware
    ├─ Invalid? → Return 400 "Invalid phone number"
    └─ Valid? → Continue ↓
Contact Controller
    ├─ Save to MongoDB
    ├─ Error? → Return 500 "Failed to save contact"
    └─ Success? → Return 201 with saved data
```

---

## Expected Behavior

### Request-Response Cycle

#### 1. Request Validation
- Email middleware runs FIRST, validates email
- Phone middleware runs SECOND, validates phone
- If any middleware fails, response is returned immediately
- If all validators pass, request continues to controller

#### 2. Data Processing
- Controller receives validated data
- Controller creates Mongoose Contact document
- Document is saved to MongoDB
- MongoDB auto-generates `_id` and timestamps

#### 3. Response
- Success: 201 status, Response Utility format, saved document data
- Error: 400 or 500 status, Response Utility format, error message

### User Experience

#### Success UX
- User sees confirmation message
- Message is clear and positive: "Thank you! Your submission has been received."
- Form clears automatically
- User can submit another form

#### Error UX
- User sees error message
- Message explains what went wrong
- Form data is NOT cleared (user doesn't lose what they typed)
- User can correct and resubmit

### Database State

#### On Success
- New Contact document is created in MongoDB
- Document has all submitted fields
- Document has auto-generated `_id`
- Document has `createdAt` timestamp
- Rocket Elevators team can later query this data for follow-up

#### On Failure
- No document is created
- Database state is unchanged
- Error is logged (console)

---

## Acceptance Criteria

### Frontend Tests
- [ ] Contact form renders on `/index.html`
- [ ] Form has all 9 input fields
- [ ] Form has submit button
- [ ] Clicking submit with valid data sends POST request
- [ ] Success message displays on successful submission
- [ ] Error message displays on validation failure
- [ ] Form clears after successful submission
- [ ] Form does NOT clear on error
- [ ] Form is usable on mobile (responsive)

### Backend Tests
- [ ] Email validator rejects invalid email formats
- [ ] Email validator accepts valid email formats
- [ ] Phone validator rejects invalid phone formats
- [ ] Phone validator accepts valid phone formats
- [ ] POST `/contact-us` creates new contact in MongoDB
- [ ] POST `/contact-us` returns 201 on success
- [ ] POST `/contact-us` returns 400 on validation failure
- [ ] POST `/contact-us` returns 500 on database error
- [ ] All fields are saved correctly to MongoDB
- [ ] Email is stored lowercase
- [ ] Fields are trimmed of whitespace
- [ ] Timestamps are auto-generated

### Integration Tests
- [ ] Can submit valid form end-to-end (frontend → backend → database)
- [ ] Data in MongoDB matches submitted form data
- [ ] Can query submitted contacts from MongoDB
- [ ] Invalid data is rejected before reaching database

### Postman Tests
- [ ] `POST /contact-us` with valid data returns 201
- [ ] `POST /contact-us` with invalid email returns 400
- [ ] `POST /contact-us` with invalid phone returns 400
- [ ] Response format matches Response Utility spec
- [ ] Saved data is queryable in MongoDB

---

## Implementation Notes

### Code References
- **Global AI Spec:** `/ai/ai-spec.md` (read first for patterns)
- **Response Utility:** `/src/shared/utils/response-util.js` (use for all responses)
- **Mongoose Documentation:** https://mongoosejs.com/
- **Validator.js:** https://github.com/validatorjs/validator.js

### Key Decisions
1. **Validation as Middleware:** Email and phone validation happen before controller logic
2. **Response Utility:** All responses formatted consistently using shared utility
3. **Data Persistence:** All submitted data is saved, including optional fields
4. **File Field:** Optional and defaults to null (actual file processing not implemented this module)
5. **Timestamps:** Auto-generated by Mongoose to track when submissions were made

### Common Mistakes to Avoid
- ❌ Validating inside controller (should be middleware)
- ❌ Returning inconsistent response format (use Response Utility)
- ❌ Not trimming email/whitespace from fields
- ❌ Not handling errors gracefully
- ❌ Clearing form on error (user loses data)
- ❌ Logging sensitive data to console

### Testing Checklist
1. Test valid submission in browser
2. Test invalid email in Postman
3. Test invalid phone in Postman
4. Verify data in MongoDB
5. Test error handling (disconnect database, try to submit)
6. Test form clears on success
7. Test form does NOT clear on error

---

**End of Contact Form Feature Specification**

This feature is complete when all acceptance criteria are met and all tests pass.
