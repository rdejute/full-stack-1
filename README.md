# Rocket Elevators Full-Stack Application

## Description
This is a full-stack web application for Rocket Elevators, a fictional elevator company. The application serves as both a marketing website and a data management system with the following capabilities:

1. **Public Website**: Multi-page marketing site showcasing residential, commercial, and industrial elevator services
2. **API Backend**: RESTful endpoints for contact forms, quote calculations, agent management, and business analytics
3. **Data Persistence**: MongoDB integration for storing contacts, quotes, agents, and regional data
4. **Authentication**: Header-based authorization protecting sensitive business endpoints

The application demonstrates modern full-stack development practices including separation of concerns, standardized API responses, comprehensive testing, and responsive frontend design.

## Tech Stack
- Node.js
- Express
- MongoDB
- Mongoose
- CORS
- dotenv
- validator
- Mocha
- Chai
- Sinon
- Nodemon
- Static HTML, CSS, and JavaScript frontend in `src/public`

## Project Structure
```text
.
├── app.js                              # Main server entry point; loads env vars, connects to MongoDB, registers middleware/routes, starts Express
├── package.json                        # Project metadata, dependencies, and npm scripts
├── package-lock.json                   # Locked dependency versions
├── PostmanCollection.json              # Postman collection for manual API testing
├── CONCEPTS.md                         # Course/project notes file
├── ai/                                 # Project planning/spec notes used during development
├── test/                               # Automated tests
│   └── controllers/                  # Unit tests for API endpoints
│       ├── health.test.js           # Tests for /status and /error endpoints
│       ├── status.test.js           # Comprehensive tests for /status endpoint
│       └── error.test.js            # Comprehensive tests for /error endpoint
└── src/
    ├── controllers/                    # Route handler logic
    │   ├── health.controller.js        # Public test/status endpoints using Response Utility
    │   ├── quote.controller.js         # Quote calculation and persistence
    │   ├── contact.controller.js       # Contact form persistence
    │   ├── agent.controller.js         # Agent CRUD/read operations
    │   └── region.controller.js        # Region analytics and region records
    ├── routes/                         # Route definitions grouped by access level
    │   ├── open/health.routes.js       # Public routes: /hello, /status, /error
    │   └── protected/                  # Protected routes requiring Authorization
    │       ├── contact.routes.js        # Contact form submission
    │       ├── agent.routes.js          # Agent management endpoints
    │       ├── quote.routes.js          # Quote calculation endpoints
    │       └── region.routes.js          # Regional analytics endpoints
    ├── shared/
    │   ├── db/mongodb/                 # MongoDB connection manager and Mongoose schemas
    │   │   ├── mongo-manager.js        # Database connection management
    │   │   └── schemas/              # Data models
    │   │       ├── contact.schema.js    # Contact form data structure
    │   │       └── agent.schema.js     # Agent data structure
    │   ├── middleware/                 # Auth, validation, and request logging middleware
    │   │   ├── auth-header.middleware.js  # Authorization header validation
    │   │   └── regionValidator.js        # Region parameter validation
    │   └── utilities/                  # Shared response/helper utilities
    │       └── response-util.js          # Standardized API response format
    └── public/                         # Static website files and assets served by Express
        ├── index.html                  # Homepage with contact form
        ├── residential.html             # Residential services page with agent table
        ├── commercial.html              # Commercial services page
        ├── industrial.html               # Industrial services page
        └── assets/
            ├── js/
            │   ├── api-config.js      # Central API configuration
            │   ├── contact-form.js    # Contact form handling
            │   ├── agentsList.js      # Agent table functionality
            │   └── newsletter.js       # Newsletter subscription
            ├── css/                  # Styling files
            └── images/               # Marketing images
```

## Installation / Setup Instructions
### Prerequisites
- Node.js 18+ recommended
- npm
- A MongoDB connection string

### Local setup
1. Clone the repository.
2. Open a terminal in the project root.
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the project root.
5. Add the required environment variables shown below.
6. Start the server:

```bash
npm start
```

7. Open the API at `http://localhost:3004` by default.

### Run tests
```bash
npm test
```
Comprehensive unit test suite covering:
- `/status` endpoint with 5 test cases covering HTTP status, response format, and data structure
- `/error` endpoint with 5 test cases covering error handling and response format
- Tests validate Response Utility consistency across all endpoints
- All tests use Mocha, Chai, and Chai-HTTP for HTTP testing

