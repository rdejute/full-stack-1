/* **********************
 * DATA & UTILITY IMPORTS
 ************************/
import { calculResidentialElevators, calculPricing } from "../shared/utilities/calculs.js";

/* ***************
 * ROUTE HANDLERS
 *****************/
/**
 * GET - /calc-residential
 * Calculates elevator quote for residential buildings
 */
const calculResidential = (req, res) => {
    try {
        // Parse and validate query parameters
        const numberOfApartments = Number(Math.round(req.query.numberOfApartments));
        const numberOfFloors = Number(Math.round(req.query.numberOfFloors));
        const tier = req.query.tier?.toLowerCase();

        // Validate tier parameter
        const validTiers = ['standard', 'premium', 'excelium'];
        if (!validTiers.includes(tier)) {
            return res.status(404).json({ 
                error: 'Invalid tier',
                message: `Tier must be one of: ${validTiers.join(', ')}` 
            });
        }

        // Validate number inputs
        if (!Number.isInteger(numberOfApartments) || !Number.isInteger(numberOfFloors)) {
            return res.status(412).json({ 
                error: 'Invalid input',
                message: 'Number of apartments and floors must be whole numbers' 
            });
        }

        // Validate positive values
        if (numberOfApartments <= 0 || numberOfFloors <= 0) {
            return res.status(412).json({ 
                error: 'Invalid input',
                message: 'Number of apartments and floors must be greater than 0' 
            });
        }

        // Calculate number of elevators required
        const numElevators = calculResidentialElevators(numberOfApartments, numberOfFloors);
        // Calculate total pricing based on number of elevators and tier
        const pricing = calculTotalPricing(numElevators, tier);

        res.status(200).json({
            "Number of Elevators": numElevators,
            "Unit Price": pricing.unitPrice,
            "Elevator Cost": pricing.elevatorCost,
            "Installation Fee": pricing.installationFee,
            "Total Cost": pricing.totalCost,
        });
    } catch (error) {
        console.error('CalcResidential error:', error.message);
        res.status(500).json({ error: 'Server error calculating residential quote' });
    }
};

/* *******
 * EXPORTS
 *********/
export default { 
    calculResidential,
};
