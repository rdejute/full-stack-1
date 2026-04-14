/* *****************************
 * ELEVATOR CALCULATION HELPERS
 *****************************/
export const calculateResidentialElevators = (apartments, floors, occupancy) => {
    const occupancyFactor = occupancy > 2000 ? 1.5 : 1;
    const baseElevators = Math.ceil(apartments / 6);
    return Math.ceil(baseElevators * occupancyFactor);
};

export const calculateCommercialElevators = (floors) => {
    return Math.ceil(floors / 3);
};

export const calculateIndustrialElevators = (occupancy) => {
    return Math.ceil(occupancy / 500);
};

export const calculateCost = (elevators, buildingType) => {
    const costs = {
        residential: 10000,
        commercial: 15000,
        industrial: 20000
    };

    const costPerElevator = costs[buildingType] || 10000;
    return elevators * costPerElevator;
};