## Environment Variables
The project uses a root `.env` file.

Required variables:
```env
PORT=3004
ENV_NAME=development
SECRET=your_api_secret_here
MONGODB_URL=your_mongodb_connection_string_here
```

Variable details:
- `PORT`: Port used by the Express server. Defaults to `3004` if missing.
- `ENV_NAME`: Project environment label. Used for simple status reporting.
- `SECRET`: Required request header value for protected routes.
- `MONGODB_URL`: MongoDB connection string used by Mongoose.

Important:
- Do not commit real secrets or real database credentials to version control.
- The current code supports `ENV_NAME` first and falls back to `ENV` if needed.

## Authentication
All routes except `/hello`, `/status`, and `/error` require this header:

```http
Authorization: your_api_secret_here
```

If the header is missing, the API returns `401`.
If the header is present but incorrect, the API returns `403`.

## API Documentation
### Base URL
Local:

```text
http://localhost:3004
```

### Public endpoints

#### `GET /hello`
Purpose: simple health/greeting endpoint.

Success example:
```http
GET /hello
```

```json
{
  "type": "success",
  "data": null,
  "message": "Hello World"
}
```

Error example:
- This route has no expected validation error path in normal use.

#### `GET /status`
Purpose: returns server status using standardized Response Utility format.

Success example:
```http
GET /status
Authorization: your_api_secret_here
```

Success response:
```json
{
  "type": "success",
  "data": {
    "status": "ok"
  },
  "message": "Server is running"
}
```

Error example:
- This route has no custom validation error path in normal use.

#### `GET /error`
Purpose: intentionally simulates a server error for frontend testing using Response Utility format.

Response example:
```json
{
  "type": "error",
  "data": null,
  "message": "This is a test error"
}
```

### Protected endpoints
All examples below require:

```http
Authorization: your_api_secret_here
Content-Type: application/json
```

#### `POST /contact-us`
Purpose: save a contact form submission.

Request example:
```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "phone": "5145551234",
  "company_name": "Acme Corp",
  "project_name": "Downtown Tower",
  "department": "Sales",
  "project_desc": "Need elevator modernization",
  "message": "Please contact me this week.",
  "file": null
}
```

Success example:
```json
{
  "type": "success",
  "data": {
    "_id": "661c1f2f2c1a2b3c4d5e6f70",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phone": "5145551234",
    "company_name": "Acme Corp",
    "project_name": "Downtown Tower",
    "department": "Sales",
    "project_desc": "Need elevator modernization",
    "message": "Please contact me this week.",
    "file": null,
    "createdAt": "2026-04-14T12:00:00.000Z",
    "updatedAt": "2026-04-14T12:00:00.000Z"
  },
  "message": "Contact submitted successfully"
}
```

Error example:
```json
{
  "success": false,
  "message": "Invalid phone number - must be 10 digits",
  "data": null
}
```

#### `POST /calc/residential?apartments=50&floors=10`
Purpose: calculate and save a residential quote.

Request body:
```json
{
  "fullname": "Jane Smith",
  "email": "jane@example.com"
}
```

Success example:
```json
{
  "success": true,
  "message": "Quote calculated and saved successfully",
  "data": {
    "_id": "661c1f2f2c1a2b3c4d5e6f71",
    "fullname": "Jane Smith",
    "email": "jane@example.com",
    "buildingType": "residential",
    "apartments": 50,
    "floors": 10,
    "occupancy": null,
    "elevators": null,
    "calculatedElevators": 1,
    "estimatedCost": 10000
  }
}
```

Error example:
```json
{
  "success": false,
  "message": "apartments and floors are required for residential quotes",
  "data": null
}
```

#### `POST /calc/commercial?floors=5&occupancy=100`
Purpose: calculate and save a commercial quote.

Request body:
```json
{
  "fullname": "Bob Johnson",
  "email": "bob@example.com"
}
```

Success example:
```json
{
  "success": true,
  "message": "Quote calculated and saved successfully",
  "data": {
    "buildingType": "commercial",
    "floors": 5,
    "occupancy": 100,
    "calculatedElevators": 4,
    "estimatedCost": 60000
  }
}
```

