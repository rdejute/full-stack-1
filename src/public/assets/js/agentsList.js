const API_BASE_URL = 'http://localhost:3004';
const AUTH_TOKEN = 'mySecretKey123';

const regionSelect = document.getElementById('region-select');
const tableBody = document.getElementById('agent-table-body');
const tableMessage = document.getElementById('agent-table-message');
const sortHeaders = document.querySelectorAll('#agent-table th.sortable');
let currentAgents = [];
let currentSort = { key: 'rating', direction: 'desc' };

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const formatRegion = (region) => {
    if (!region) return '';
    return region.charAt(0).toUpperCase() + region.slice(1);
};

const getRatingBadge = (rating) => {
    if (rating === 100) return '<span class="badge badge-success">100</span>';
    if (rating >= 90) return '<span class="badge badge-primary">' + rating + '</span>';
    return '<span class="badge badge-secondary">' + rating + '</span>';
};

const getRatingRowClass = (rating) => {
    if (rating === 100) return 'agent-row-perfect';
    if (rating >= 90) return 'agent-row-excellent';
    return 'agent-row-good';
};

const sortAgents = (agents, key, direction) => {
    return [...agents].sort((a, b) => {
        let left = a[key];
        let right = b[key];

        if (typeof left === 'string') {
            return direction === 'asc' ? left.toLowerCase().localeCompare(right.toLowerCase()) : right.toLowerCase().localeCompare(left.toLowerCase());
        }

        return direction === 'asc' ? left - right : right - left;
    });
};

const updateSortIndicators = () => {
    sortHeaders.forEach((header) => {
        const sortKey = header.dataset.sort;
        const indicator = header.querySelector('.sort-indicator');

        if (!indicator) return;

        if (currentSort.key === sortKey) {
            indicator.textContent = currentSort.direction === 'asc' ? ' ▲' : ' ▼';
        } else {
            indicator.textContent = '';
        }
    });
};

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

    tableMessage.textContent = `Showing ${sortedAgents.length} agent${sortedAgents.length === 1 ? '' : 's'} ${regionSelect.value === 'all' ? 'across all regions.' : 'in ' + formatRegion(regionSelect.value) + '.'}`;
    updateSortIndicators();
};

const fetchAgents = async (region) => {
    const endpoint = region === 'all' ? '/agents' : `/agents-by-region/${encodeURIComponent(region)}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            Authorization: AUTH_TOKEN,
            'Content-Type': 'application/json'
        }
    });

    const responseBody = await response.json();

    if (!response.ok) {
        throw new Error(responseBody.message || 'Unable to load agents.');
    }

    return responseBody.data || [];
};

const loadAgentTable = async () => {
    if (!tableBody || !tableMessage || !regionSelect) return;

    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading agent data...</td></tr>';
    tableMessage.textContent = '';

    try {
        currentAgents = await fetchAgents(regionSelect.value);
        renderAgents(currentAgents);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">${error.message}</td></tr>`;
        tableMessage.textContent = 'Refresh the page or try a different region.';
    }
};

const initializeAgentTable = () => {
    if (!regionSelect) return;

    regionSelect.addEventListener('change', loadAgentTable);

    sortHeaders.forEach((header) => {
        header.addEventListener('click', () => {
            const newKey = header.dataset.sort;
            if (!newKey) return;

            if (currentSort.key === newKey) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.key = newKey;
                currentSort.direction = 'asc';
            }

            renderAgents(currentAgents);
        });
    });

    loadAgentTable();
};

document.addEventListener('DOMContentLoaded', initializeAgentTable);
