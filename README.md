# Rocket Genesis API

## Description
Rocket Genesis API is a Node.js and Express project for a fictional Rocket Elevators business. It serves two roles:

1. It exposes backend API endpoints for quotes, contact form submissions, agents, and regions.
2. It serves the static frontend files found in `src/public` so the website can be opened from the same server.

This project uses MongoDB to store contacts, quotes, agents, and region data. Most API routes are protected by a shared `Authorization` header.

If you are opening this project for the first time: think of it as an Express server that powers an elevator company website and stores business data in MongoDB.

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
│   └── controllers/health.test.js      # Basic unit test for the health controller
└── src/
    ├── controllers/                    # Route handler logic
    │   ├── health.controller.js        # Public test/status endpoints
    │   ├── quote.controller.js         # Quote calculation and persistence
    │   ├── contact.controller.js       # Contact form persistence
    │   ├── agent.controller.js         # Agent CRUD/read operations
    │   └── region.controller.js        # Region analytics and region records
    ├── routes/                         # Route definitions grouped by access level
    │   ├── open/health.routes.js       # Public routes: /hello, /status, /error
    │   └── protected/                  # Protected routes requiring Authorization
    ├── shared/
    │   ├── db/mongodb/                 # MongoDB connection manager and Mongoose schemas
    │   ├── middleware/                 # Auth, validation, and request logging middleware
    │   ├── resources/calculator.js     # Elevator and quote cost calculation helpers
    │   └── utilities/                  # Shared response/helper utilities
    └── public/                         # Static website files and assets served by Express
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

Note: only a small health-controller test is included right now. There is not yet full automated coverage for all endpoints.

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
Purpose: returns a plain-text server status message.

Success example:
```http
GET /status
```

Example response:
```text
Server listening on port 3004 in the development environment
```

Error example:
- This route has no custom validation error path in normal use.

#### `GET /error`
Purpose: intentionally simulates a server error for frontend testing.

Response example:
```json
{
  "type": "error",
  "data": null,
  "message": "Internal Server Error - This is a simulated error response for front-end development purposes."
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
Purpose: create a new agent.

Request example:
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
  "error": "Agent already exists",
  "message": "An agent with this email already exists"
}
```

#### `GET /agents`
Purpose: return all agents sorted by `last_name`.

Success example:
```json
{
  "message": "Agents retrieved successfully",
  "data": [
    {
      "_id": "661c1f2f2c1a2b3c4d5e6f72",
      "first_name": "Sarah",
      "last_name": "Connor",
      "email": "sarah@example.com",
      "region": "north"
    }
  ]
}
```

Error example:
```json
{
  "error": "No agents found",
  "message": "No agents are currently in the system"
}
```

#### `GET /agents-by-region/:region`
Purpose: return agents in one region sorted by rating descending.

Success example:
```http
GET /agents-by-region/north
```

```json
{
  "success": true,
  "message": "Found 2 agents in north",
  "data": [
    {
      "first_name": "Sarah",
      "last_name": "Connor",
      "region": "north",
      "rating": 92
    }
  ]
}
```

Error example:
```json
{
  "success": false,
  "error": "Invalid region",
  "message": "Invalid region. Allowed regions: North, South, East, West"
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
The author is not defined in `package.json`.

If you want this section to name a specific student, team, or company, update:
- `package.json` → `author`
- this `README.md`