Error example:
```json
{
  "success": false,
  "message": "Numeric query parameters must be non-negative integers",
  "data": null
}
```

#### `POST /calc/industrial?elevators=3`
Purpose: calculate and save an industrial quote.

Request body:
```json
{
  "fullname": "Alice Brown",
  "email": "alice@example.com"
}
```

Success example:
```json
{
  "success": true,
  "message": "Quote calculated and saved successfully",
  "data": {
    "buildingType": "industrial",
    "elevators": 3,
    "calculatedElevators": 3,
    "estimatedCost": 60000
  }
}
```

Error example:
```json
{
  "success": false,
  "message": "number of elevators is required for industrial quotes",
  "data": null
}
```

#### `GET /email-list`
Purpose: return agent emails as a comma-separated string.

Success example:
```text
agent1@example.com, agent2@example.com, agent3@example.com
```

Error example:
```json
{
  "error": "No agents available"
}
```

#### `POST /agent-create`
Purpose: create a new agent with validation and duplicate checking.

Request example:
```http
POST /agent-create
Authorization: your_api_secret_here
Content-Type: application/json
```

Request body:
```json
{
  "first_name": "Sarah",
  "last_name": "Connor",
  "email": "sarah@example.com",
  "region": "north",
  "rating": 92,
  "fee": 7.5
}
```

Success example:
```json
{
  "type": "success",
  "message": "Agent created successfully",
  "data": {
    "first_name": "Sarah",
    "last_name": "Connor",
    "email": "sarah@example.com",
    "region": "north",
    "sales": 0,
    "rating": 92,
    "fee": 7.5,
    "manager": false
  }
}
```

Error example:
```json
{
  "type": "error",
  "data": null,
  "message": "Agent already exists"
}
```

#### `GET /agents`
Purpose: return all agents sorted by `last_name`.

Success example:
```http
GET /agents
Authorization: your_api_secret_here
```

Success response:
```json
{
  "type": "success",
  "data": [
    {
      "_id": "661c1f2f2c1a2b3c4d5e6f72",
      "first_name": "Sarah",
      "last_name": "Connor",
      "email": "sarah@example.com",
      "region": "north"
    }
  ],
  "message": "Agents retrieved successfully"
}
```

Error example:
```json
{
  "type": "error",
  "data": null,
  "message": "No agents found"
}
```

#### `GET /agents-by-region/:region`
Purpose: return agents in one region sorted by rating descending.

Success example:
```http
GET /agents-by-region/north
Authorization: your_api_secret_here
```

Success response:
```json
{
  "type": "success",
  "data": [
    {
      "first_name": "Sarah",
      "last_name": "Connor",
      "region": "north",
      "rating": 92
    }
  ],
  "message": "Found 2 agents in north"
}
```

Error example:
```json
{
  "type": "error",
  "data": null,
  "message": "Invalid region. Allowed regions: north, south, east, west"
}
```

#### `PATCH /agent-update-info/:id`
Purpose: update an agent. The id may be provided in the URL, query string, or body.

Request example:
```json
{
  "first_name": "Sara",
  "region": "west"
}
```

Success example:
```json
{
  "message": "Agent updated successfully",
  "data": {
    "_id": "661c1f2f2c1a2b3c4d5e6f72",
    "first_name": "Sara",
    "last_name": "Connor",
    "region": "west"
  }
}
```

Error example:
```json
{
  "error": "Invalid agent ID format",
  "message": "Please provide a valid MongoDB ObjectId"
}
```

#### `DELETE /agent-delete`
Purpose: delete exactly one agent matching the query/body filters.

Request example:
```http
DELETE /agent-delete?email=sarah@example.com
```

Success example:
```json
{
  "message": "Agent deleted successfully",
  "data": {
    "_id": "661c1f2f2c1a2b3c4d5e6f72",
    "email": "sarah@example.com"
  }
}
```

Error example:
```json
{
  "error": "Multiple agents matched",
  "message": "Multiple agents (2) matched the query. Please provide more specific parameters to identify a single agent"
}
```

#### `GET /region-avg`
Purpose: calculate average rating and average fee for one region.

Success example:
```json
{
  "region": "north",
  "rating": "87.50%",
  "fee": "12.40",
  "agentCount": 4
}
```

