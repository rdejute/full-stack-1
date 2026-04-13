# Feature Specification: Agent Table

**Feature Name:** Live Agent Data Table with Sorting, Filtering, and Formatting  
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
Display live agent information on the Residential Services page. Agents are fetched from MongoDB (not dummy data), and users can filter by region and sort by columns. Fees display in currency format, and ratings are color-coded based on value.

### What's Included (In Scope)
✅ Agent data stored in MongoDB  
✅ `/agents-by-region/:region` GET endpoint  
✅ Frontend HTML table with 4 columns: full name, rating, fee, region  
✅ Fee formatting as currency ($X,XXX.XX)  
✅ Rating color coding: green=100, blue=90+, purple=<90  
✅ Sorting by name, rating, and fee  
✅ Filtering by region  
✅ Region validation middleware  
✅ Postman endpoint testing  

### What's Excluded (Out of Scope)
❌ Agent CRUD operations (create/update/delete)  
❌ Agent profile pages or detail views  
❌ Agent search by name  
❌ Pagination (all agents load at once)  
❌ Export to CSV  

---

## Requirements Breakdown

### Database Requirements

#### Agent Schema (MongoDB)
**File:** `/src/shared/db/mongodb/schemas/agentSchema.js`

```javascript
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

#### Sample Data
```javascript
[
  {
    fullname: "John Smith",
    rating: 100,
    fee: 5000,
    region: "Montreal"
  },
  {
    fullname: "Sarah Johnson",
    rating: 95,
    fee: 4500,
    region: "Toronto"
  },
  {
    fullname: "Mike Davis",
    rating: 88,
    fee: 3800,
    region: "Vancouver"
  },
  {
    fullname: "Lisa Wang",
    rating: 100,
    fee: 5500,
    region: "Calgary"
  },
  {
    fullname: "Robert Brown",
    rating: 85,
    fee: 3500,
    region: "Ottawa"
  }
]
```

---

### Backend Requirements

#### Agent Controller
**File:** `/src/features/controllers/agentController.js`

```javascript
const Agent = require('../shared/db/mongodb/schemas/agentSchema');
const { sendResponse } = require('../shared/utils/response-util');

async function getAgentsByRegion(req, res) {
  try {
    const { region } = req.params;

    // Query MongoDB for agents in region
    // Note: validation middleware already verified region is valid
    const agents = await Agent.find({ region });

    // Return agents using Response Utility
    return sendResponse(
      res,
      200,
      `Found ${agents.length} agents in ${region}`,
      agents
    );
  } catch (error) {
    console.error('Error fetching agents:', error.message);
    return sendResponse(res, 500, 'Failed to fetch agents', null);
  }
}

module.exports = { getAgentsByRegion };
```

#### Agent Route
**File:** `/src/routes/agent.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { validateRegion } = require('../shared/middleware/regionValidator');
const agentController = require('../features/controllers/agentController');

// Validate region parameter, then fetch agents
router.get(
  '/agents-by-region/:region',
  validateRegion,
  agentController.getAgentsByRegion
);

module.exports = router;
```

#### API Endpoint
- **Route:** `GET /agents-by-region/:region`
- **Method:** GET
- **Path Parameter:** `region` (Montreal, Toronto, Vancouver, Calgary, or Ottawa)
- **Query Parameters:** None
- **Request Example:** `GET /agents-by-region/Montreal`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Found 2 agents in Montreal",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fullname": "John Smith",
      "rating": 100,
      "fee": 5000,
      "region": "Montreal",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "fullname": "Jane Doe",
      "rating": 92,
      "fee": 4200,
      "region": "Montreal",
      "createdAt": "2024-01-15T10:35:00Z",
      "updatedAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

**Error Response (400) - Invalid Region:**
```json
{
  "success": false,
  "message": "Invalid region. Allowed regions: Montreal, Toronto, Vancouver, Calgary, Ottawa",
  "data": null
}
```

**Error Response (500) - Database Error:**
```json
{
  "success": false,
  "message": "Failed to fetch agents",
  "data": null
}
```

---

### Frontend Requirements

#### Agent Table HTML
**File:** `/src/public/residential.html`

```html
<h1>Residential Services</h1>

