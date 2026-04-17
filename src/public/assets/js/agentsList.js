/**
 * Agent directory table with filtering and sorting capabilities
 * 
 * Displays sales agents by region with interactive sorting and visual
 * rating indicators. Fetches data from backend API and handles state management.
 */

// DOM element references for agent table functionality
const regionSelect = document.getElementById('region-select');
const tableBody = document.getElementById('agent-table-body');
const tableMessage = document.getElementById('agent-table-message');
const sortHeaders = document.querySelectorAll('#agent-table th.sortable');

// State management for current data and sorting
let currentAgents = [];
let currentSort = { key: 'rating', direction: 'desc' };

/**
 * Formats currency values with USD formatting
 * 
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Formats region names with proper capitalization
 * 
 * @param {string} region - The region name to format
 * @returns {string} Formatted region name
 */
const formatRegion = (region) => {
    if (!region) return '';
    return region.charAt(0).toUpperCase() + region.slice(1);
};

/**
 * Generates rating badge HTML with appropriate styling
 * 
 * @param {number} rating - The agent rating (0-100)
 * @returns {string} HTML string for rating badge
 */
const getRatingBadge = (rating) => {
    if (rating === 100) return '<span class="badge badge-success">100</span>';
    if (rating >= 90) return '<span class="badge badge-primary">' + rating + '</span>';
    return '<span class="badge badge-secondary">' + rating + '</span>';
};

/**
 * Returns CSS class for agent row based on rating
 * 
 * @param {number} rating - The agent rating (0-100)
 * @returns {string} CSS class name for row styling
 */
const getRatingRowClass = (rating) => {
    if (rating === 100) return 'agent-row-perfect';
    if (rating >= 90) return 'agent-row-excellent';
    return 'agent-row-good';
};

/**
 * Sorts agents array by specified key and direction
 * 
 * @param {Array} agents - Array of agent objects
 * @param {string} key - Property to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted array of agents
 */
const sortAgents = (agents, key, direction) => {
    return [...agents].sort((a, b) => {
        let left = a[key];
        let right = b[key];

        // Case-insensitive string comparison
        if (typeof left === 'string') {
            return direction === 'asc' ? left.toLowerCase().localeCompare(right.toLowerCase()) : right.toLowerCase().localeCompare(left.toLowerCase());
        }

        // Numeric comparison
        return direction === 'asc' ? left - right : right - left;
    });
};

/**
 * Updates visual sort indicators in table headers
 */
const updateSortIndicators = () => {
    sortHeaders.forEach((header) => {
        const sortKey = header.dataset.sort;
        const indicator = header.querySelector('.sort-indicator');

        if (!indicator) return;

        // Show indicator for currently sorted column
        if (currentSort.key === sortKey) {
            indicator.textContent = currentSort.direction === 'asc' ? ' ' : ' ';
        } else {
            indicator.textContent = '';
        }
    });
};

/**
 * Renders agents table with sorting and styling
 * 
 * @param {Array} agents - Array of agent objects to display
 */
const renderAgents = (agents) => {
    if (!tableBody) return;

    if (!agents || agents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No agents found for this region.</td></tr>';
        tableMessage.textContent = 'Try another region or add agents to the database.';
        return;
    }

    const sortedAgents = sortAgents(agents, currentSort.key, currentSort.direction);

    tableBody.innerHTML = sortedAgents
        .map(agent => {
            const rowClass = getRatingRowClass(agent.rating);
            return `
                <tr class="${rowClass}">
                    <td>${agent.first_name}</td>
                    <td>${agent.last_name}</td>
                    <td>${getRatingBadge(agent.rating)}</td>
                    <td>${formatCurrency(agent.fee)}</td>
                    <td>${formatRegion(agent.region)}</td>
                </tr>
            `;
        })
        .join('');

    // Update status message with current filter info
    tableMessage.textContent = `Showing ${sortedAgents.length} agent${sortedAgents.length === 1 ? '' : 's'} ${regionSelect.value === 'all' ? 'across all regions.' : 'in ' + formatRegion(regionSelect.value) + '.'}`;
    updateSortIndicators();
};

/**
 * Fetches agent data from backend API
 * 
 * @param {string} region - Region to filter by ('all' for all regions)
 * @returns {Promise<Array>} Array of agent objects
 * @throws {Error} If API request fails
 */
const fetchAgents = async (region) => {
    // Choose endpoint based on region filter
    const endpoint = region === 'all' ? '/agents' : `/agents-by-region/${encodeURIComponent(region)}`;
    const response = await fetch(`${window.RocketApiConfig.getBaseUrl()}${endpoint}`, {
        headers: window.RocketApiConfig.buildHeaders({ json: true, requireAuth: true })
    });

    const responseBody = await response.json();

    if (!response.ok) {
        throw new Error(responseBody.message || 'Unable to load agents.');
    }

    return responseBody.data || [];
};

/**
 * Loads and displays agent data with loading state
 */
const loadAgentTable = async () => {
    if (!tableBody || !tableMessage || !regionSelect) return;

    // Show loading state during API call
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading agent data...</td></tr>';
    tableMessage.textContent = '';

    try {
        currentAgents = await fetchAgents(regionSelect.value);
        renderAgents(currentAgents);
    } catch (error) {
        // Handle API errors gracefully
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">${error.message}</td></tr>`;
        tableMessage.textContent = 'Refresh the page or try a different region.';
    }
};

/**
 * Initializes agent table functionality and event listeners
 */
const initializeAgentTable = () => {
    if (!regionSelect) return;

    // Region filter change handler
    regionSelect.addEventListener('change', loadAgentTable);

    // Sort header click handlers
    sortHeaders.forEach((header) => {
        header.addEventListener('click', () => {
            const newKey = header.dataset.sort;
            if (!newKey) return;

            // Toggle sort direction if same column, otherwise reset to asc
            if (currentSort.key === newKey) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.key = newKey;
                currentSort.direction = 'asc';
            }

            // Re-render with new sort without API call
            renderAgents(currentAgents);
        });
    });

    // Initial data load
    loadAgentTable();
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeAgentTable);
