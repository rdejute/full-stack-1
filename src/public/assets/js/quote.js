/* *************************
 * STRICT MODE CONFIGURATION
 ***************************/
"use strict";

/* ***************************
 * CONSTANTS AND CONFIGURATION
 *****************************/
const ELEVATOR_PRICES = { standard: 8000, premium: 12000, excelium: 15000 };
const INSTALLATION_FEES = { standard: 0.1, premium: 0.15, excelium: 0.2 };
const VALID_BUILDING_TYPES = ["residential", "commercial", "industrial"];
const BACKGROUND_COLORS = { residential: "#b3d8f7", commercial: "#ffb3b3", industrial: "#d5b3e6" };

/* **********************
 * DOM ELEMENT REFERENCES
 ************************/
// Main control elements
const buildingType = document.getElementById("dropdown-building-type");
const dataSections = document.getElementById("data-sections");

// Input field containers
const divApartments = document.getElementById("div-apartments");
const divFloors = document.getElementById("div-floors");
const divOccupancies = document.getElementById("div-occupancies");
const divElevators = document.getElementById("div-elevators");

// Output display fields
const outputElevators = document.getElementById("output-elevators-needed");
const outputUnitPrice = document.getElementById("output-unit-price");
const outputUnitTotal = document.getElementById("output-unit-total");
const outputFees = document.getElementById("output-fees");
const outputCostTotal = document.getElementById("output-cost-total");

// Quote submission fields
const quoteForm = document.getElementById("quote-form");
const inputFullname = document.getElementById("input-fullname");
const inputEmail = document.getElementById("input-email");
const quoteFeedback = document.getElementById("quote-feedback");

// Card headers for dynamic background color changes
let cardHeader = document.querySelectorAll(".card-heading");

/* *****************
 * UTILITY FUNCTIONS
 *******************/
// Format numbers as currency
const formatCurrency = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

// Get numeric value from input field with fallback to 0
const getInputValue = (selector) => Number(document.querySelector(selector).value) || 0;

// Get currently selected product tier from radio buttons
const getSelectedTier = () => {
  if (document.getElementById("tier-standard").checked) return "standard";
  if (document.getElementById("tier-premium").checked) return "premium";
  if (document.getElementById("tier-excelium").checked) return "excelium";
  return null;
};

/* ************************
 * BUSINESS LOGIC FUNCTIONS
 **************************/
/**
 * Calculate number of elevators needed based on building type and parameters
 * @param {string} type - Building type (residential, commercial, industrial)
 * @returns {number} Number of elevators needed
 */
function calculateElevators(type) {
  // Validate building type
  if (!VALID_BUILDING_TYPES.includes(type)) return 0;

  if (type === "residential") {
    const floors = getInputValue("#div-floors input");
    const apartments = getInputValue("#div-apartments input");
    if (floors > 0 && apartments > 0) {
      const apartmentsPerFloor = Math.ceil(apartments / floors);
      const elevatorsPerBank = Math.ceil(apartmentsPerFloor / 6);
      const elevatorBanks = Math.ceil(floors / 20);
      return elevatorsPerBank * elevatorBanks;
    }
  } 
  
  if (type === "commercial") {
    const floors = getInputValue("#div-floors input");
    const occupancy = getInputValue("#div-occupancies input");
    if (floors > 0 && occupancy > 0) {
      const totalOccupants = occupancy * floors;
      const elevatorsPerBank = Math.ceil(totalOccupants / 200);
      const elevatorBanks = Math.ceil(floors / 10);
      const freightElevators = Math.ceil(floors / 10);
      return elevatorsPerBank * elevatorBanks + freightElevators;
    }
  } 
  
  if (type === "industrial") {
    return getInputValue("#div-elevators input");
  }
  
  return 0;
}

/* ********************
 * UI CONTROL FUNCTIONS
 **********************/
/**
 * Show/hide input fields based on selected building type
 * Manages form visibility and clears previous inputs
 */
function showFields() {
  const type = buildingType.value;
  
  // Clear all inputs in the data sections
  dataSections.querySelectorAll("input").forEach(input => 
    input.type === "radio" ? input.checked = false : input.value = ""
  );
  
  // Update card header background colors based on building type selection
  const defaultColor = "#f8f9fa";
  let selectedColor = defaultColor;
  
  // Determine the background color based on building type
  if (type !== "---Select---" && VALID_BUILDING_TYPES.includes(type)) {
    selectedColor = BACKGROUND_COLORS[type] || defaultColor;
  }
  
  // Apply the color to all card headers
  cardHeader.forEach(header => {
    header.style.backgroundColor = selectedColor;
  });

    // Hide sections if no valid type selected
  if (!VALID_BUILDING_TYPES.includes(type)) return dataSections.style.display = "none";
  
  // Show data sections
  dataSections.style.display = "block";
  
  // Hide all input field containers first
  [divApartments, divFloors, divOccupancies, divElevators].forEach(container => 
    container && (container.style.display = "none")
  );
  
  // Show relevant fields based on building type
  if (type === "residential") divApartments.style.display = divFloors.style.display = "block";
  else if (type === "commercial") divFloors.style.display = divOccupancies.style.display = "block";
  else if (type === "industrial") divElevators.style.display = "block";
}

