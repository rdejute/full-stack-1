/* **********************
 * DATA & UTILITY IMPORTS
 ************************/
import Quote from '../shared/db/mongodb/schemas/quote.schema.js';
import { calculateResidentialElevators, calculateCommercialElevators, calculateIndustrialElevators, calculateCost } from '../shared/resources/calculator.js';

/* ***************
 * ROUTE HANDLERS
 *****************/
/**
 * POST - /calc/:buildingType
 * Calculates and persists a quote for residential, commercial, or industrial buildings
 */
const postQuote = async (req, res) => {
    try {
        const buildingType = req.buildingType || req.params.buildingType?.toLowerCase();
        const { fullname, email } = req.body;
        const apartments = req.query.apartments ? Number(req.query.apartments) : null;
        const floors = req.query.floors ? Number(req.query.floors) : null;
        const occupancy = req.query.occupancy ? Number(req.query.occupancy) : null;
        const elevators = req.query.elevators ? Number(req.query.elevators) : null;

        if (!fullname || typeof fullname !== 'string' || fullname.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Full name is required', data: null });
        }

        if (!email || typeof email !== 'string' || email.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Email is required', data: null });
        }

        const parsedEmail = email.trim();
        const parsedFullname = fullname.trim();

        const validateNumber = (value) => value !== null && (!Number.isInteger(value) || value < 0);
        if (validateNumber(apartments) || validateNumber(floors) || validateNumber(occupancy) || validateNumber(elevators)) {
            return res.status(400).json({ success: false, message: 'Numeric query parameters must be non-negative integers', data: null });
        }

        let calculatedElevators;

        if (buildingType === 'residential') {
            if (apartments === null || floors === null || occupancy === null) {
                return res.status(400).json({ success: false, message: 'apartments, floors, and occupancy are required for residential quotes', data: null });
            }
            calculatedElevators = calculateResidentialElevators(apartments, floors, occupancy);
        } else if (buildingType === 'commercial') {
            if (floors === null || occupancy === null) {
                return res.status(400).json({ success: false, message: 'floors and occupancy are required for commercial quotes', data: null });
            }
            calculatedElevators = calculateCommercialElevators(floors);
        } else if (buildingType === 'industrial') {
            if (occupancy === null) {
                return res.status(400).json({ success: false, message: 'occupancy is required for industrial quotes', data: null });
            }
            calculatedElevators = calculateIndustrialElevators(occupancy);
        } else {
            return res.status(400).json({ success: false, message: 'Unsupported building type', data: null });
        }

        const estimatedCost = calculateCost(calculatedElevators, buildingType);

        const quote = await Quote.create({
            fullname: parsedFullname,
            email: parsedEmail,
            buildingType,
            apartments,
            floors,
            occupancy,
            elevators,
            calculatedElevators,
            estimatedCost
        });

        return res.status(201).json({
            success: true,
            message: 'Quote calculated and saved successfully',
            data: quote
        });
    } catch (error) {
        console.error('PostQuote error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to calculate quote', data: null });
    }
};

/* *******
 * EXPORTS
 *********/
export default {
    postQuote
};
