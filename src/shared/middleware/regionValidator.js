/* *********************
 * REGION VALIDATION
 *********************/

const validRegions = ['north', 'south', 'east', 'west'];

const formatAllowedRegions = () => validRegions.map(region => region.charAt(0).toUpperCase() + region.slice(1)).join(', ');

export const validateRegion = (req, res, next) => {
    const region = (req.params.region || req.query.region || '').toLowerCase();

    if (!region) {
        return res.status(400).json({
            success: false,
            error: 'Region parameter is required',
            message: 'Please provide a region as a path parameter or query parameter'
        });
    }

    if (!validRegions.includes(region)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid region',
            message: `Invalid region. Allowed regions: ${formatAllowedRegions()}`
        });
    }

    req.validatedRegion = region;
    next();
};

export default { validateRegion, validRegions };