<!-- Region Filter -->
<div class="filters">
  <label for="regionFilter">Filter by Region:</label>
  <select id="regionFilter">
    <option value="">All Regions</option>
    <option value="Montreal">Montreal</option>
    <option value="Toronto">Toronto</option>
    <option value="Vancouver">Vancouver</option>
    <option value="Calgary">Calgary</option>
    <option value="Ottawa">Ottawa</option>
  </select>
</div>

<!-- Agent Table -->
<table id="agentTable" class="agent-table">
  <thead>
    <tr>
      <th class="sortable" data-column="fullname">Full Name</th>
      <th class="sortable" data-column="rating">Rating</th>
      <th class="sortable" data-column="fee">Fee</th>
      <th>Region</th>
    </tr>
  </thead>
  <tbody id="agentTableBody">
    <!-- Populated by JavaScript -->
  </tbody>
</table>
```

#### Agent Table CSS
**File:** `/src/public/assets/css/agent-table.css` (or in main style.css)

```css
.agent-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.agent-table thead {
  background-color: #f0f0f0;
}

.agent-table th,
.agent-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.agent-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.agent-table th.sortable:hover {
  background-color: #e0e0e0;
}

/* Rating Color Coding */
.rating-100 {
  color: white;
  background-color: #4CAF50; /* Green */
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.rating-90plus {
  color: white;
  background-color: #2196F3; /* Blue */
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.rating-below90 {
  color: white;
  background-color: #9C27B0; /* Purple */
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.filters {
  margin-bottom: 20px;
}

.filters select {
  padding: 8px;
  margin-left: 10px;
  font-size: 14px;
}
```

#### Agent Table JavaScript
**File:** `/src/public/assets/js/agent-table.js`

```javascript
// State for table data and sorting
let agentsData = [];
let currentRegion = '';
let sortColumn = null;
let sortDirection = 'asc';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Load agents from first region or all
  loadAgents('');

  // Region filter listener
  document.getElementById('regionFilter').addEventListener('change', (e) => {
    currentRegion = e.target.value;
    loadAgents(currentRegion);
  });

  // Sortable column headers
  document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => {
      const column = header.dataset.column;
      handleSort(column);
    });
  });
});

/**
 * Load agents from backend API
 * If region is empty, load all agents from all regions
 */
async function loadAgents(region) {
  try {
    // If no region selected, fetch from all regions
    if (!region) {
      // Fetch all agents from all regions
      // Option 1: Create GET /agents endpoint (simpler)
      // Option 2: Fetch each region separately
      // For now, we'll use separate calls
      const regions = ['Montreal', 'Toronto', 'Vancouver', 'Calgary', 'Ottawa'];
      agentsData = [];

      for (const r of regions) {
        const response = await fetch(`/agents-by-region/${r}`);
        const result = await response.json();

        if (response.ok && result.data) {
          agentsData = agentsData.concat(result.data);
        }
      }
    } else {
      // Fetch agents for specific region
      const response = await fetch(`/agents-by-region/${region}`);
      const result = await response.json();

      if (response.ok && result.data) {
        agentsData = result.data;
      } else {
        console.error('Error loading agents:', result.message);
        agentsData = [];
      }
    }

    // Render table
    renderTable();
  } catch (error) {
    console.error('Error fetching agents:', error);
    agentsData = [];
  }
}

/**
 * Handle sorting when column header is clicked
 */
function handleSort(column) {
  // Toggle direction if same column clicked
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'asc';
  }

  // Sort data
  agentsData.sort((a, b) => {
    let aVal = a[column];
    let bVal = b[column];

    // Handle numeric sorting
    if (typeof aVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Handle string sorting
    aVal = String(aVal).toLowerCase();
    bVal = String(bVal).toLowerCase();

    if (sortDirection === 'asc') {
      return aVal.localeCompare(bVal);
    } else {
      return bVal.localeCompare(aVal);
    }
  });

  // Render table
  renderTable();
}

/**
 * Render table rows from agentsData
 */
