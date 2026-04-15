/* *****************************
 * ELEVATOR CALCULATION HELPERS
 *****************************/
export const calculateResidentialElevators = (apartments, floors) => {
    const apartmentsPerFloor = Math.ceil(apartments / floors);
    const elevatorsPerBank = Math.ceil(apartmentsPerFloor / 6);
    const elevatorBanks = Math.ceil(floors / 20);
    return elevatorsPerBank * elevatorBanks;
};

export const calculateCommercialElevators = (floors, occupancy) => {
    const totalOccupants = occupancy * floors;
    const elevatorsPerBank = Math.ceil(totalOccupants / 200);
    const elevatorBanks = Math.ceil(floors / 10);
    const freightElevators = Math.ceil(floors / 10);
    return elevatorsPerBank * elevatorBanks + freightElevators;
};

export const calculateIndustrialElevators = (elevators) => {
    return Number.isInteger(elevators) ? elevators : 0;
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
