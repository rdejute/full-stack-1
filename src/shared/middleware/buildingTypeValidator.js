/* *********************
 * BUILDING TYPE VALIDATION
 *********************/

const validBuildingTypes = ['residential', 'commercial', 'industrial'];

export const validateBuildingType = (req, res, next) => {
    const buildingType = (req.params.buildingType || '').toLowerCase();

    if (!buildingType || !validBuildingTypes.includes(buildingType)) {
        return res.status(400).json({
            success: false,
            message: `Invalid building type. Allowed values: ${validBuildingTypes.join(', ')}`,
            data: null
        });
    }

    req.buildingType = buildingType;
    next();
};

export default { validateBuildingType, validBuildingTypes };