Error example:
```json
{
  "error": "Region parameter is required"
}
```

#### `POST /region-create`
Purpose: create a region record and assign a manager/top agents.

Request example:
```json
{
  "region": "north",
  "address": "123 Main Street"
}
```

Success example:
```json
{
  "message": "Region created successfully",
  "data": {
    "region": "north",
    "address": "123 Main Street",
    "total_sales": 0,
    "manager": [],
    "top_agents": []
  }
}
```

Error example:
```json
{
  "error": "Region already exists",
  "message": "Region north already exists"
}
```

#### `GET /region`
Purpose: fetch one region with populated manager and top-agent references.

Success example:
```json
{
  "message": "Region north information retrieved successfully",
  "data": {
    "region": "north",
    "address": "123 Main Street",
    "manager": [
      {
        "email": "manager.north@company.com"
      }
    ],
    "top_agents": []
  }
}
```

Error example:
```json
{
  "error": "Region not found",
  "message": "No region found with name: north"
}
```

#### `GET /all-stars`
Purpose: return the top non-manager agent from each region.

Success example:
```json
{
  "message": "All-star agents retrieved successfully",
  "data": [
    {
      "region": "north",
      "agent": {
        "first_name": "Sarah",
        "last_name": "Connor",
        "sales": 250000
      }
    }
  ]
}
```

Error example:
```json
{
  "error": "No agents found",
  "message": "No agents found in any region"
}
```

### Common auth errors for protected routes
Missing header:
```json
{
  "error": "Authorization header required",
  "message": "Please provide Authorization header"
}
```

Invalid header:
```json
{
  "error": "Access Forbidden",
  "message": "Invalid authorization token"
}
```

### Notes about the included Postman collection
`PostmanCollection.json` has been updated to match the current codebase and is useful for quick manual testing.

## Production Environment
This project does not include a dedicated production deployment script, Docker setup, reverse-proxy config, or process manager configuration. That means production deployment is applicable, but not fully packaged yet.

Minimum production steps:
1. Install dependencies with `npm install --omit=dev`.
2. Set real production values for `PORT`, `SECRET`, and `MONGODB_URL`.
3. Set `NODE_ENV=production`.
4. Run the server with Node directly:

```bash
node app.js
```

Recommended production additions:
- Use a process manager such as PM2 or systemd.
- Put the app behind Nginx or another reverse proxy.
- Restrict CORS origins to your real frontend domain instead of localhost only.
- Move secrets to a secure secret manager or deployment platform settings.
- Add monitoring, log aggregation, and health checks.

Current production limitation:
- The hardcoded CORS origins in `app.js` only allow `http://127.0.0.1:5500` and `http://localhost:5500`, so a deployed frontend would need a code change before browser requests can succeed.

## Troubleshooting
### Server fails to start
- Check that `.env` exists in the project root.
- Make sure `MONGODB_URL` is valid.
- Make sure MongoDB allows your IP address if you are using MongoDB Atlas.

### `401 Authorization header required`
- Add the `Authorization` header to every protected request.

### `403 Invalid authorization token`
- Make sure the header value exactly matches `SECRET` in `.env`.

### `/status` shows an unexpected environment name
- Check `ENV_NAME` in `.env`.
- The controller also supports `ENV` as a fallback.

### Frontend can load but API calls fail in the browser
- `app.js` only allows localhost origins in CORS.
- Update the allowed origins list for your deployed frontend URL.

### Tests are very limited
- This is expected in the current repository.
- `npm test` only covers a basic health controller scenario.

## Author
- Raina DeJute -- Student | CodeBoxx Full-Stack Development Program
- Github URL: https://github.com/rdejute/full-stack-1.git
- LinkedIn URL: www.linkedin.com/in/rainadejute
  - LinkedIn Updates: I updated my LinkedIn profile to better reflect my current focus as a Full-Stack Developer in training at CodeBoxx. Changes include a refreshed cover image, an updated headline highlighting my technical stack and role, and a revised experience section detailing my full-stack development work and project experience. I also improved my skills section to more accurately represent my technical abilities, rewrote my summary to better communicate my interests in frontend design and full-stack development, and updated my work availability settings to indicate that I am open to recruiters.