function renderTable() {
  const tbody = document.getElementById('agentTableBody');
  tbody.innerHTML = ''; // Clear existing rows

  agentsData.forEach(agent => {
    const row = document.createElement('tr');

    // Full Name
    const nameCell = document.createElement('td');
    nameCell.textContent = agent.fullname;
    row.appendChild(nameCell);

    // Rating (with color coding)
    const ratingCell = document.createElement('td');
    const ratingSpan = document.createElement('span');
    ratingSpan.textContent = agent.rating;

    if (agent.rating === 100) {
      ratingSpan.className = 'rating-100'; // Green
    } else if (agent.rating >= 90) {
      ratingSpan.className = 'rating-90plus'; // Blue
    } else {
      ratingSpan.className = 'rating-below90'; // Purple
    }

    ratingCell.appendChild(ratingSpan);
    row.appendChild(ratingCell);

    // Fee (currency formatted)
    const feeCell = document.createElement('td');
    feeCell.textContent = formatCurrency(agent.fee);
    row.appendChild(feeCell);

    // Region
    const regionCell = document.createElement('td');
    regionCell.textContent = agent.region;
    row.appendChild(regionCell);

    tbody.appendChild(row);
  });
}

/**
 * Format number as currency
 * 5000 → $5,000.00
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
```

---

## User Flow

### Initial Page Load
1. User navigates to `/residential.html`
2. JavaScript runs `loadAgents('')` (empty region = load all)
3. JavaScript fetches agents from all regions using `/agents-by-region/{region}`
4. Data is stored in `agentsData` array
5. `renderTable()` displays all agents in table
6. Table shows agents from all regions
7. Region filter shows "All Regions" (default)

### Filter by Region
1. User opens region dropdown filter
2. User selects "Montreal"
3. JavaScript runs `loadAgents('Montreal')`
4. JavaScript fetches `/agents-by-region/Montreal`
5. Response returns agents in Montreal region
6. Data is stored in `agentsData` array
7. `renderTable()` displays only Montreal agents
8. User sees only Montreal agents in table

### Sort by Column
1. User sees "Full Name" column header
2. User clicks "Full Name" header
3. JavaScript runs `handleSort('fullname')`
4. Data is sorted alphabetically by fullname (A-Z)
5. `renderTable()` displays sorted agents
6. User sees agents sorted by name

### Sort Again by Same Column
1. User clicks "Full Name" header again (already sorted A-Z)
2. JavaScript toggles sort direction to descending
3. Data is sorted reverse alphabetically (Z-A)
4. `renderTable()` displays reverse-sorted agents
5. User sees agents sorted Z-A by name

### Sort by Different Column
1. User sees agents sorted by name (A-Z)
2. User clicks "Rating" header
3. JavaScript runs `handleSort('rating')`
4. Sort direction resets to ascending
5. Data is sorted by rating (0-100)
6. `renderTable()` displays agents sorted by rating (low to high)

### Currency Formatting
1. Agent fee is 5000 (number from database)
2. JavaScript calls `formatCurrency(5000)`
3. Function uses Intl.NumberFormat() API
4. Returns formatted string: "$5,000.00"
5. Table displays "$5,000.00" instead of "5000"

### Rating Color Coding
1. Agent with rating 100 gets green background (#4CAF50)
2. Agent with rating 95 gets blue background (#2196F3)
3. Agent with rating 88 gets purple background (#9C27B0)
4. Colors make it easy to scan agent quality at a glance

---

## Interfaces Involved

### 1. MongoDB Agent Schema
Defines structure of agent documents. Mongoose validates data on save.

### 2. Backend GET /agents-by-region/:region Endpoint
Returns JSON array of agents from specified region.

### 3. Frontend HTML Table
```html
<table id="agentTable">
  <thead>
    <tr>
      <th data-column="fullname">Full Name</th>
      <th data-column="rating">Rating</th>
      <th data-column="fee">Fee</th>
      <th>Region</th>
    </tr>
  </thead>
  <tbody id="agentTableBody">
    <!-- Rows inserted here -->
  </tbody>
</table>
```

### 4. Frontend JavaScript
- `loadAgents(region)` - Fetches from API
- `renderTable()` - Displays data
- `handleSort(column)` - Sorts data
- `formatCurrency(amount)` - Formats fee

### 5. Region Filter Dropdown
```html
<select id="regionFilter">
  <option value="">All Regions</option>
  <option value="Montreal">Montreal</option>
  <option value="Toronto">Toronto</option>
  <option value="Vancouver">Vancouver</option>
  <option value="Calgary">Calgary</option>
  <option value="Ottawa">Ottawa</option>
</select>
```

---

## Data & Validations

### Agent Data Structure

| Field | Type | Required | Format | Example |
|-------|------|----------|--------|---------|
| _id | ObjectId | Auto | MongoDB ID | 507f1f77bcf86cd799439011 |
| fullname | String | Yes | Text, trimmed | "John Smith" |
| rating | Number | Yes | 0-100 | 95 |
| fee | Number | Yes | Positive | 5000 |
| region | String | Yes | Enum | "Montreal" |
| createdAt | Date | Auto | ISO 8601 | 2024-01-15T10:30:00Z |
| updatedAt | Date | Auto | ISO 8601 | 2024-01-15T10:30:00Z |

### Region Validation

**Valid Regions (Case-Sensitive):**
- Montreal
- Toronto
- Vancouver
- Calgary
- Ottawa

**Invalid:**
- montreal (lowercase)
- New York (not in list)
- (empty)

**Validation Middleware:** Rejects invalid regions with 400 status before query runs

### Rating Color Mapping

| Rating | Color | Hex | CSS Class |
|--------|-------|-----|-----------|
| 100 | Green | #4CAF50 | rating-100 |
| 90-99 | Blue | #2196F3 | rating-90plus |
| 0-89 | Purple | #9C27B0 | rating-below90 |

### Fee Currency Formatting

```javascript
// Input: 5000 (number)
// Output: "$5,000.00" (string)
// Method: Intl.NumberFormat() with USD locale

new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(5000) // "$5,000.00"
```

---

## Expected Behavior

### Backend Behavior

#### GET /agents-by-region/:region
1. Request arrives with region in URL path
2. Region Validator middleware checks region is valid
3. If invalid, returns 400 and stops
4. If valid, controller runs
5. Controller queries MongoDB: `Agent.find({ region })`
6. MongoDB returns matching agents
7. Controller returns 200 with agents array
8. Frontend receives JSON

### Frontend Behavior

#### On Page Load
1. JavaScript runs
2. Calls `loadAgents('')` (empty = all regions)
3. Loops through all regions and fetches each
4. Concatenates all agents into `agentsData`
5. Renders table with all agents
6. Users see full list

#### On Region Filter Change
1. User selects region from dropdown
2. JavaScript detects change event
3. Calls `loadAgents(selectedRegion)`
4. Fetches only agents from selected region
5. Updates `agentsData`
6. Renders table with filtered agents
7. User sees only selected region

#### On Column Header Click
1. User clicks sortable column header
2. JavaScript detects click
3. Calls `handleSort(columnName)`
4. Sorts `agentsData` array
5. Renders table with sorted agents
6. User sees sorted list

#### Rendering
1. JavaScript clears table tbody
2. Loops through `agentsData`
3. For each agent, creates table row
4. Applies color coding to rating
5. Formats fee as currency
6. Inserts row into table
7. User sees updated table

---

## Acceptance Criteria

### Backend API Tests
- [ ] GET `/agents-by-region/Montreal` returns 200 with Montreal agents
- [ ] GET `/agents-by-region/Toronto` returns 200 with Toronto agents
- [ ] GET `/agents-by-region/Vancouver` returns 200 with Vancouver agents
- [ ] GET `/agents-by-region/Calgary` returns 200 with Calgary agents
- [ ] GET `/agents-by-region/Ottawa` returns 200 with Ottawa agents
- [ ] GET `/agents-by-region/NewYork` returns 400 (invalid region)
- [ ] GET `/agents-by-region/` (no region) returns error
- [ ] Response uses Response Utility format
- [ ] Response includes agent data array
- [ ] Agent data includes all fields (fullname, rating, fee, region)
- [ ] No dummy data - all agents from MongoDB

### Frontend Table Tests
- [ ] Table renders on page load
- [ ] Table has 4 column headers: Full Name, Rating, Fee, Region
- [ ] Table displays all agents from all regions on initial load
- [ ] Each row has correct agent data (fullname, rating, fee, region)
- [ ] No empty rows
- [ ] Correct number of agents displayed (matches API response count)

### Fee Formatting Tests
- [ ] Fee 5000 displays as "$5,000.00"
- [ ] Fee 4500 displays as "$4,500.00"
- [ ] Fee 3800 displays as "$3,800.00"
- [ ] Fee includes dollar sign
- [ ] Fee includes comma for thousands
- [ ] Fee includes decimal point and cents

### Rating Color Tests
- [ ] Rating 100 shows green background
- [ ] Rating 95 shows blue background
- [ ] Rating 90 shows blue background
- [ ] Rating 89 shows purple background
- [ ] Rating 85 shows purple background
- [ ] Rating colors are readable (good contrast with text)

### Sorting Tests
- [ ] Clicking "Full Name" header sorts alphabetically (A-Z)
- [ ] Clicking "Full Name" again sorts reverse (Z-A)
- [ ] Clicking "Rating" header sorts numerically low-to-high
- [ ] Clicking "Rating" again sorts high-to-low
- [ ] Clicking "Fee" header sorts numerically low-to-high
- [ ] Clicking "Fee" again sorts high-to-low
- [ ] Sorting works after filtering by region
- [ ] Column header cursor changes to pointer (indicating sortable)

### Filtering Tests
- [ ] Region dropdown displays all 5 regions
- [ ] Region dropdown starts with "All Regions" selected
- [ ] Selecting "Montreal" filters to Montreal agents only
- [ ] Selecting "Toronto" filters to Toronto agents only
- [ ] Selecting "Vancouver" filters to Vancouver agents only
- [ ] Selecting "Calgary" filters to Calgary agents only
- [ ] Selecting "Ottawa" filters to Ottawa agents only
- [ ] Selecting "All Regions" shows all agents
- [ ] Table updates immediately when region changes
- [ ] Row count updates correctly (shows "X agents loaded")

### Integration Tests
- [ ] Can filter by region, then sort (order works correctly)
- [ ] Can sort, then filter by region (table updates correctly)
- [ ] After filter, click region again, table updates
- [ ] Data matches what's in MongoDB
- [ ] No console errors

### Postman Tests
- [ ] GET /agents-by-region/Montreal returns 200
- [ ] Response includes valid JSON
- [ ] Response includes agents array
- [ ] Each agent has required fields

---

## Implementation Notes

### Code References
- **Global AI Spec:** `/ai/ai-spec.md`
- **Middleware Feature:** `/ai/features/middleware.feature.md` (region validator)
- **Response Utility:** `/src/shared/utils/response-util.js`
- **Mongoose:** https://mongoosejs.com/

### API Design Decision
The endpoint `/agents-by-region/:region` (singular) is used instead of `/agents?region=` (query param) because:
- Cleaner REST semantics (region is a resource identifier)
- Easier validation in middleware
- More cache-friendly
- Explicit in route definition

### Frontend Data Flow
```
Page Load
    ↓
loadAgents('') called
    ↓
Fetch /agents-by-region/Montreal
Fetch /agents-by-region/Toronto
Fetch /agents-by-region/Vancouver
Fetch /agents-by-region/Calgary
Fetch /agents-by-region/Ottawa
    ↓
Combine all responses into agentsData
    ↓
renderTable() displays in HTML
    ↓
User sees table with all agents
```

### Sorting Algorithm
```
User clicks "Rating" column
    ↓
handleSort('rating') called
    ↓
agentsData.sort((a, b) => {
  // Compare numeric values
  return sortDirection === 'asc' 
    ? a.rating - b.rating
    : b.rating - a.rating
})
    ↓
renderTable() shows sorted results
```

### Key Features
1. **Live Data:** All data from MongoDB (no hardcoding)
2. **Multi-Region:** Fetch from any region or all at once
3. **Interactive Sorting:** Click any column to sort
4. **Smart Filtering:** Region dropdown for quick filtering
5. **Professional Formatting:** Currency format, color codes
6. **Responsive Design:** Works on desktop and mobile

### Performance Considerations
- All agents load on initial page (no pagination)
- Sorting is client-side (fast, no API calls)
- Filtering is client-side after initial load
- If implementing pagination, move sorting to backend

---

**End of Agent Table Feature Specification**

This feature is complete when all acceptance criteria are met and the table displays live MongoDB data with proper sorting, filtering, formatting, and color coding.