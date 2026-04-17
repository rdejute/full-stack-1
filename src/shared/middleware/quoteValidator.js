import validator from 'validator';

/**
 * Validates quote calculation parameters
 * Ensures building type and query parameters are valid
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateQuoteParams = (req, res, next) => {
    try {
        const buildingType = req.params.buildingType;
        const query = req.query;

        // Validate building type
        const allowedBuildingTypes = ['residential', 'commercial', 'industrial'];
        if (!allowedBuildingTypes.includes(buildingType.toLowerCase())) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: `Invalid building type. Allowed types: ${allowedBuildingTypes.join(', ')}`
            });
        }

        // Validate parameters based on building type
        if (buildingType === 'residential') {
            const { apartments, floors } = query;

            // Check required parameters
            if (apartments === undefined || floors === undefined) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'apartments and floors are required for residential quotes'
                });
            }

            // Validate apartments
            const apartmentsNum = Number(apartments);
            if (isNaN(apartmentsNum) || apartmentsNum < 0 || !Number.isInteger(apartmentsNum)) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'apartments must be a non-negative integer'
                });
            }

            // Validate floors
            const floorsNum = Number(floors);
            if (isNaN(floorsNum) || floorsNum < 0 || !Number.isInteger(floorsNum)) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'floors must be a non-negative integer'
                });
            }

            // Validate business logic: apartments should be reasonable for floors
            if (apartmentsNum > 0 && floorsNum > 0 && apartmentsNum < floorsNum) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'Number of apartments should typically be greater than or equal to number of floors'
                });
            }

        } else if (buildingType === 'commercial') {
            const { floors, occupancy } = query;

            // Check required parameters
            if (floors === undefined || occupancy === undefined) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'floors and occupancy are required for commercial quotes'
                });
            }

            // Validate floors
            const floorsNum = Number(floors);
            if (isNaN(floorsNum) || floorsNum < 0 || !Number.isInteger(floorsNum)) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'floors must be a non-negative integer'
                });
            }

            // Validate occupancy
            const occupancyNum = Number(occupancy);
            if (isNaN(occupancyNum) || occupancyNum < 0 || !Number.isInteger(occupancyNum)) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'occupancy must be a non-negative integer'
                });
            }

            // Validate business logic: occupancy should be reasonable for floors
            if (floorsNum > 0 && occupancyNum > 0 && occupancyNum < floorsNum * 10) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'Occupancy seems too low for the number of floors (minimum 10 people per floor)'
                });
            }

        } else if (buildingType === 'industrial') {
            const { elevators } = query;

            // Check required parameters
            if (elevators === undefined) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'number of elevators is required for industrial quotes'
                });
            }

            // Validate elevators
            const elevatorsNum = Number(elevators);
            if (isNaN(elevatorsNum) || elevatorsNum < 0 || !Number.isInteger(elevatorsNum)) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'number of elevators must be a non-negative integer'
                });
            }

            // Validate business logic: reasonable number of elevators
            if (elevatorsNum > 50) {
                return res.status(400).json({
                    type: 'error',
                    data: null,
                    message: 'Number of elevators seems unusually high (maximum 50 for industrial quotes)'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Quote validation middleware error:', error.message);
        res.status(500).json({
            type: 'error',
            data: null,
            message: 'Internal server error in quote validation'
        });
    }
};

/**
 * Validates quote contact information
 * Ensures fullname and email are provided and valid
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateQuoteContact = (req, res, next) => {
    try {
        const { fullname, email } = req.body;

        // Validate fullname
        if (!fullname || typeof fullname !== 'string' || fullname.trim().length === 0) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Full name is required and must be a non-empty string'
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Invalid email format'
            });
        }

        // Validate field lengths
        if (fullname.length > 100) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Full name must be 100 characters or less'
            });
        }

        if (email.length > 100) {
            return res.status(400).json({
                type: 'error',
                data: null,
                message: 'Email must be 100 characters or less'
            });
        }

        next();
    } catch (error) {
        console.error('Quote contact validation middleware error:', error.message);
        res.status(500).json({
            type: 'error',
            data: null,
            message: 'Internal server error in quote contact validation'
        });
    }
};