/**
 * Main calculation function - calculates elevators needed and all pricing
 * Updates all output fields with calculated values
 */
function calculateAll() {
  const type = buildingType.value;
  const tier = getSelectedTier();
  const elevators = calculateElevators(type);

  // Calculate pricing
  const unitPrice = (tier && VALID_BUILDING_TYPES.includes(type)) ? ELEVATOR_PRICES[tier] : 0;
  const unitTotal = elevators * unitPrice;
  const installationFees = unitTotal * (INSTALLATION_FEES[tier] || 0);
  const costTotal = unitTotal + installationFees;

  // Update all output fields
  outputElevators.value = elevators;
  outputUnitPrice.value = formatCurrency(unitPrice);
  outputUnitTotal.value = formatCurrency(unitTotal);
  outputFees.value = formatCurrency(installationFees);
  outputCostTotal.value = formatCurrency(costTotal);
}

const showQuoteFeedback = (message, type = 'success') => {
  if (!quoteFeedback) return;
  quoteFeedback.textContent = message;
  quoteFeedback.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
  quoteFeedback.style.display = 'block';
};

const clearQuoteFeedback = () => {
  if (!quoteFeedback) return;
  quoteFeedback.textContent = '';
  quoteFeedback.className = '';
  quoteFeedback.style.display = 'none';
};

const buildQueryString = (params) => {
  const query = new URLSearchParams();

  if (params.apartments !== null) query.set('apartments', params.apartments);
  if (params.floors !== null) query.set('floors', params.floors);
  if (params.occupancy !== null) query.set('occupancy', params.occupancy);
  if (params.elevators !== null) query.set('elevators', params.elevators);

  return query.toString();
};

const handleQuoteSubmit = async (event) => {
  event.preventDefault();
  clearQuoteFeedback();

  const type = buildingType.value;
  const fullname = inputFullname?.value?.trim();
  const email = inputEmail?.value?.trim();
  const tier = getSelectedTier();

  if (!VALID_BUILDING_TYPES.includes(type)) {
    showQuoteFeedback('Please select a building type.', 'error');
    return;
  }

  if (!fullname || !email) {
    showQuoteFeedback('Full name and email are required.', 'error');
    return;
  }

  if (!tier) {
    showQuoteFeedback('Please select a product line tier.', 'error');
    return;
  }

  const apartments = getInputValue('#div-apartments input') || null;
  const floors = getInputValue('#div-floors input') || null;
  const occupancy = getInputValue('#div-occupancies input') || null;
  const elevators = getInputValue('#div-elevators input') || null;

  if (type === 'residential' && (!apartments || !floors || !occupancy)) {
    showQuoteFeedback('Apartments, floors, and occupancy are required for residential quotes.', 'error');
    return;
  }

  if (type === 'commercial' && (!floors || !occupancy)) {
    showQuoteFeedback('Floors and occupancy are required for commercial quotes.', 'error');
    return;
  }

  if (type === 'industrial' && !occupancy) {
    showQuoteFeedback('Occupancy is required for industrial quotes.', 'error');
    return;
  }

  const queryString = buildQueryString({ apartments, floors, occupancy, elevators });
  const url = `http://localhost:3004/calc/${type}${queryString ? `?${queryString}` : ''}`;

  const submitButton = document.getElementById('submit-quote');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'mySecretKey123'
      },
      body: JSON.stringify({ fullname, email })
    });

    const result = await response.json();

    if (!response.ok) {
      showQuoteFeedback(result.message || 'Unable to save quote.', 'error');
      return;
    }

    outputElevators.value = result.data.calculatedElevators ?? outputElevators.value;
    outputCostTotal.value = formatCurrency(result.data.estimatedCost ?? Number(outputCostTotal.value.replace(/[^0-9.-]+/g, '')));

    showQuoteFeedback('Quote saved successfully!', 'success');
  } catch (error) {
    console.error('Quote submit error:', error);
    showQuoteFeedback('Error saving quote. Please try again.', 'error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Calculate & Save Quote';
    }
  }
};

/* *********************
 * EVENT LISTENERS SETUP
 ***********************/
// Building type dropdown change event
buildingType.addEventListener("change", showFields);

if (quoteForm) {
  quoteForm.addEventListener('submit', handleQuoteSubmit);
}

// Input field changes and calculations
dataSections.addEventListener("input", calculateAll);

// Prevent negative numbers and decimals in number inputs
dataSections.addEventListener("keydown", (e) => 
  e.target.type === "number" && ["-", ".", "e", "E", "+"].includes(e.key) && e.preventDefault()
);

/* *****************
 * 8. INITIALIZATION
********************/
// Hide data sections on page load
dataSections.style.display = "none";