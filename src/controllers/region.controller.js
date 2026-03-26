/* **************************
 * INTERNAL MODULES / SCHEMAS
 ****************************/
import regionSchema from '../shared/db/mongodb/schemas/region.schema.js';
import agentSchema from '../shared/db/mongodb/schemas/agent.schema.js';


/* **************
 * ROUTE HANDLERS
 ****************/
/**
 * GET - /region-avg
 * Calculates average rating and fee for agents in a specific region
 */
const regionAvg = async (req, res) => {
    try {
        // Validate region parameter
        const region = req.query.region?.toLowerCase();
        if (!region) return res.status(400).json({ error: 'Region parameter is required' });

        // Check for valid regions
        const validRegions = ['north', 'south', 'east', 'west'];
        if (!validRegions.includes(region)) {
            return res.status(400).json({ 
                error: 'Invalid region',
                message: `Region must be one of: ${validRegions.join(', ')}` 
            });
        }

        // Retrieve agents in the specified region
        const agentsSorted = await agentSchema.find({}).sort({ last_name: 1 });
        if (!Array.isArray(agentsSorted) || agentsSorted.length === 0) {
            return res.status(404).json({ error: 'No agents available' });
        }

        // Filter agents by region
        const filteredAgents = agentsSorted.filter(agent => 
            agent?.region?.toLowerCase() === region
        );
        if (filteredAgents.length === 0) return res.status(404).json({ error: `No agents found in region: ${region}` });

        // Calculate averages from filtered agents
        const avgRating = (filteredAgents.reduce((sum, agent) => 
            sum + Number(agent.rating), 0) / filteredAgents.length).toFixed(2);
        const avgFee = (filteredAgents.reduce((sum, agent) => 
            sum + Number(agent.fee), 0) / filteredAgents.length).toFixed(2);

        // Format fee as currency
        let formattedFee;
        FORMATTER && typeof FORMATTER.format === 'function' 
            ? formattedFee = FORMATTER.format(parseFloat(avgFee))
            : formattedFee = avgFee;

        res.status(200).json({
            region,
            rating: `${avgRating}%`,
            fee: formattedFee,
            agentCount: filteredAgents.length
        });
    } catch (error) {
        console.error('RegionAvg error:', error.message);
        res.status(500).json({ error: 'Server error calculating region averages' });
    }
};


/**
 * POST - /region-create
 * Creates a region with top 3 agents, manager, and total sales calculation
 */
const createRegion = async (req, res) => {
    try {
        // Validate required fields
        const { region, address } = req.body;
        const regionName = region.toLowerCase();

        // Check for missing region
        if (!regionName) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                message: 'region is required' 
            });
        }

        // Validate region name
        const validRegions = ['north', 'south', 'east', 'west'];
        if (!validRegions.includes(regionName)) {
            return res.status(400).json({ 
                error: 'Invalid region',
                message: `Region must be one of: ${validRegions.join(', ')}` 
            });
        }

        // Check if region already exists
        const existingRegion = await regionSchema.findOne({ region: regionName });
        if (existingRegion) {
            return res.status(409).json({ 
                error: 'Region already exists',
                message: `Region ${regionName} already exists` 
            });
        }

        // Get agents and manager for this region
        const agentsInRegion = await agentSchema.find({ 
            region: regionName, 
            manager: { $ne: true } 
        });

        // Ensure there are agents in the region
        let managerInRegion = await agentSchema.findOne({ 
            region: regionName, 
            manager: true 
        });

        // Create manager if one doesn't exist
        if (!managerInRegion) {
            managerInRegion = await agentSchema.create({
                first_name: `${regionName.charAt(0).toUpperCase() + regionName.slice(1)}`,
                last_name: 'Manager',
                email: `manager.${regionName}@company.com`,
                region: regionName,
                manager: true,
                sales: 0,
                rating: 100
            });
        }

        // Sort agents by sales, then rating, and take top 3
        const topAgents = agentsInRegion
            .sort((a, b) => {
                if (b.sales !== a.sales) return b.sales - a.sales;
                return (b.rating || 0) - (a.rating || 0);
            })
            .slice(0, 3);

        // Calculate total sales for the region
        const totalSales = agentsInRegion.reduce((sum, agent) => sum + (agent.sales || 0), 0);

        // Create new region document
        const newRegion = await regionSchema.create({
            region: regionName,
            total_sales: totalSales,
            address: address || `${regionName.charAt(0).toUpperCase() + regionName.slice(1)} Region Office`,
            manager: [managerInRegion._id],
            top_agents: topAgents.map(agent => agent._id)
        });

        // Populate manager and top agents for response
        const populatedRegion = await regionSchema.findById(newRegion._id)
            .populate('manager')
            .populate('top_agents');

        res.status(201).json({ 
            message: 'Region created successfully',
            data: populatedRegion 
        });
    } catch (error) {
        console.error('CreateRegion error:', error.message);
        res.status(500).json({ error: 'Server error creating region' });
    }
};


/**
 * GET - /region
 * Returns region information with populated manager and top agents
 */
const getRegion = async (req, res) => {
    try {
        // Validate region parameter
        const regionQuery = req.query.region?.toLowerCase();
        
        // Check for missing region
        if (!regionQuery) {
            return res.status(400).json({ 
                error: 'Region parameter is required',
                message: 'Please provide a region query parameter' 
            });
        }

        // Validate region name
        const validRegions = ['north', 'south', 'east', 'west'];
        if (!validRegions.includes(regionQuery)) {
            return res.status(400).json({ 
                error: 'Invalid region',
                message: `Region must be one of: ${validRegions.join(', ')}` 
            });
        }

        // Find region and populate references
        const regionInfo = await regionSchema.findOne({ region: regionQuery })
            .populate('manager')
            .populate('top_agents');

        // Check if region exists
        if (!regionInfo) {
            return res.status(404).json({ 
                error: 'Region not found',
                message: `No region found with name: ${regionQuery}` 
            });
        }

        res.status(200).json({
            message: `Region ${regionQuery} information retrieved successfully`,
            data: regionInfo
        });
    } catch (error) {
        console.error('GetRegion error:', error.message);
        res.status(500).json({ error: 'Server error retrieving region' });
    }
};


/**
 * GET - /all-stars
 * Returns top sales agent from each region (excludes managers)
 */
const getAllStars = async (_req, res) => {
    try {
        // Define regions to query
        const regions = ['north', 'south', 'east', 'west'];
        
        // Find top agent in each region by sales and rating
        const topAgents = await Promise.all(
            regions.map(async (region) => {
                return agentSchema.findOne({ 
                    region,
                    manager: { $ne: true }
                })
                .sort({ sales: -1, rating: -1 })
                .limit(1);
            })
        );

        // Filter out null results
        const validTopAgents = topAgents.filter(agent => agent !== null);

        // Check if any agents were found
        if (validTopAgents.length === 0) {
            return res.status(404).json({ 
                error: 'No agents found',
                message: 'No agents found in any region' 
            });
        }

        // Format response data
        const allStarsData = validTopAgents.map(agent => ({
            region: agent.region,
            agent: agent
        }));

        res.status(200).json({ 
            message: 'All-star agents retrieved successfully',
            data: allStarsData 
        });
    } catch (error) {
        console.error('GetAllStars error:', error.message);
        res.status(500).json({ error: 'Server error retrieving all-star agents' });
    }
};


/* *******
 * EXPORTS
 *********/
export default {
    regionAvg,
    createRegion,
    getRegion,
    getAllStars
};