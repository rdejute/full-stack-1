/**
 * DATA.JS - STATIC DATA CONFIGURATION
 * Contains mock data and constants for the elevator calculation system
 * Including agents database, pricing tiers, and formatting utilities
 */

/* *********************
 * MOCK DATA - AGENTS DB
 ***********************/
export const AGENTS =
    [
        // North Region
        { "first_name": "Orlando", "last_name": "Perez", "email": "perez@rocket.elv", "region": "north", "rating": 95, "fee": 10000, "manager": true },
        { "first_name": "Brutus", "last_name": "Konway", "email": "brutus@rocket.elv", "region": "north", "rating": 92, "fee": 9000, "manager": false },
        { "first_name": "Jeff", "last_name": "Lebow", "email": "carpet@rocket.elv", "region": "north", "rating": 92, "fee": 10000, "manager": false },
        { "first_name": "Zed", "last_name": "Roles", "email": "zebra@rocket.elv", "region": "north", "rating": 100, "fee": 4321, "manager": false },
        // South Region
        { "first_name": "Roger", "last_name": "Babbel", "email": "loons@rocket.elv", "region": "south", "rating": 60, "fee": 5000, "manager": false },
        { "first_name": "Zach", "last_name": "Van Den Zilch", "email": "zach@rocket.elv", "region": "south", "rating": 70, "fee": 6000, "manager": true },
        { "first_name": "Bob", "last_name": "Boberson", "email": "bob@rocket.elv", "region": "south", "rating": 85, "fee": 10000, "manager": false },
        { "first_name": "Dee", "last_name": "Omega", "email": "omega@rocket.elv", "region": "south", "rating": 78, "fee": 7000, "manager": false },
        // East Region
        { "first_name": "Aaron", "last_name": "De Silva", "email": "aaron@rocket.elv", "region": "east", "rating": 89, "fee": 8900, "manager": false },
        { "first_name": "Bob", "last_name": "Robertson", "email": "bob2@rocket.elv", "region": "east", "rating": 85, "fee": 10000, "manager": false },
        { "first_name": "John", "last_name": "Johnson", "email": "john@rocket.elv", "region": "east", "rating": 75, "fee": 8000, "manager": true },
        { "first_name": "Elmar", "last_name": "Fade", "email": "elmar@rocket.elv", "region": "east", "rating": 95, "fee": 10000, "manager": false },
        // West Region
        { "first_name": "Brian", "last_name": "Bossman", "email": "papi@rocket.elv", "region": "west", "rating": 100, "fee": 10001, "manager": false },
        { "first_name": "George", "last_name": "Cleese", "email": "monty@rocket.elv", "region": "west", "rating": 85, "fee": 5000, "manager": false },
        { "first_name": "Tanim", "last_name": "Homaini", "email": "tanim@rocket.elv", "region": "west", "rating": 96, "fee": 10000, "manager": false },
        { "first_name": "Al", "last_name": "Stein", "email": "relative@rocket.elv", "region": "west", "rating": 54, "fee": 4000, "manager": true }
    ];

/* *********************
 * PRICING CONFIGURATION
 ***********************/
// Base price per elevator unit by tier
export const UNIT_PRICES = {
    standard: 8000,   // $8,000 per elevator unit
    premium: 12000,   // $12,000 per elevator unit
    excelium: 15000   // $15,000 per elevator unit
};

// Installation fee percentages by tier
export const INSTALL_PERCENT_FEES = {
    standard: 0.1,    // 10% installation fee
    premium: 0.15,     // 15% installation fee  
    excelium: 0.20     // 20% installation fee
};

/* ********************
 * FORMATTING UTILITIES
 **********************/
// Currency formatter for US dollars
export const FORMATTER = new Intl.NumberFormat("en-US", {
    style: "currency",     // Format as currency
    currency: "USD",       // Use US Dollar
});